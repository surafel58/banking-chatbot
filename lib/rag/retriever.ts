import { searchDocuments, SearchResult } from './upstashSearch';
import { Document, RetrievalOptions } from '@/types';

export class KnowledgeRetriever {
  /**
   * Retrieve relevant documents for a query using Upstash Search
   * Upstash handles embedding and reranking automatically
   */
  async retrieve(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<Document[]> {
    const topK = options.topK ?? 5;

    try {
      // Search with Upstash Search (includes built-in reranking)
      const results = await searchDocuments(query, {
        limit: topK,
        rerank: true,
      });

      // Convert SearchResult to Document format
      const documents: Document[] = results.map((result) => ({
        id: result.id,
        content: result.content,
        metadata: {
          category: result.metadata.category,
          source: result.metadata.source,
          tags: result.metadata.tags,
        },
        similarity: result.score,
      }));

      // Filter by category if specified
      if (options.categoryFilter) {
        return documents.filter(
          (doc) => doc.metadata?.category === options.categoryFilter
        );
      }

      return documents;
    } catch (error) {
      console.error('Retrieval error:', error);
      return [];
    }
  }

  /**
   * Format retrieved documents into context for LLM
   */
  formatContext(documents: Document[]): string {
    if (documents.length === 0) {
      return 'No relevant information found in knowledge base.';
    }

    const formattedDocs = documents
      .map((doc, index) => {
        const source = doc.metadata?.source || 'Unknown';
        const category = doc.metadata?.category || 'General';
        return `[Document ${index + 1}] (Source: ${source}, Category: ${category})
${doc.content}
---`;
      })
      .join('\n\n');

    return `Relevant Information from Knowledge Base:\n\n${formattedDocs}`;
  }

  /**
   * Retrieve and format context in one call
   */
  async retrieveContext(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<string> {
    const documents = await this.retrieve(query, options);
    return this.formatContext(documents);
  }

  /**
   * Search for specific category documents
   */
  async searchByCategory(
    query: string,
    category: 'policy' | 'product' | 'faq' | 'procedure' | 'document' | 'url',
    topK = 3
  ): Promise<Document[]> {
    return this.retrieve(query, {
      categoryFilter: category,
      topK,
    });
  }

  /**
   * Multi-query retrieval for better coverage
   */
  async multiQueryRetrieve(
    queries: string[],
    options: RetrievalOptions = {}
  ): Promise<Document[]> {
    const allDocs = await Promise.all(
      queries.map((query) => this.retrieve(query, options))
    );

    // Flatten and deduplicate by document ID
    const uniqueDocs = new Map<string, Document>();
    for (const docs of allDocs) {
      for (const doc of docs) {
        if (!uniqueDocs.has(doc.id)) {
          uniqueDocs.set(doc.id, doc);
        }
      }
    }

    return Array.from(uniqueDocs.values());
  }
}

// Export singleton instance
export const knowledgeRetriever = new KnowledgeRetriever();
