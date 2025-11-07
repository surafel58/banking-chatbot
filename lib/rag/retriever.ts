import { searchSimilarDocuments } from './vectorStore';
import { Document, RetrievalOptions } from '@/types';

export class KnowledgeRetriever {
  /**
   * Retrieve relevant documents for a query
   */
  async retrieve(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<Document[]> {
    const threshold = options.threshold ?? 0.7;
    const topK = options.topK ?? 5;
    const categoryFilter = options.categoryFilter;

    try {
      // Search vector store
      const documents = await searchSimilarDocuments(query, {
        threshold,
        topK,
        category: categoryFilter,
      });

      // Re-rank results if needed
      const reranked = this.rerank(documents, query);

      return reranked;
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
   * Re-rank documents based on relevance
   */
  private rerank(documents: Document[], query: string): Document[] {
    // Simple reranking based on similarity score and keyword matching
    return documents
      .map((doc) => {
        let score = doc.similarity || 0;

        // Boost score if query keywords appear in content
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentLower = doc.content.toLowerCase();

        const keywordMatches = queryWords.filter((word) =>
          contentLower.includes(word)
        ).length;

        score += keywordMatches * 0.01;

        return { ...doc, score };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(({ score, ...doc }) => doc); // Remove temporary score field
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
    category: 'policy' | 'product' | 'faq' | 'procedure',
    topK = 3
  ): Promise<Document[]> {
    return this.retrieve(query, {
      categoryFilter: category,
      topK,
      threshold: 0.6,
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
