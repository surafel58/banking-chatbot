import { NextRequest, NextResponse } from 'next/server';
import { searchDocuments } from '@/lib/rag/upstashSearch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (url) {
      // Check if specific URL is indexed by searching for it
      const documents = await searchDocuments(url, { limit: 5 });
      const matchingDocs = documents.filter(
        (doc) => doc.metadata.source === url
      );

      return NextResponse.json({
        url,
        isIndexed: matchingDocs.length > 0,
        documentCount: matchingDocs.length,
        preview: matchingDocs.slice(0, 2).map((doc) => ({
          id: doc.id,
          contentPreview: doc.content.substring(0, 200) + '...',
        })),
      });
    }

    // For overall stats, do a simple search to verify the index works
    // Note: Upstash Search doesn't have a direct count API
    const testSearch = await searchDocuments('test', { limit: 1 });

    return NextResponse.json({
      status: 'connected',
      message: 'Upstash Search is operational',
      hasDocuments: testSearch.length > 0,
    });
  } catch (error) {
    console.error('Error checking knowledge base:', error);
    return NextResponse.json(
      { message: 'Error checking knowledge base' },
      { status: 500 }
    );
  }
}
