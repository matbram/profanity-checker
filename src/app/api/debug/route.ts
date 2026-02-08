import { NextResponse } from 'next/server';
import { getRecentLogs } from '@/lib/logger';

export async function GET() {
  const envCheck = {
    OPENSUBTITLES_API_KEY: process.env.OPENSUBTITLES_API_KEY
      ? `SET (${process.env.OPENSUBTITLES_API_KEY.substring(0, 6)}...${process.env.OPENSUBTITLES_API_KEY.substring(process.env.OPENSUBTITLES_API_KEY.length - 4)})`
      : 'NOT SET',
    OPENSUBTITLES_USERNAME: process.env.OPENSUBTITLES_USERNAME ? 'SET' : 'NOT SET',
    OPENSUBTITLES_PASSWORD: process.env.OPENSUBTITLES_PASSWORD ? 'SET' : 'NOT SET',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
      ? `SET (${process.env.GEMINI_API_KEY.substring(0, 8)}...)`
      : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  // Quick connectivity test to OpenSubtitles
  let opensubtitlesStatus = 'unknown';
  let opensubtitlesLatency = 0;
  try {
    const start = Date.now();
    const res = await fetch('https://api.opensubtitles.com/api/v1/infos/languages', {
      headers: {
        'Api-Key': process.env.OPENSUBTITLES_API_KEY || '',
        'User-Agent': 'ProfanityChecker v1.0',
      },
      signal: AbortSignal.timeout(5000),
    });
    opensubtitlesLatency = Date.now() - start;
    opensubtitlesStatus = `${res.status} ${res.statusText} (${opensubtitlesLatency}ms)`;
  } catch (err) {
    opensubtitlesStatus = `FAILED: ${(err as Error).message}`;
  }

  // Quick connectivity test to Gemini
  let geminiStatus = 'unknown';
  let geminiLatency = 0;
  try {
    const start = Date.now();
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY || ''}`,
      { signal: AbortSignal.timeout(5000) }
    );
    geminiLatency = Date.now() - start;
    geminiStatus = `${res.status} ${res.statusText} (${geminiLatency}ms)`;
  } catch (err) {
    geminiStatus = `FAILED: ${(err as Error).message}`;
  }

  const recentLogs = getRecentLogs(100);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    connectivity: {
      opensubtitles: opensubtitlesStatus,
      gemini: geminiStatus,
    },
    recentLogs: recentLogs.map((l) => ({
      time: l.timestamp,
      level: l.level,
      module: l.module,
      message: l.message,
      data: l.data,
      ms: l.durationMs,
    })),
    logCount: recentLogs.length,
  });
}
