import { NextResponse } from 'next/server';

const PLATFORM_ENDPOINTS: Record<string, string> = {
  leetcode: 'leetcode',
  codechef: 'codechef',
  codeforces: 'codeforces',
};

// Server proxy: calls the external API from the server to avoid browser CORS.
export async function GET(
  _request: Request,
  { params }: { params: { platform: string; username: string } }
) {
  const platformKey = params.platform?.toLowerCase();
  const endpoint = PLATFORM_ENDPOINTS[platformKey];

  if (!endpoint) {
    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  if (!params.username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const url = `https://cp-rating-api.vercel.app/${endpoint}/${encodeURIComponent(params.username)}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error || 'Upstream error' }, { status: response.status });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}
