import { Search } from '@upstash/search';

// Initialize Upstash Search client and index
const client = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

// Index name should match the database name created in Upstash console
const INDEX_NAME = 'banking-chatbot-kb';

// Define content and metadata types
type ContentType = { text: string };
type MetadataType = { category: string; source: string; tags: string[] };

// Get typed index
const index = client.index<ContentType, MetadataType>(INDEX_NAME);

export interface DocumentMetadata {
  category: string;
  source: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  score: number;
}

/**
 * Add a document to the knowledge base
 */
export async function addDocument(
  id: string,
  content: string,
  metadata: DocumentMetadata
): Promise<void> {
  await index.upsert({
    id,
    content: { text: content },
    metadata: {
      category: metadata.category,
      source: metadata.source,
      tags: metadata.tags || [],
    },
  });
}

/**
 * Add multiple documents in batch
 */
export async function addDocuments(
  documents: Array<{
    id: string;
    content: string;
    metadata: DocumentMetadata;
  }>
): Promise<void> {
  // Upstash Search supports batch upsert with array
  const records = documents.map((doc) => ({
    id: doc.id,
    content: { text: doc.content },
    metadata: {
      category: doc.metadata.category,
      source: doc.metadata.source,
      tags: doc.metadata.tags || [],
    },
  }));

  await index.upsert(records);
}

/**
 * Search for documents
 */
export async function searchDocuments(
  query: string,
  options?: {
    limit?: number;
    rerank?: boolean;
  }
): Promise<SearchResult[]> {
  const results = await index.search({
    query,
    limit: options?.limit || 5,
    reranking: options?.rerank ?? true,
  });

  return results.map((result) => ({
    id: String(result.id),
    content: result.content?.text || '',
    metadata: {
      category: result.metadata?.category || 'unknown',
      source: result.metadata?.source || 'unknown',
      tags: result.metadata?.tags || [],
    },
    score: result.score || 0,
  }));
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(id: string): Promise<void> {
  await index.delete([id]);
}

/**
 * Delete multiple documents by IDs
 */
export async function deleteDocuments(ids: string[]): Promise<void> {
  await index.delete(ids);
}

/**
 * Get the search client for advanced operations
 */
export function getSearchClient(): Search {
  return client;
}

export { INDEX_NAME };
