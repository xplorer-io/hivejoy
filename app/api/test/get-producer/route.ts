import { getProducer } from '@/lib/api/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Producer ID is required' },
        { status: 400 }
      );
    }

    const producer = await getProducer(id);

    if (!producer) {
      return NextResponse.json(
        { success: false, error: 'Producer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, producer });
  } catch (error) {
    console.error('Error fetching producer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
