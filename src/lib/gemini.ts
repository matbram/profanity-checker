import { ProfanityCategory, ProfanityWord } from '@/types';
import { createLogger } from './logger';

const log = createLogger('gemini');

function getApiUrl(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  log.debug(`Gemini API key check: ${apiKey ? `present (${apiKey.substring(0, 10)}...)` : 'MISSING'}`);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
}

interface GeminiProfanityResult {
  profanities: Array<{
    word: string;
    count: number;
    category: string;
    severity: 'mild' | 'moderate' | 'strong';
  }>;
  summary: string;
}

function chunkText(text: string, maxChars: number = 50000): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChars;
    if (end < text.length) {
      // Try to break at a space
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

export async function analyzeProfanity(
  subtitleText: string,
  title: string
): Promise<{ categories: ProfanityCategory[]; summary: string }> {
  const chunks = chunkText(subtitleText);
  log.info(`Analyzing "${title}": ${subtitleText.length} chars split into ${chunks.length} chunk(s)`);
  const allProfanities: Map<string, ProfanityWord> = new Map();
  let overallSummary = '';

  for (let i = 0; i < chunks.length; i++) {
    log.info(`Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
    const result = await analyzeChunk(chunks[i], title, i + 1, chunks.length);
    log.info(`Chunk ${i + 1} result: ${result.profanities.length} profanities found`);

    for (const prof of result.profanities) {
      const key = prof.word.toLowerCase();
      const existing = allProfanities.get(key);
      if (existing) {
        existing.count += prof.count;
      } else {
        allProfanities.set(key, {
          word: prof.word.toLowerCase(),
          count: prof.count,
          category: prof.category,
          severity: prof.severity,
        });
      }
    }

    if (i === chunks.length - 1 || chunks.length === 1) {
      overallSummary = result.summary;
    }
  }

  // Group by category
  const categoryMap = new Map<string, ProfanityWord[]>();
  for (const word of allProfanities.values()) {
    if (!categoryMap.has(word.category)) {
      categoryMap.set(word.category, []);
    }
    categoryMap.get(word.category)!.push(word);
  }

  const categoryIcons: Record<string, string> = {
    'Sexual/Crude': '🔞',
    'Religious/Profane': '⛪',
    'Slurs/Hate Speech': '🚫',
    'General Profanity': '🤬',
    'Violence/Threats': '⚔️',
    'Scatological': '💩',
    'Insults': '😤',
    'Substance References': '🚬',
  };

  const categorySeverity: Record<string, 'mild' | 'moderate' | 'strong'> = {
    'Sexual/Crude': 'strong',
    'Religious/Profane': 'mild',
    'Slurs/Hate Speech': 'strong',
    'General Profanity': 'moderate',
    'Violence/Threats': 'moderate',
    'Scatological': 'mild',
    'Insults': 'mild',
    'Substance References': 'mild',
  };

  const categories: ProfanityCategory[] = [];
  for (const [name, words] of categoryMap) {
    words.sort((a, b) => b.count - a.count);
    categories.push({
      name,
      words,
      totalCount: words.reduce((sum, w) => sum + w.count, 0),
      severity: categorySeverity[name] || 'moderate',
      icon: categoryIcons[name] || '⚠️',
    });
  }

  categories.sort((a, b) => b.totalCount - a.totalCount);

  return { categories, summary: overallSummary };
}

async function analyzeChunk(
  text: string,
  title: string,
  chunkNum: number,
  totalChunks: number
): Promise<GeminiProfanityResult> {
  const prompt = `You are a profanity detection expert. Analyze the following subtitle text from "${title}" and identify ALL profanities, vulgar language, obscenities, slurs, crude language, and offensive terms.

IMPORTANT RULES:
- Catch ALL variations and misspellings of profanity (e.g., "f***", "sh1t", "a$$", "b!tch")
- Count EVERY occurrence of each word accurately
- Categorize each word into one of these categories:
  - "General Profanity" (f-word, s-word, damn, hell, ass, etc.)
  - "Sexual/Crude" (sexually explicit terms)
  - "Religious/Profane" (blasphemy, taking deity names in vain)
  - "Slurs/Hate Speech" (racial, ethnic, homophobic slurs)
  - "Violence/Threats" (violent or threatening language)
  - "Scatological" (bathroom/bodily function crude terms)
  - "Insults" (b*tch, bastard, idiot used as insults, etc.)
  - "Substance References" (crude drug/alcohol references)
- Rate severity as: "mild" (damn, hell, crap), "moderate" (s-word, ass, bastard), "strong" (f-word, slurs, c-word)
- Be thorough - do not miss any profanity
- This is chunk ${chunkNum} of ${totalChunks}

Return a JSON object with this EXACT structure:
{
  "profanities": [
    {"word": "the word", "count": number_of_occurrences, "category": "category name", "severity": "mild|moderate|strong"}
  ],
  "summary": "A brief summary of the profanity level found"
}

Subtitle text to analyze:
${text}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const apiUrl = getApiUrl();
  log.info(`Sending to Gemini (chunk ${chunkNum}/${totalChunks}, prompt ~${text.length} chars)`);

  const start = Date.now();
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const elapsed = Date.now() - start;
  log.info(`Gemini response: ${res.status} (${elapsed}ms)`);

  if (!res.ok) {
    const errorText = await res.text();
    log.error(`Gemini API error: ${errorText.substring(0, 500)}`);
    throw new Error(`Gemini API failed: ${res.status} - ${errorText.substring(0, 200)}`);
  }

  const json = await res.json();
  const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  const finishReason = json.candidates?.[0]?.finishReason;
  log.info(`Gemini finish reason: ${finishReason}, response length: ${responseText?.length || 0}`);

  if (!responseText) {
    log.error('No text in Gemini response', { candidates: json.candidates });
    throw new Error('No response from Gemini');
  }

  try {
    const parsed = JSON.parse(responseText);
    log.info(`Parsed ${parsed.profanities?.length || 0} profanities from Gemini`);
    return parsed;
  } catch (parseErr) {
    log.error(`Failed to parse Gemini JSON response: ${(parseErr as Error).message}`, {
      responsePreview: responseText.substring(0, 300),
    });
    return { profanities: [], summary: 'Analysis failed to parse.' };
  }
}

export function calculateRating(
  categories: ProfanityCategory[]
): { rating: 'Clean' | 'Mild' | 'Moderate' | 'Heavy' | 'Extreme'; score: number } {
  const total = categories.reduce((sum, c) => sum + c.totalCount, 0);

  const strongCount = categories
    .filter((c) => c.severity === 'strong')
    .reduce((sum, c) => sum + c.totalCount, 0);

  const moderateCount = categories
    .filter((c) => c.severity === 'moderate')
    .reduce((sum, c) => sum + c.totalCount, 0);

  // Weighted score: strong=3, moderate=2, mild=1
  const score = Math.min(100, Math.round(
    ((strongCount * 3 + moderateCount * 2 + (total - strongCount - moderateCount)) / Math.max(total, 1)) *
    Math.min(total, 100)
  ));

  if (total === 0) return { rating: 'Clean', score: 0 };
  if (score <= 15) return { rating: 'Mild', score };
  if (score <= 40) return { rating: 'Moderate', score };
  if (score <= 70) return { rating: 'Heavy', score };
  return { rating: 'Extreme', score };
}
