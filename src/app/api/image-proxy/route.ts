import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'image.tmdb.org',
  'www.opensubtitles.com',
  'www.opensubtitles.org',
  's.opensubtitles.org',
  'm.media-amazon.com',
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTPS URLs allowed' }, { status: 400 });
  }

  const isAllowed = ALLOWED_HOSTS.some(
    (host) => parsed.hostname === host || parsed.hostname.endsWith('.' + host)
  );
  if (!isAllowed) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ProfanityScreen/1.0' },
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
