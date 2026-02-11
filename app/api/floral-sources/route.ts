import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { floralSourceOptions } from '@/lib/api/mock-data';

/**
 * Get all floral sources
 * Falls back to mock data if table doesn't exist
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('floral_sources')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // If table doesn't exist, fall back to mock data
      const errorMessage = error.message || '';
      const errorCode = (error && 'code' in error) ? (error as { code: string }).code : null;
      
      if (errorMessage.includes('Could not find the table') || 
          errorMessage.includes('relation') ||
          errorCode === 'PGRST116') {
        console.warn('Floral sources table not found, using fallback data:', errorMessage);
        // Convert mock data to expected format
        const fallbackSources = floralSourceOptions.map((name, index) => ({
          id: `fallback-${index}`,
          name,
          scientific_name: null,
          region_exclusive: false,
          region_state: [],
          description: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, floralSources: fallbackSources });
      }
      throw new Error(`Failed to fetch floral sources: ${errorMessage}`);
    }

    return NextResponse.json({ success: true, floralSources: data || [] });
  } catch (error) {
    console.error('Error fetching floral sources:', error);
    // Final fallback to mock data
    const fallbackSources = floralSourceOptions.map((name, index) => ({
      id: `fallback-${index}`,
      name,
      scientific_name: null,
      region_exclusive: false,
      region_state: [],
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    return NextResponse.json({ success: true, floralSources: fallbackSources });
  }
}
