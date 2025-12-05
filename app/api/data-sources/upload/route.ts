import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type || 'text/plain';
    if (!ACCEPTED_TYPES.includes(fileType) && !file.name.endsWith('.md')) {
      return NextResponse.json(
        { message: 'Invalid file type. Accepted: PDF, TXT, MD' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const id = uuidv4();

    // Create data source record using type assertion
    const { error: insertError } = await (supabase
      .from('data_sources') as any)
      .insert({
        id,
        type: 'document',
        name: file.name,
        status: 'processing',
        file_size: file.size,
        file_type: fileType,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating data source:', insertError);
      return NextResponse.json(
        { message: 'Failed to create data source record' },
        { status: 500 }
      );
    }

    // Simulate processing (in production, this would trigger actual processing)
    setTimeout(async () => {
      try {
        const supabaseInner = getSupabaseAdmin();
        await (supabaseInner.from('data_sources') as any)
          .update({ status: 'ready' })
          .eq('id', id);
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }, 3000);

    return NextResponse.json({
      message: 'Document uploaded successfully',
      id,
    });
  } catch (error) {
    console.error('Error in POST /api/data-sources/upload:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
