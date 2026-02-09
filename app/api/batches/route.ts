import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBatchesByProducer, getProducerByUserId } from '@/lib/api/database';

/**
 * API route to get batches for the authenticated producer
 */
export async function GET() {
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

    console.log('[GET /api/batches] Fetching batches for user:', user.id);
    
    // Step 1: Get ALL producer IDs for this user (user can have multiple producers)
    const { data: producersData, error: producersError } = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id);
    
    if (producersError) {
      console.error('[GET /api/batches] Error fetching producers:', producersError);
      return NextResponse.json({
        success: true,
        batches: [],
      });
    }
    
    if (!producersData || producersData.length === 0) {
      console.log('[GET /api/batches] No producers found for user:', user.id);
      return NextResponse.json({
        success: true,
        batches: [],
      });
    }
    
    const producerIds = producersData.map(p => p.id);
    console.log('[GET /api/batches] Found', producerIds.length, 'producers:', producerIds);
    
    // Step 2: Fetch batches for ALL of this user's producers
    const { data: batchesData, error: batchesError } = await supabase
      .from('batches')
      .select('*')
      .in('producer_id', producerIds)
      .order('created_at', { ascending: false });
    
    if (batchesError) {
      console.error('[GET /api/batches] Error fetching batches:', batchesError);
      return NextResponse.json({
        success: true,
        batches: [],
      });
    }
    
    // Map batches to expected format
    const batches = (batchesData || []).map((b: any) => ({
      id: b.id,
      producerId: b.producer_id,
      region: b.region,
      harvestDate: b.harvest_date,
      extractionDate: b.extraction_date,
      floralSourceTags: b.floral_source_tags || [],
      notes: b.notes,
      status: b.status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));
    
    console.log('[GET /api/batches] Found batches:', batches.length);
    
    return NextResponse.json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch batches',
      },
      { status: 500 }
    );
  }
}
