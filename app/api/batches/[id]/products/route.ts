import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Get all products using a specific batch
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { id: batchId } = await params;

    // Get user's producer
    const { data: producersData } = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!producersData || (producersData as { id: string }[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all products using this batch
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, status, batch_id')
      .eq('batch_id', batchId);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    console.error('Error fetching products for batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Remove batch_id from products (set to null)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { id: batchId } = await params;
    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs are required' },
        { status: 400 }
      );
    }

    // Get user's producer
    const { data: producersData } = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!producersData || (producersData as { id: string }[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const producerIds = (producersData as { id: string }[]).map(p => p.id);

    // Verify all products belong to the user's producer
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, producer_id')
      .in('id', productIds)
      .in('producer_id', producerIds)
      .eq('batch_id', batchId);

    if (productsError) {
      console.error('Error verifying products:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify products' },
        { status: 500 }
      );
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some products not found or do not belong to you' },
        { status: 403 }
      );
    }

    // Remove batch_id from products
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;
    
    const { error: updateError } = await clientToUse
      .from('products')
      .update({ batch_id: null })
      .in('id', productIds);

    if (updateError) {
      console.error('Error updating products:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to remove batch from products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Removed batch from ${productIds.length} product(s)`,
    });
  } catch (error) {
    console.error('Error removing batch from products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
