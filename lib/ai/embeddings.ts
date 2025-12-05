import { genAI, EMBEDDING_MODEL } from './gemini';

/**
 * Generate embeddings for a given text using Google's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('generateEmbedding called with:', { text, textType: typeof text, textLength: text?.length });

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error('Invalid text for embedding:', { text, textType: typeof text });
      throw new Error('Invalid text input for embedding generation');
    }

    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

    // embedContent expects a string directly
    const result = await model.embedContent(text.trim());

    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(
      texts.map((text) => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
