import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductsByProducer } from '@/lib/api/database';

/**
 * Get all products for a specific producer
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { id: producerId } = await params;

    // Get products for this producer (including all statuses)
    const products = await getProductsByProducer(producerId, true);

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
