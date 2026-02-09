import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProduct } from '@/lib/api/database';

/**
 * Get a single product by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
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
 * Update a product
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

    const { id } = await params;
    const body = await request.json();
    const { title, description, photos, variants, batchId } = body;

    // Verify the product belongs to the user's producer
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get user's producer
    const { data: producersData } = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!producersData || product.producerId !== (producersData as { id: string }).id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This product does not belong to you.' },
        { status: 403 }
      );
    }

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: title?.trim(),
        description: description?.trim(),
        photos: photos || [],
        batch_id: batchId || product.batchId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      // Delete existing variants
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      // Insert new variants
      if (variants.length > 0) {
        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(
            variants.map((v: { size: string; price: number; stock: number; weight: number; barcode?: string }) => ({
              product_id: id,
              size: v.size,
              price: v.price,
              stock: v.stock,
              weight: v.weight,
              barcode: v.barcode || null,
            }))
          );

        if (variantsError) {
          console.error('Error updating variants:', variantsError);
          return NextResponse.json(
            { success: false, error: 'Failed to update variants' },
            { status: 500 }
          );
        }
      }
    }

    // Fetch updated product with variants
    const updatedProductWithDetails = await getProduct(id);

    return NextResponse.json({
      success: true,
      product: updatedProductWithDetails,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
