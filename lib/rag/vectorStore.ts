import { supabase, supabaseAdmin } from '../supabase/client';
import { generateEmbedding } from '../ai/embeddings';
import { Document } from '@/types';

/**
 * Search for similar documents using vector similarity
 */
export async function searchSimilarDocuments(
  query: string,
  options: {
    threshold?: number;
    topK?: number;
    category?: string;
  } = {}
): Promise<Document[]> {
  const {
    threshold = 0.7,
    topK = 5,
    category,
  } = options;

  try {
    console.log('searchSimilarDocuments called with:', { query, queryType: typeof query, options });

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Call the match_documents function
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: topK,
      category_filter: category || null,
    });

    if (error) {
      console.error('Error searching documents:', error);
      throw error;
    }

    console.log('Search results:', { foundDocuments: data?.length || 0, data });
    return data || [];
  } catch (error) {
    console.error('Vector search error:', error);
    return [];
  }
}

/**
 * Insert a document with its embedding into the vector store
 */
export async function insertDocument(
  content: string,
  metadata: {
    category: string;
    source: string;
    tags?: string[];
  }
): Promise<string | null> {
  try {
    // Generate embedding for the content
    const embedding = await generateEmbedding(content);

    // Use admin client for insertions to bypass RLS
    const client = supabaseAdmin || supabase;

    // Insert into database
    const { data, error } = await client
      .from('documents')
      .insert({
        content,
        embedding,
        category: metadata.category,
        source: metadata.source,
        metadata: {
          tags: metadata.tags || [],
          lastUpdated: new Date().toISOString(),
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting document:', error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Document insertion error:', error);
    return null;
  }
}

/**
 * Insert multiple documents in batch
 */
export async function insertDocuments(
  documents: Array<{
    content: string;
    category: string;
    source: string;
    tags?: string[];
  }>
): Promise<number> {
  let successCount = 0;

  for (const doc of documents) {
    const id = await insertDocument(doc.content, {
      category: doc.category,
      source: doc.source,
      tags: doc.tags,
    });
    if (id) successCount++;
  }

  return successCount;
}

/**
 * Delete documents by category
 */
export async function deleteDocumentsByCategory(
  category: string
): Promise<boolean> {
  try {
    // Use admin client for deletions to bypass RLS
    const client = supabaseAdmin || supabase;

    const { error } = await client
      .from('documents')
      .delete()
      .eq('category', category);

    if (error) {
      console.error('Error deleting documents:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Document deletion error:', error);
    return false;
  }
}

/**
 * Get document count by category
 */
export async function getDocumentCount(
  category?: string
): Promise<number> {
  try {
    let query = supabase
      .from('documents')
      .select('id', { count: 'exact', head: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting documents:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Document count error:', error);
    return 0;
  }
}
