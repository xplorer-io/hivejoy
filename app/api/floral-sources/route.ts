import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get all floral sources
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('floral_sources')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch floral sources: ${error.message}`);
    }

    return NextResponse.json({ success: true, floralSources: data || [] });
  } catch (error) {
    console.error('Error fetching floral sources:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
