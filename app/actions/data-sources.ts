'use server';

import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { addDocument, deleteDocuments } from '@/lib/rag/upstashSearch';
import { chunkText } from '@/lib/utils/textChunking';
import { revalidatePath } from 'next/cache';
import type { Tables } from '@/types/supabase';

// ============================================================================
// State Types for Server Actions (following financial-document-analyzer pattern)
// ============================================================================

export type DataSourceActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    file?: string[];
    url?: string[];
  };
  data?: {
    id?: string;
    sources?: TransformedDataSource[];
  };
};

export type TransformedDataSource = {
  id: string;
  type: string;
  name: string;
  status: string | null;
  createdAt: string | null;
  metadata: {
    fileSize: number | null;
    fileType: string | null;
    url: string | null;
    chunkCount: number | null;
    errorMessage: string | null;
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

function transformDataSource(source: Tables<'data_sources'>): TransformedDataSource {
  return {
    id: source.id,
    type: source.type,
    name: source.name,
    status: source.status,
    createdAt: source.created_at,
    metadata: {
      fileSize: source.file_size,
      fileType: source.file_type,
      url: source.url,
      chunkCount: source.chunk_count,
      errorMessage: source.error_message,
    },
  };
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Fetch all data sources
 */
export async function getDataSourcesAction(): Promise<DataSourceActionState> {
  try {
    const supabase = createServerClient();

    const { data: sources, error } = await supabase
      .from('data_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data sources:', error);
      return {
        success: false,
        message: 'Failed to fetch data sources',
      };
    }

    const transformedSources = (sources || []).map(transformDataSource);

    return {
      success: true,
      data: { sources: transformedSources },
    };
  } catch (error) {
    console.error('Error in getDataSourcesAction:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Delete a data source by ID
 */
export async function deleteDataSourceAction(
  id: string
): Promise<DataSourceActionState> {
  try {
    if (!id) {
      return {
        success: false,
        message: 'ID is required',
      };
    }

    const supabase = createServerClient();

    // 1. Get the data source to find chunk count
    const { data: dataSource } = await supabase
      .from('data_sources')
      .select('chunk_count')
      .eq('id', id)
      .single();

    // 2. Delete chunks from Upstash if any exist
    if (dataSource?.chunk_count && dataSource.chunk_count > 0) {
      const chunkIds = Array.from(
        { length: dataSource.chunk_count },
        (_, i) => `${id}-chunk-${i + 1}`
      );
      try {
        await deleteDocuments(chunkIds);
        console.log(`Deleted ${chunkIds.length} chunks from Upstash`);
      } catch (upstashError) {
        console.error('Error deleting from Upstash:', upstashError);
      }
    }

    // 3. Delete from Supabase
    const { error } = await supabase
      .from('data_sources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting data source:', error);
      return {
        success: false,
        message: 'Failed to delete data source',
      };
    }

    revalidatePath('/');

    return {
      success: true,
      message: 'Data source deleted successfully',
    };
  } catch (error) {
    console.error('Error in deleteDataSourceAction:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Add URL data source
 */
export async function addUrlDataSourceAction(
  prevState: DataSourceActionState,
  formData: FormData
): Promise<DataSourceActionState> {
  try {
    const url = formData.get('url') as string;

    if (!url) {
      return {
        success: false,
        errors: { url: ['URL is required'] },
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return {
        success: false,
        errors: { url: ['Invalid URL format'] },
      };
    }

    const supabase = createServerClient();
    const id = uuidv4();

    // Extract domain for name
    const urlObj = new URL(url);
    const name = urlObj.hostname + urlObj.pathname.slice(0, 30);

    // Create data source record
    const { error: insertError } = await supabase
      .from('data_sources')
      .insert({
        id,
        type: 'url',
        name,
        status: 'processing',
        url,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating data source:', insertError);
      return {
        success: false,
        message: 'Failed to create data source record',
      };
    }

    // Process URL asynchronously (fire and forget)
    processUrlInBackground(id, url, name);

    revalidatePath('/');

    return {
      success: true,
      message: 'URL added successfully. Processing in background.',
      data: { id },
    };
  } catch (error) {
    console.error('Error in addUrlDataSourceAction:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

// Background processing for URL (non-blocking)
async function processUrlInBackground(
  dataSourceId: string,
  url: string,
  name: string
): Promise<void> {
  const supabase = createServerClient();

  try {
    console.log(`Processing URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BankingChatBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
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

    const chunks = chunkText(text, 1000);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${dataSourceId}-chunk-${i + 1}`;

      await addDocument(chunkId, chunk, {
        category: 'url',
        source: url,
        tags: [name, `chunk-${i + 1}`],
      });
    }

    await supabase
      .from('data_sources')
      .update({ status: 'ready', chunk_count: chunks.length })
      .eq('id', dataSourceId);

  } catch (error) {
    console.error(`Error processing URL ${url}:`, error);

    await supabase
      .from('data_sources')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', dataSourceId);
  }
}

function extractTextFromHtml(html: string): string {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}
