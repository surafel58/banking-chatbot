/**
 * Knowledge Base Ingestion Script
 *
 * This script reads markdown files from the data/knowledge directory,
 * generates embeddings, and stores them in Supabase for RAG retrieval.
 *
 * Usage: npm run ingest-knowledge
 */

// Load environment variables from .env.local FIRST (before any other imports)
import { config } from 'dotenv';
import { join, resolve } from 'path';

// Load .env.local file with absolute path
const envPath = resolve(process.cwd(), '.env.local');
const result = config({ path: envPath });

if (result.error) {
  console.error('⚠️  Warning: Could not load .env.local file:', result.error.message);
  console.log('Looking for file at:', envPath);
} else {
  console.log('✅ Environment variables loaded from:', envPath);
}

// Now import other modules AFTER environment is loaded
import { readFileSync, readdirSync, statSync } from 'fs';
import { insertDocument } from '../lib/rag/vectorStore';

interface DocumentFile {
  path: string;
  category: 'policy' | 'product' | 'faq' | 'procedure';
  content: string;
}

/**
 * Recursively read all markdown files from a directory
 */
function readMarkdownFiles(
  dir: string,
  category: 'policy' | 'product' | 'faq' | 'procedure'
): DocumentFile[] {
  const files: DocumentFile[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively read subdirectories
        files.push(...readMarkdownFiles(fullPath, category));
      } else if (item.endsWith('.md')) {
        // Read markdown file
        const content = readFileSync(fullPath, 'utf-8');
        files.push({
          path: fullPath,
          category,
          content,
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }

  return files;
}

/**
 * Main ingestion function
 */
async function ingestKnowledgeBase() {
  console.log('🚀 Starting knowledge base ingestion...\n');

  const dataDir = join(process.cwd(), 'data', 'knowledge');
  const categories: Array<'policy' | 'product' | 'faq' | 'procedure'> = [
    'policy',
    'product',
    'faq',
    'procedure',
  ];

  let totalDocuments = 0;
  let successCount = 0;

  for (const category of categories) {
    // Proper pluralization
    const pluralMap: Record<string, string> = {
      'policy': 'policies',
      'product': 'products',
      'faq': 'faqs',
      'procedure': 'procedures',
    };
    const categoryDir = join(dataDir, pluralMap[category]);
    console.log(`📁 Processing ${category} documents...`);

    const documents = readMarkdownFiles(categoryDir, category);
    console.log(`   Found ${documents.length} documents`);

    for (const doc of documents) {
      try {
        console.log(`   ⏳ Ingesting: ${doc.path}`);

        const docId = await insertDocument(doc.content, {
          category: doc.category,
          source: doc.path,
          tags: [doc.category],
        });

        if (docId) {
          successCount++;
          console.log(`   ✅ Success: ${docId}`);
        } else {
          console.log(`   ❌ Failed to insert document`);
        }
      } catch (error) {
        console.error(`   ❌ Error ingesting ${doc.path}:`, error);
      }
    }

    totalDocuments += documents.length;
    console.log();
  }

  console.log('📊 Ingestion Summary:');
  console.log(`   Total documents processed: ${totalDocuments}`);
  console.log(`   Successfully ingested: ${successCount}`);
  console.log(`   Failed: ${totalDocuments - successCount}`);
  console.log('\n✨ Knowledge base ingestion complete!');
}

// Run if executed directly
if (require.main === module) {
  ingestKnowledgeBase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Ingestion failed:', error);
      process.exit(1);
    });
}

export { ingestKnowledgeBase };
