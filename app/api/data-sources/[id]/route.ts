import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { deleteDocuments } from '@/lib/rag/upstashSearch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Get the data source to find chunk count
    const { data: dataSource } = await (supabase
      .from('data_sources') as any)
      .select('chunk_count')
      .eq('id', id)
      .single();

    // 2. Delete chunks from Upstash if any exist
    if (dataSource?.chunk_count > 0) {
      const chunkIds = Array.from(
        { length: dataSource.chunk_count },
        (_, i) => `${id}-chunk-${i + 1}`
      );
      try {
        await deleteDocuments(chunkIds);
        console.log(`Deleted ${chunkIds.length} chunks from Upstash`);
      } catch (upstashError) {
        console.error('Error deleting from Upstash:', upstashError);
        // Continue with Supabase deletion even if Upstash fails
      }
    }

    // 3. Delete from Supabase
    const { error } = await (supabase.from('data_sources') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting data source:', error);
      return NextResponse.json(
        { message: 'Failed to delete data source' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Data source deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/data-sources/[id]:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
