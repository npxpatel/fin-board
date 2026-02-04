import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing URL parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch API data',
      },
      { status: 502 }
    );
  }
}
