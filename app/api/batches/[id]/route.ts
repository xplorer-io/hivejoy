import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    if (!producersData || producersData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const producerIds = producersData.map(p => p.id);
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

    if (!producersData || producersData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const producerIds = producersData.map(p => p.id);
    if (!producerIds.includes(batch.producerId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This batch does not belong to you.' },
        { status: 403 }
      );
    }

    // Update batch
    const updateData: any = {
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
