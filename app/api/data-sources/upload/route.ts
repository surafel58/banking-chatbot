import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { addDocument } from '@/lib/rag/upstashSearch';
import { chunkText } from '@/lib/utils/textChunking';
import { extractTextFromPDF } from '@/lib/utils/pdfExtractor';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for PDFs (Gemini supports up to 2GB)
const ACCEPTED_TEXT_TYPES = ['text/plain', 'text/markdown'];
const ACCEPTED_PDF_TYPE = 'application/pdf';

// Process document: extract text, chunk, and index with Upstash Search
async function processDocument(
  dataSourceId: string,
  fileBuffer: ArrayBuffer,
  fileName: string,
  fileType: string
): Promise<void> {
  const supabase = createServerClient();

  try {
    console.log(`Processing document: ${fileName} (type: ${fileType})`);

    let text: string;

    // Handle PDF files using Gemini extraction
    if (fileType === ACCEPTED_PDF_TYPE || fileName.toLowerCase().endsWith('.pdf')) {
      console.log(`[PDF Processing] Using Gemini to extract text from ${fileName}`);

      const extractionResult = await extractTextFromPDF(fileBuffer, fileName);

      if (!extractionResult.success) {
        throw new Error(`PDF extraction failed: ${extractionResult.error}`);
      }

      text = extractionResult.text;
      console.log(`[PDF Processing] Gemini extracted ${text.length} characters`);
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

    // Insert each chunk into Upstash Search
    let successCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${dataSourceId}-chunk-${i + 1}`;

      await addDocument(chunkId, chunk, {
        category: 'document',
        source: fileName,
        tags: [fileName, `chunk-${i + 1}`],
      });
      successCount++;
    }

    console.log(`Successfully indexed ${successCount}/${chunks.length} chunks`);

    // Update status to ready and save chunk count
    await supabase
      .from('data_sources')
      .update({ status: 'ready', chunk_count: chunks.length })
      .eq('id', dataSourceId);

    console.log(`Document processing complete: ${fileName}`);
  } catch (error) {
    console.error(`Error processing document ${fileName}:`, error);

    // Update status to error
    await supabase
      .from('data_sources')
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
    const isMarkdown = file.name.endsWith('.md');
    const isPDF = fileType === ACCEPTED_PDF_TYPE || file.name.toLowerCase().endsWith('.pdf');
    const isText = ACCEPTED_TEXT_TYPES.includes(fileType) || isMarkdown;

    if (!isText && !isPDF) {
      return NextResponse.json(
        { message: 'Invalid file type. Supported formats: PDF, TXT, MD' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const id = uuidv4();

    // Create data source record with proper types
    const { error: insertError } = await supabase
      .from('data_sources')
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
    const finalFileType = isPDF ? ACCEPTED_PDF_TYPE : fileType;
    processDocument(id, fileBuffer, file.name, finalFileType).catch((error) => {
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
