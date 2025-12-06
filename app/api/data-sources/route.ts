import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: sources, error } = await supabase
      .from('data_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data sources:', error);
      return NextResponse.json({ sources: [] });
    }

    // Transform the data to match our frontend types
    const transformedSources = (sources || []).map((source) => ({
      id: source.id,
      type: source.type,
      name: source.name,
      status: source.status,
      createdAt: source.created_at,
      metadata: {
        fileSize: source.file_size,
        fileType: source.file_type,
        url: source.url,
      },
    }));

    return NextResponse.json({ sources: transformedSources });
  } catch (error) {
    console.error('Error in GET /api/data-sources:', error);
    return NextResponse.json({ sources: [] });
  }
}
