import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

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
