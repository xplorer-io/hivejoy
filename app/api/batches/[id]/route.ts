import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBatch } from '@/lib/api/database';

/**
 * Get a single batch by ID
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

    const { id } = await params;
    const batch = await getBatch(id);

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Verify the batch belongs to the user's producer
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
    if (!producerIds.includes(batch.producerId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This batch does not belong to you.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, batch });
  } catch (error) {
    console.error('Error fetching batch:', error);
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
 * Update a batch
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
    const { region, harvestDate, extractionDate, floralSourceTags, notes, status } = body;

    // Verify the batch belongs to the user's producer
    const batch = await getBatch(id);
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

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
    if (!producerIds.includes(batch.producerId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This batch does not belong to you.' },
        { status: 403 }
      );
    }

    // Update batch
    const updateData: Record<string, string | string[] | null | undefined> = {
      updated_at: new Date().toISOString(),
    };

    if (region !== undefined) updateData.region = region.trim();
    if (harvestDate !== undefined) updateData.harvest_date = harvestDate;
    if (extractionDate !== undefined) updateData.extraction_date = extractionDate;
    if (floralSourceTags !== undefined) updateData.floral_source_tags = floralSourceTags;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (status !== undefined) updateData.status = status;

    const { data: updatedBatch, error: updateError } = await supabase
      .from('batches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating batch:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update batch' },
        { status: 500 }
      );
    }

    // Map to Batch format
    const result = {
      id: updatedBatch.id,
      producerId: updatedBatch.producer_id,
      region: updatedBatch.region,
      harvestDate: updatedBatch.harvest_date,
      extractionDate: updatedBatch.extraction_date,
      floralSourceTags: updatedBatch.floral_source_tags || [],
      notes: updatedBatch.notes,
      status: updatedBatch.status,
      createdAt: updatedBatch.created_at,
      updatedAt: updatedBatch.updated_at,
    };

    return NextResponse.json({
      success: true,
      batch: result,
    });
  } catch (error) {
    console.error('Error updating batch:', error);
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
 * Delete a batch
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

    // Verify the batch belongs to the user's producer
    const batch = await getBatch(id);
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

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
    if (!producerIds.includes(batch.producerId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This batch does not belong to you.' },
        { status: 403 }
      );
    }

    // Check if any products are using this batch
    const { data: productsUsingBatch, error: productsError } = await supabase
      .from('products')
      .select('id, title, status')
      .eq('batch_id', id);

    if (productsError) {
      console.error('Error checking products:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check batch usage' },
        { status: 500 }
      );
    }

    const productsList = Array.isArray(productsUsingBatch) ? productsUsingBatch : [];
    if (productsList.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete batch. It is being used by ${productsList.length} product(s). Please remove or reassign products first.`,
          products: productsList.map((p: { id: string; title: string; status: string }) => ({
            id: p.id,
            title: p.title,
            status: p.status,
          }))
        },
        { status: 400 }
      );
    }

    // Delete the batch
    // Try using admin client first to bypass RLS, fall back to regular client
    const adminClient = createAdminClient();
    let deleteError;
    let deleteResult;
    
    if (adminClient) {
      console.log('[DELETE /api/batches] Using admin client to delete batch');
      // Use admin client to bypass RLS
      deleteResult = await adminClient
        .from('batches')
        .delete()
        .eq('id', id);
      deleteError = deleteResult.error;
    } else {
      console.log('[DELETE /api/batches] Admin client not available, using regular client');
      // Fall back to regular client (will work if RLS policy exists)
      deleteResult = await supabase
        .from('batches')
        .delete()
        .eq('id', id);
      deleteError = deleteResult.error;
    }

    if (deleteError) {
      console.error('[DELETE /api/batches] Error deleting batch:', deleteError);
      return NextResponse.json(
        { 
          success: false, 
          error: deleteError.message || 'Failed to delete batch. Please check if you have the necessary permissions or run the migration to add the DELETE policy.' 
        },
        { status: 500 }
      );
    }

    // Check if any rows were actually deleted
    if (deleteResult && 'count' in deleteResult && deleteResult.count === 0) {
      console.error('[DELETE /api/batches] No rows deleted - likely RLS policy issue');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Batch deletion failed - no rows were deleted. This usually means the RLS DELETE policy is missing. Please run the migration: migrations/add_batches_delete_policy.sql' 
        },
        { status: 500 }
      );
    }

    // Verify deletion by trying to fetch the batch
    const verifyClient = adminClient || supabase;
    const { data: verifyData, error: verifyError } = await verifyClient
      .from('batches')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (verifyError) {
      console.error('[DELETE /api/batches] Error verifying batch deletion:', verifyError);
      // Still return success since the delete operation completed
    } else if (verifyData) {
      console.error('[DELETE /api/batches] WARNING: Batch still exists after deletion!');
      const errorMsg = adminClient 
        ? 'Batch deletion failed - batch still exists in database. This may be a database constraint issue.'
        : 'Batch deletion failed - batch still exists in database. Please run the migration: migrations/add_batches_delete_policy.sql or configure SUPABASE_SERVICE_ROLE_KEY.';
      return NextResponse.json(
        { 
          success: false, 
          error: errorMsg
        },
        { status: 500 }
      );
    }

    console.log(`[DELETE /api/batches/${id}] Batch deleted successfully`);
    return NextResponse.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
