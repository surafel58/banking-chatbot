/**
 * Chunk text into smaller pieces based on sentence boundaries
 * @param text - The text to chunk
 * @param maxChunkSize - Maximum size of each chunk (default: 1000 characters)
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
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
