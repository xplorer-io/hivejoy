import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const { data: producersList } = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id);

    const producerIds = (producersList as { id: string }[] | null)?.map((p) => p.id) ?? [];
    if (producerIds.length === 0 || !producerIds.includes(product.producerId)) {
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

/**
 * Delete a product
 */
export async function DELETE(
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

    // Verify the product belongs to the user's producer
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const { data: producersList } = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id);

    const producerIds = (producersList as { id: string }[] | null)?.map((p) => p.id) ?? [];
    if (producerIds.length === 0 || !producerIds.includes(product.producerId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This product does not belong to you.' },
        { status: 403 }
      );
    }

    // Delete variants first (due to foreign key constraint)
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;
    
    const { error: variantsError } = await clientToUse
      .from('product_variants')
      .delete()
      .eq('product_id', id);

    if (variantsError) {
      console.error('[DELETE /api/products] Error deleting variants:', variantsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete product variants' },
        { status: 500 }
      );
    }

    // Delete the product
    const deleteResult = await clientToUse
      .from('products')
      .delete()
      .eq('id', id);
    
    const deleteError = deleteResult.error;

    if (deleteError) {
      console.error('[DELETE /api/products] Error deleting product:', deleteError);
      return NextResponse.json(
        { 
          success: false, 
          error: deleteError.message || 'Failed to delete product. Please check if you have the necessary permissions.' 
        },
        { status: 500 }
      );
    }

    // Verify deletion by trying to fetch the product
    const verifyClient = adminClient || supabase;
    const { data: verifyData, error: verifyError } = await verifyClient
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (verifyError) {
      console.error('[DELETE /api/products] Error verifying product deletion:', verifyError);
      // Still return success since the delete operation completed
    } else if (verifyData) {
      console.error('[DELETE /api/products] WARNING: Product still exists after deletion!');
      const errorMsg = adminClient 
        ? 'Product deletion failed - product still exists in database. This may be a database constraint issue.'
        : 'Product deletion failed - product still exists in database. Please check RLS policies or configure SUPABASE_SERVICE_ROLE_KEY.';
      return NextResponse.json(
        { 
          success: false, 
          error: errorMsg
        },
        { status: 500 }
      );
    }

    console.log(`[DELETE /api/products/${id}] Product deleted successfully`);
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
