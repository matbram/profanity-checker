// Demo/fallback data for when external APIs are unreachable
// This serves as both a development aid and a fallback subtitle source

export interface DemoMovie {
  id: string;
  type: 'movie' | 'tvshow';
  title: string;
  original_title: string;
  year: number;
  imdb_id: string;
  tmdb_id: number;
  poster_url: string;
  overview: string;
  vote_average: number;
  genres: string[];
  runtime: number;
  tagline: string;
}

export interface DemoAnalysis {
  profanities: Array<{
    word: string;
    count: number;
    category: string;
    severity: 'mild' | 'moderate' | 'strong';
  }>;
  summary: string;
}

export const DEMO_MOVIES: DemoMovie[] = [
  {
    id: 'demo-1',
    type: 'movie',
    title: 'The Wolf of Wall Street',
    original_title: 'The Wolf of Wall Street',
    year: 2013,
    imdb_id: 'tt0993846',
    tmdb_id: 106646,
    poster_url: 'https://image.tmdb.org/t/p/w500/pWHf4khOloNVfCxscsXFj3jj6gP.jpg',
    overview: 'A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street, corporate banking world and mob infiltration.',
    vote_average: 8.0,
    genres: ['Comedy', 'Crime', 'Drama'],
    runtime: 180,
    tagline: 'EARN. SPEND. PARTY.',
  },
  {
    id: 'demo-2',
    type: 'movie',
    title: 'Pulp Fiction',
    original_title: 'Pulp Fiction',
    year: 1994,
    imdb_id: 'tt0110912',
    tmdb_id: 680,
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    vote_average: 8.5,
    genres: ['Thriller', 'Crime'],
    runtime: 154,
    tagline: "You won't know the facts until you've seen the fiction.",
  },
  {
    id: 'demo-3',
    type: 'movie',
    title: 'Goodfellas',
    original_title: 'Goodfellas',
    year: 1990,
    imdb_id: 'tt0099685',
    tmdb_id: 769,
    poster_url: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    overview: 'The true story of Henry Hill, a half-Irish, half-Sicilian Brooklyn kid who is adopted by neighbourhood gangsters at an early age.',
    vote_average: 8.5,
    genres: ['Drama', 'Crime'],
    runtime: 145,
    tagline: 'Three Decades of Life in the Mafia.',
  },
  {
    id: 'demo-4',
    type: 'tvshow',
    title: 'Breaking Bad',
    original_title: 'Breaking Bad',
    year: 2008,
    imdb_id: 'tt0903747',
    tmdb_id: 1396,
    poster_url: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    vote_average: 8.9,
    genres: ['Drama', 'Crime', 'Thriller'],
    runtime: 47,
    tagline: 'Change the equation.',
  },
  {
    id: 'demo-5',
    type: 'tvshow',
    title: 'The Sopranos',
    original_title: 'The Sopranos',
    year: 1999,
    imdb_id: 'tt0141842',
    tmdb_id: 1398,
    poster_url: 'https://image.tmdb.org/t/p/w500/57okJJUBK0AaijxLh3RjNUaMvFI.jpg',
    overview: 'The story of New Jersey-based Italian-American mobster Tony Soprano and the difficulties he faces as he tries to balance the conflicting requirements of his home life and the criminal organization he heads.',
    vote_average: 8.6,
    genres: ['Drama', 'Crime'],
    runtime: 55,
    tagline: "It's good to be in therapy.",
  },
  {
    id: 'demo-6',
    type: 'movie',
    title: 'The Shawshank Redemption',
    original_title: 'The Shawshank Redemption',
    year: 1994,
    imdb_id: 'tt0111161',
    tmdb_id: 278,
    poster_url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
    vote_average: 8.7,
    genres: ['Drama', 'Crime'],
    runtime: 142,
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
  },
  {
    id: 'demo-7',
    type: 'movie',
    title: 'The Matrix',
    original_title: 'The Matrix',
    year: 1999,
    imdb_id: 'tt0133093',
    tmdb_id: 603,
    poster_url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    vote_average: 8.2,
    genres: ['Action', 'Science Fiction'],
    runtime: 136,
    tagline: 'Welcome to the Real World.',
  },
  {
    id: 'demo-8',
    type: 'movie',
    title: 'Deadpool',
    original_title: 'Deadpool',
    year: 2016,
    imdb_id: 'tt1431045',
    tmdb_id: 293660,
    poster_url: 'https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg',
    overview: 'A former Special Forces operative turned mercenary is subjected to a rogue experiment that leaves him with accelerated healing powers.',
    vote_average: 7.6,
    genres: ['Action', 'Comedy', 'Adventure'],
    runtime: 108,
    tagline: 'Witness the beginning of a happy ending.',
  },
  {
    id: 'demo-9',
    type: 'tvshow',
    title: 'Game of Thrones',
    original_title: 'Game of Thrones',
    year: 2011,
    imdb_id: 'tt0944947',
    tmdb_id: 1399,
    poster_url: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.",
    vote_average: 8.4,
    genres: ['Drama', 'Fantasy', 'Action & Adventure'],
    runtime: 60,
    tagline: 'Winter Is Coming.',
  },
  {
    id: 'demo-10',
    type: 'movie',
    title: 'Superbad',
    original_title: 'Superbad',
    year: 2007,
    imdb_id: 'tt0829482',
    tmdb_id: 8363,
    poster_url: 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg',
    overview: 'Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.',
    vote_average: 7.2,
    genres: ['Comedy'],
    runtime: 113,
    tagline: 'Come and get some.',
  },
  {
    id: 'demo-11',
    type: 'movie',
    title: 'The Dark Knight',
    original_title: 'The Dark Knight',
    year: 2008,
    imdb_id: 'tt0468569',
    tmdb_id: 155,
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nF2Gm.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    vote_average: 8.5,
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    runtime: 152,
    tagline: 'Why So Serious?',
  },
  {
    id: 'demo-12',
    type: 'tvshow',
    title: 'The Wire',
    original_title: 'The Wire',
    year: 2002,
    imdb_id: 'tt0306414',
    tmdb_id: 1438,
    poster_url: 'https://image.tmdb.org/t/p/w500/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
    overview: 'Told from the points of view of both the Baltimore homicide and narcotics detectives and their targets, the series captures a rare and harrowing portrait of a modern American city.',
    vote_average: 8.5,
    genres: ['Crime', 'Drama'],
    runtime: 60,
    tagline: "It's all connected.",
  },
  {
    id: 'demo-13',
    type: 'movie',
    title: 'Scarface',
    original_title: 'Scarface',
    year: 1983,
    imdb_id: 'tt0086250',
    tmdb_id: 111,
    poster_url: 'https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboXg8Ap4pol1ERa.jpg',
    overview: 'After getting a green card in exchange for assassinating a Cuban government official, Tony Montana stakes a claim on the drug trade in Miami.',
    vote_average: 8.2,
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 170,
    tagline: 'The world is yours.',
  },
  {
    id: 'demo-14',
    type: 'movie',
    title: 'Inception',
    original_title: 'Inception',
    year: 2010,
    imdb_id: 'tt1375666',
    tmdb_id: 27205,
    poster_url: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    vote_average: 8.4,
    genres: ['Action', 'Science Fiction', 'Adventure'],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
  },
  {
    id: 'demo-15',
    type: 'tvshow',
    title: 'Stranger Things',
    original_title: 'Stranger Things',
    year: 2016,
    imdb_id: 'tt4574334',
    tmdb_id: 66732,
    poster_url: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    vote_average: 8.6,
    genres: ['Drama', 'Mystery', 'Sci-Fi & Fantasy'],
    runtime: 50,
    tagline: 'It only gets stranger...',
  },
];

// Pre-built analysis results for demo movies
export const DEMO_ANALYSES: Record<string, DemoAnalysis> = {
  'demo-1': {
    // The Wolf of Wall Street
    profanities: [
      { word: 'fuck', count: 569, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 98, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 42, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 28, category: 'General Profanity', severity: 'mild' },
      { word: 'bitch', count: 24, category: 'Insults', severity: 'moderate' },
      { word: 'hell', count: 21, category: 'General Profanity', severity: 'mild' },
      { word: 'cock', count: 18, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'prick', count: 11, category: 'Insults', severity: 'moderate' },
      { word: 'dick', count: 14, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'bastard', count: 9, category: 'Insults', severity: 'moderate' },
      { word: 'crap', count: 7, category: 'Scatological', severity: 'mild' },
      { word: 'goddamn', count: 16, category: 'Religious/Profane', severity: 'mild' },
      { word: 'whore', count: 8, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'tits', count: 6, category: 'Sexual/Crude', severity: 'moderate' },
    ],
    summary: 'The Wolf of Wall Street is one of the most profanity-heavy films ever made, with the f-word appearing approximately 569 times — setting a record at the time of release. The language is pervasive throughout the film, with strong sexual references, crude humor, and constant vulgarity reflecting the excess of Wall Street culture depicted in the story.',
  },
  'demo-2': {
    // Pulp Fiction
    profanities: [
      { word: 'fuck', count: 265, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 74, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 19, category: 'General Profanity', severity: 'mild' },
      { word: 'ass', count: 33, category: 'General Profanity', severity: 'moderate' },
      { word: 'bitch', count: 15, category: 'Insults', severity: 'moderate' },
      { word: 'hell', count: 12, category: 'General Profanity', severity: 'mild' },
      { word: 'goddamn', count: 22, category: 'Religious/Profane', severity: 'mild' },
      { word: 'bastard', count: 4, category: 'Insults', severity: 'moderate' },
      { word: 'piss', count: 5, category: 'Scatological', severity: 'mild' },
      { word: 'crap', count: 3, category: 'Scatological', severity: 'mild' },
      { word: 'dick', count: 7, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'nigger', count: 18, category: 'Slurs/Hate Speech', severity: 'strong' },
    ],
    summary: 'Pulp Fiction contains extremely heavy profanity throughout its runtime. The f-word is used over 265 times. The film also contains notable use of racial slurs, particularly the n-word. The crude language is a signature element of Tarantino\'s dialogue style and permeates nearly every scene.',
  },
  'demo-3': {
    // Goodfellas
    profanities: [
      { word: 'fuck', count: 296, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 57, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 25, category: 'General Profanity', severity: 'moderate' },
      { word: 'hell', count: 14, category: 'General Profanity', severity: 'mild' },
      { word: 'damn', count: 11, category: 'General Profanity', severity: 'mild' },
      { word: 'bastard', count: 12, category: 'Insults', severity: 'moderate' },
      { word: 'prick', count: 8, category: 'Insults', severity: 'moderate' },
      { word: 'bitch', count: 6, category: 'Insults', severity: 'moderate' },
      { word: 'goddamn', count: 9, category: 'Religious/Profane', severity: 'mild' },
      { word: 'crap', count: 4, category: 'Scatological', severity: 'mild' },
      { word: 'balls', count: 7, category: 'Sexual/Crude', severity: 'mild' },
    ],
    summary: 'Goodfellas is packed with strong profanity, with nearly 300 uses of the f-word alone. The language reflects the rough mob culture depicted in the film. Profanity is used heavily in almost every scene, particularly during confrontational and violent moments.',
  },
  'demo-4': {
    // Breaking Bad
    profanities: [
      { word: 'shit', count: 184, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 89, category: 'General Profanity', severity: 'moderate' },
      { word: 'bitch', count: 76, category: 'Insults', severity: 'moderate' },
      { word: 'hell', count: 62, category: 'General Profanity', severity: 'mild' },
      { word: 'damn', count: 54, category: 'General Profanity', severity: 'mild' },
      { word: 'fuck', count: 32, category: 'General Profanity', severity: 'strong' },
      { word: 'bastard', count: 18, category: 'Insults', severity: 'moderate' },
      { word: 'crap', count: 31, category: 'Scatological', severity: 'mild' },
      { word: 'dick', count: 12, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'piss', count: 9, category: 'Scatological', severity: 'mild' },
      { word: 'goddamn', count: 15, category: 'Religious/Profane', severity: 'mild' },
      { word: 'scumbag', count: 8, category: 'Insults', severity: 'mild' },
    ],
    summary: 'Breaking Bad uses moderate to heavy profanity across its five seasons. Jesse Pinkman\'s signature use of "bitch" (76 times) is iconic. The show uses "shit" most frequently (184 times). As a cable TV show, the f-word appears less than in films but is still present, especially in later seasons.',
  },
  'demo-5': {
    // The Sopranos
    profanities: [
      { word: 'fuck', count: 892, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 426, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 198, category: 'General Profanity', severity: 'moderate' },
      { word: 'bitch', count: 87, category: 'Insults', severity: 'moderate' },
      { word: 'damn', count: 112, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 145, category: 'General Profanity', severity: 'mild' },
      { word: 'prick', count: 34, category: 'Insults', severity: 'moderate' },
      { word: 'bastard', count: 28, category: 'Insults', severity: 'moderate' },
      { word: 'goddamn', count: 67, category: 'Religious/Profane', severity: 'mild' },
      { word: 'crap', count: 52, category: 'Scatological', severity: 'mild' },
      { word: 'dick', count: 23, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'cock', count: 15, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'whore', count: 41, category: 'Sexual/Crude', severity: 'strong' },
    ],
    summary: 'The Sopranos features extremely heavy profanity across its 6 seasons and 86 episodes. The f-word appears nearly 900 times throughout the series. The language is raw and reflective of mob culture, with constant strong profanity in nearly every episode. Sexual crude language and insults are also highly prevalent.',
  },
  'demo-6': {
    // The Shawshank Redemption
    profanities: [
      { word: 'shit', count: 19, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 14, category: 'General Profanity', severity: 'mild' },
      { word: 'ass', count: 12, category: 'General Profanity', severity: 'moderate' },
      { word: 'hell', count: 11, category: 'General Profanity', severity: 'mild' },
      { word: 'bastard', count: 5, category: 'Insults', severity: 'moderate' },
      { word: 'bitch', count: 3, category: 'Insults', severity: 'moderate' },
      { word: 'goddamn', count: 4, category: 'Religious/Profane', severity: 'mild' },
      { word: 'crap', count: 2, category: 'Scatological', severity: 'mild' },
      { word: 'piss', count: 3, category: 'Scatological', severity: 'mild' },
    ],
    summary: 'The Shawshank Redemption has relatively mild profanity for an R-rated prison drama. Most language is moderate in nature, with "shit" and "damn" being the most frequent. The film relies more on its storytelling than vulgar language, keeping profanity to realistic but restrained usage.',
  },
  'demo-7': {
    // The Matrix
    profanities: [
      { word: 'shit', count: 8, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 6, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 4, category: 'General Profanity', severity: 'mild' },
      { word: 'ass', count: 3, category: 'General Profanity', severity: 'moderate' },
      { word: 'crap', count: 2, category: 'Scatological', severity: 'mild' },
      { word: 'goddamn', count: 2, category: 'Religious/Profane', severity: 'mild' },
      { word: 'jesus', count: 3, category: 'Religious/Profane', severity: 'mild' },
    ],
    summary: 'The Matrix contains surprisingly little profanity for an R-rated action film. The language is mild overall, with only a handful of moderate terms scattered throughout. The film focuses on its philosophical themes and action sequences rather than relying on vulgar dialogue.',
  },
  'demo-8': {
    // Deadpool
    profanities: [
      { word: 'fuck', count: 84, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 46, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 38, category: 'General Profanity', severity: 'moderate' },
      { word: 'bitch', count: 12, category: 'Insults', severity: 'moderate' },
      { word: 'dick', count: 15, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'damn', count: 11, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 9, category: 'General Profanity', severity: 'mild' },
      { word: 'cock', count: 5, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'douche', count: 7, category: 'Insults', severity: 'mild' },
      { word: 'crap', count: 4, category: 'Scatological', severity: 'mild' },
      { word: 'bastard', count: 3, category: 'Insults', severity: 'moderate' },
    ],
    summary: 'Deadpool lives up to its R-rating with heavy, comedic profanity. The f-word is used 84 times, and there are numerous sexual crude references throughout. The profanity is played for humor as part of Deadpool\'s irreverent character, with strong language appearing in virtually every scene.',
  },
  'demo-9': {
    // Game of Thrones
    profanities: [
      { word: 'fuck', count: 268, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 132, category: 'General Profanity', severity: 'moderate' },
      { word: 'bastard', count: 95, category: 'Insults', severity: 'moderate' },
      { word: 'whore', count: 68, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'ass', count: 54, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 38, category: 'General Profanity', severity: 'mild' },
      { word: 'bitch', count: 22, category: 'Insults', severity: 'moderate' },
      { word: 'hell', count: 28, category: 'General Profanity', severity: 'mild' },
      { word: 'cunt', count: 48, category: 'General Profanity', severity: 'strong' },
      { word: 'cock', count: 35, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'bloody', count: 31, category: 'Violence/Threats', severity: 'mild' },
      { word: 'piss', count: 15, category: 'Scatological', severity: 'mild' },
    ],
    summary: 'Game of Thrones contains very heavy profanity across its 8 seasons. The medieval setting doesn\'t hold back modern-era strong language, with the f-word used 268 times and significant use of the c-word (48 times). "Bastard" is used both as an insult and a literal term (95 times). Sexual crude language is especially prevalent.',
  },
  'demo-10': {
    // Superbad
    profanities: [
      { word: 'fuck', count: 186, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 65, category: 'General Profanity', severity: 'moderate' },
      { word: 'dick', count: 42, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'ass', count: 37, category: 'General Profanity', severity: 'moderate' },
      { word: 'bitch', count: 18, category: 'Insults', severity: 'moderate' },
      { word: 'damn', count: 12, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 15, category: 'General Profanity', severity: 'mild' },
      { word: 'pussy', count: 21, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'cock', count: 11, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'balls', count: 14, category: 'Sexual/Crude', severity: 'mild' },
      { word: 'tits', count: 8, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'crap', count: 5, category: 'Scatological', severity: 'mild' },
    ],
    summary: 'Superbad is extremely heavy on profanity and crude sexual humor, with 186 uses of the f-word. As a teen comedy, much of the language revolves around sexual references and crude humor. Dick and other sexual terms feature prominently as the characters navigate teenage awkwardness.',
  },
  'demo-11': {
    // The Dark Knight
    profanities: [
      { word: 'damn', count: 8, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 7, category: 'General Profanity', severity: 'mild' },
      { word: 'ass', count: 4, category: 'General Profanity', severity: 'moderate' },
      { word: 'shit', count: 2, category: 'General Profanity', severity: 'moderate' },
      { word: 'bastard', count: 2, category: 'Insults', severity: 'moderate' },
      { word: 'crap', count: 1, category: 'Scatological', severity: 'mild' },
    ],
    summary: 'The Dark Knight is remarkably restrained in its language for a PG-13 action film. Profanity is minimal and mild, limited to a few instances of "damn" and "hell." The film achieves its dark, intense tone through story and performance rather than vulgar language.',
  },
  'demo-12': {
    // The Wire
    profanities: [
      { word: 'fuck', count: 672, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 489, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 178, category: 'General Profanity', severity: 'moderate' },
      { word: 'bitch', count: 134, category: 'Insults', severity: 'moderate' },
      { word: 'damn', count: 98, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 82, category: 'General Profanity', severity: 'mild' },
      { word: 'nigger', count: 156, category: 'Slurs/Hate Speech', severity: 'strong' },
      { word: 'nigga', count: 213, category: 'Slurs/Hate Speech', severity: 'strong' },
      { word: 'dick', count: 34, category: 'Sexual/Crude', severity: 'moderate' },
      { word: 'goddamn', count: 56, category: 'Religious/Profane', severity: 'mild' },
      { word: 'piss', count: 22, category: 'Scatological', severity: 'mild' },
      { word: 'bastard', count: 19, category: 'Insults', severity: 'moderate' },
    ],
    summary: 'The Wire features extremely heavy profanity across its 5 seasons, reflecting the gritty realism of Baltimore street life and police culture. The f-word appears 672 times and racial slurs are prevalent (369 combined uses of n-word variations). The show\'s famous "fuck" scene in Season 1 uses only that word for an entire crime scene investigation.',
  },
  'demo-13': {
    // Scarface
    profanities: [
      { word: 'fuck', count: 226, category: 'General Profanity', severity: 'strong' },
      { word: 'shit', count: 31, category: 'General Profanity', severity: 'moderate' },
      { word: 'ass', count: 18, category: 'General Profanity', severity: 'moderate' },
      { word: 'bastard', count: 9, category: 'Insults', severity: 'moderate' },
      { word: 'damn', count: 8, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 6, category: 'General Profanity', severity: 'mild' },
      { word: 'cock', count: 4, category: 'Sexual/Crude', severity: 'strong' },
      { word: 'bitch', count: 3, category: 'Insults', severity: 'moderate' },
      { word: 'prick', count: 5, category: 'Insults', severity: 'moderate' },
    ],
    summary: 'Scarface is infamous for its profanity, with the f-word used approximately 226 times. Tony Montana\'s explosive dialogue is filled with strong language that became iconic in pop culture. The profanity is concentrated in confrontational and violent scenes.',
  },
  'demo-14': {
    // Inception
    profanities: [
      { word: 'shit', count: 9, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 5, category: 'General Profanity', severity: 'mild' },
      { word: 'hell', count: 5, category: 'General Profanity', severity: 'mild' },
      { word: 'ass', count: 3, category: 'General Profanity', severity: 'moderate' },
      { word: 'bastard', count: 2, category: 'Insults', severity: 'moderate' },
      { word: 'bitch', count: 1, category: 'Insults', severity: 'moderate' },
    ],
    summary: 'Inception is very mild in its use of profanity. The film focuses on its complex heist-within-dreams storyline and uses only occasional mild to moderate language. It\'s one of Nolan\'s more restrained films language-wise.',
  },
  'demo-15': {
    // Stranger Things
    profanities: [
      { word: 'shit', count: 78, category: 'General Profanity', severity: 'moderate' },
      { word: 'damn', count: 45, category: 'General Profanity', severity: 'mild' },
      { word: 'ass', count: 38, category: 'General Profanity', severity: 'moderate' },
      { word: 'hell', count: 52, category: 'General Profanity', severity: 'mild' },
      { word: 'bitch', count: 12, category: 'Insults', severity: 'moderate' },
      { word: 'crap', count: 19, category: 'Scatological', severity: 'mild' },
      { word: 'bastard', count: 8, category: 'Insults', severity: 'moderate' },
      { word: 'piss', count: 5, category: 'Scatological', severity: 'mild' },
      { word: 'goddamn', count: 11, category: 'Religious/Profane', severity: 'mild' },
      { word: 'dick', count: 6, category: 'Sexual/Crude', severity: 'moderate' },
    ],
    summary: 'Stranger Things has moderate profanity spread across its seasons. The language is mostly in the mild to moderate range, fitting for a show that balances teen drama with sci-fi horror. "Shit" and "hell" are the most common, with the show avoiding the heaviest language given its younger cast members.',
  },
};

export function searchDemoMovies(query: string): DemoMovie[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  return DEMO_MOVIES.filter(
    (movie) =>
      movie.title.toLowerCase().includes(q) ||
      movie.original_title.toLowerCase().includes(q) ||
      movie.genres.some((g) => g.toLowerCase().includes(q)) ||
      movie.year.toString().includes(q)
  );
}

export function getDemoAnalysis(demoId: string): DemoAnalysis | null {
  return DEMO_ANALYSES[demoId] || null;
}
