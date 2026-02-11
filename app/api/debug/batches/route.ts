import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to check batches and producers
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get all producers for this user
    const { data: producers, error: producersError } = await supabase
      .from('producers')
      .select('*')
      .eq('user_id', user.id);

    // Get all batches
    const { data: allBatches, error: batchesError } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get batches for this user's producers
    interface BatchData {
      id: string;
      producer_id: string;
      region: string;
      harvest_date: string;
      extraction_date: string;
      floral_source_tags: string[];
      notes?: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }
    let userBatches: BatchData[] = [];
    if (Array.isArray(producers) && producers.length > 0) {
      const producerIds = (producers as { id: string }[]).map(p => p.id);
      const { data: batchesForUser, error: userBatchesError } = await supabase
        .from('batches')
        .select('*')
        .in('producer_id', producerIds)
        .order('created_at', { ascending: false });

      if (!userBatchesError && Array.isArray(batchesForUser)) {
        userBatches = batchesForUser.map((b: BatchData) => b);
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email,
        },
        producers: producers || [],
        producersError: producersError?.message,
        allBatches: allBatches || [],
        batchesError: batchesError?.message,
        userBatches: userBatches,
        producerIds: Array.isArray(producers) ? producers.map(p => p.id) : [],
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
