import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { insertDocument } from '@/lib/rag/vectorStore';

// Helper to extract text content from HTML
function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Helper to chunk text into smaller pieces
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if (currentChunk.length + trimmedSentence.length + 1 > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmedSentence + '.';
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence + '.';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Process URL: fetch content and index it
async function processUrl(dataSourceId: string, url: string, name: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  try {
    console.log(`Processing URL: ${url}`);

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BankingChatBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let text: string;

    if (contentType.includes('text/html')) {
      const html = await response.text();
      text = extractTextFromHtml(html);
    } else if (contentType.includes('text/plain') || contentType.includes('application/json')) {
      text = await response.text();
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    if (!text || text.length < 50) {
      throw new Error('Extracted content is too short or empty');
    }

    console.log(`Extracted ${text.length} characters from URL`);

    // Chunk the text and insert each chunk
    const chunks = chunkText(text, 1000);
    console.log(`Created ${chunks.length} chunks for indexing`);

    let successCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const docId = await insertDocument(chunk, {
        category: 'url',
        source: url,
        tags: [name, `chunk-${i + 1}`],
      });
      if (docId) {
        successCount++;
      }
    }

    console.log(`Successfully indexed ${successCount}/${chunks.length} chunks`);

    // Update data source status to ready
    await (supabase.from('data_sources') as any)
      .update({ status: 'ready' })
      .eq('id', dataSourceId);

    console.log(`URL processing complete: ${url}`);
  } catch (error) {
    console.error(`Error processing URL ${url}:`, error);

    // Update data source status to error
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
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const id = uuidv4();

    // Extract domain for name
    const urlObj = new URL(url);
    const name = urlObj.hostname + urlObj.pathname.slice(0, 30);

    // Create data source record using type assertion
    const { error: insertError } = await (supabase
      .from('data_sources') as any)
      .insert({
        id,
        type: 'url',
        name: name,
        status: 'processing',
        url: url,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating data source:', insertError);
      return NextResponse.json(
        { message: 'Failed to create data source record' },
        { status: 500 }
      );
    }

    // Process the URL: fetch content and index it
    processUrl(id, url, name).catch((error) => {
      console.error('Error processing URL:', error);
    });

    return NextResponse.json({
      message: 'URL added successfully',
      id,
    });
  } catch (error) {
    console.error('Error in POST /api/data-sources/url:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
