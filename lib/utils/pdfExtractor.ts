import { GoogleGenerativeAI } from '@google/generative-ai';

function getApiKey(): string {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
  }
  return key;
}

// Lazy-initialized GenAI instance
let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(getApiKey());
  }
  return _genAI;
}

// Using Gemini 2.0 Flash for PDF processing - excellent for document understanding
const PDF_MODEL = 'gemini-2.0-flash';

export interface PDFExtractionResult {
  success: boolean;
  text: string;
  pageCount?: number;
  error?: string;
}

/**
 * Extract text content from a PDF using Gemini's document understanding capabilities.
 *
 * Gemini 2.0 Flash is excellent for PDF processing:
 * - Up to 1,000 pages per request
 * - 2 GB file size limit
 * - 95%+ accuracy (vs 85% traditional OCR)
 * - Understands tables, charts, layouts
 * - Preserves document structure
 *
 * @param pdfBuffer - The PDF file as an ArrayBuffer
 * @param fileName - Original filename for context
 * @returns Extracted text content
 */
export async function extractTextFromPDF(
  pdfBuffer: ArrayBuffer,
  fileName: string
): Promise<PDFExtractionResult> {
  try {
    console.log(`[PDF Extractor] Starting extraction for: ${fileName}`);

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: PDF_MODEL });

    // Convert ArrayBuffer to base64
    const base64Data = Buffer.from(pdfBuffer).toString('base64');

    const prompt = `You are a document text extractor. Extract ALL text content from this PDF document.

Instructions:
1. Extract all readable text from every page
2. Preserve the logical reading order and document structure
3. For tables, convert them to a readable text format
4. For lists, preserve bullet points or numbering
5. Include headers, footers, and any visible text
6. Do NOT summarize or interpret - extract the exact text content
7. Separate sections with blank lines for readability
8. If the document contains multiple columns, read left-to-right, top-to-bottom

Output ONLY the extracted text content, nothing else.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const extractedText = response.text();

    if (!extractedText || extractedText.length < 10) {
      return {
        success: false,
        text: '',
        error: 'No text could be extracted from the PDF',
      };
    }

    console.log(`[PDF Extractor] Successfully extracted ${extractedText.length} characters from ${fileName}`);

    return {
      success: true,
      text: extractedText,
    };
  } catch (error) {
    console.error(`[PDF Extractor] Error extracting text from ${fileName}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error during PDF extraction';

    return {
      success: false,
      text: '',
      error: errorMessage,
    };
  }
}

/**
 * Extract structured information from a PDF (for future use with specific document types)
 */
export async function extractStructuredDataFromPDF(
  pdfBuffer: ArrayBuffer,
  fileName: string,
  schema: string
): Promise<{ success: boolean; data: any; error?: string }> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: PDF_MODEL });

    const base64Data = Buffer.from(pdfBuffer).toString('base64');

    const prompt = `Extract structured data from this PDF document according to the following schema:

${schema}

Return the data as valid JSON only, no additional text or explanation.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const responseText = response.text();

    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        data: null,
        error: 'Could not extract structured data from PDF',
      };
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`[PDF Extractor] Error extracting structured data from ${fileName}:`, error);

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
