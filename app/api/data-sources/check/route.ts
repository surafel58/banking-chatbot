import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsBySource, getDocumentCount } from '@/lib/rag/vectorStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (url) {
      // Check if specific URL is indexed
      const documents = await getDocumentsBySource(url);
      return NextResponse.json({
        url,
        isIndexed: documents.length > 0,
        documentCount: documents.length,
        preview: documents.slice(0, 2).map((doc) => ({
          id: doc.id,
          contentPreview: doc.content.substring(0, 200) + '...',
        })),
      });
    }

    // Return overall stats
    const totalCount = await getDocumentCount();
    const urlCount = await getDocumentCount('url');
    const documentCount = await getDocumentCount('document');

    return NextResponse.json({
      total: totalCount,
      byCategory: {
        url: urlCount,
        document: documentCount,
      },
    });
  } catch (error) {
    console.error('Error checking knowledge base:', error);
    return NextResponse.json(
      { message: 'Error checking knowledge base' },
      { status: 500 }
    );
  }
}
