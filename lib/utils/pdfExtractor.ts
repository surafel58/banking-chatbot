// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

/**
 * Extract text content from a PDF file buffer
 * @param buffer - ArrayBuffer or Buffer containing the PDF file data
 * @returns Promise<string> - Extracted text from all pages
 */
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  // Convert ArrayBuffer to Buffer for pdf-parse
  const nodeBuffer = Buffer.from(buffer);

  const data = await pdf(nodeBuffer);

  // Clean up whitespace and return text
  return data.text.replace(/\s+/g, ' ').trim();
}
