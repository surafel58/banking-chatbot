import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { insertDocument } from '@/lib/rag/vectorStore';
import { extractTextFromPdf } from '@/lib/utils/pdfExtractor';
import { chunkText } from '@/lib/utils/textChunking';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

// Process document: extract text, chunk, and index
async function processDocument(
  dataSourceId: string,
  fileBuffer: ArrayBuffer,
  fileName: string,
  fileType: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  try {
    console.log(`Processing document: ${fileName}`);

    // Extract text based on file type
    let text: string;

    if (fileType === 'application/pdf') {
      text = await extractTextFromPdf(fileBuffer);
    } else {
      // TXT and MD files - decode buffer to string
      text = new TextDecoder('utf-8').decode(fileBuffer);
    }

    if (!text || text.length < 10) {
      throw new Error('Extracted content is too short or empty');
    }

    console.log(`Extracted ${text.length} characters from document`);

    // Chunk the text
    const chunks = chunkText(text, 1000);
    console.log(`Created ${chunks.length} chunks for indexing`);

    // Insert each chunk into vector store
    let successCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const docId = await insertDocument(chunk, {
        category: 'document',
        source: fileName,
        tags: [fileName, `chunk-${i + 1}`],
      });
      if (docId) {
        successCount++;
      }
    }

    console.log(`Successfully indexed ${successCount}/${chunks.length} chunks`);

    // Update status to ready
    await (supabase.from('data_sources') as any)
      .update({ status: 'ready' })
      .eq('id', dataSourceId);

    console.log(`Document processing complete: ${fileName}`);
  } catch (error) {
    console.error(`Error processing document ${fileName}:`, error);

    // Update status to error
    await (supabase.from('data_sources') as any)
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', dataSourceId);
  }
}

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

    // Get file buffer and process asynchronously (non-blocking)
    const fileBuffer = await file.arrayBuffer();
    processDocument(id, fileBuffer, file.name, fileType).catch((error) => {
      console.error('Error processing document:', error);
    });

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
