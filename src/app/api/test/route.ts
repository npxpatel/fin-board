import { NextRequest, NextResponse } from 'next/server';
import { flattenObject } from '@/lib/data-mapper';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`,
      });
    }

    const data = await response.json();
    const fields = flattenObject(data);

    return NextResponse.json({
      success: true,
      fields,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    });
  }
}
