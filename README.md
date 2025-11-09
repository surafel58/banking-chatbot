# Banking Customer Support Chatbot

An AI-powered conversational assistant for banking customer support, built with Next.js 16, Google Gemini 2.5 Flash, and Supabase. Features Agentic RAG (AI-controlled knowledge retrieval with vector search) for accurate responses, intent detection, and seamless human handoff capabilities.

## 🎯 Features

- **Real-time Streaming Responses**: Powered by Vercel AI SDK v5 and Google Gemini 2.5 Flash
- **Agentic RAG System**: Tool-based knowledge retrieval with vector search and re-ranking
- **Intent Detection**: Pattern-based classification for user queries
- **Banking Operations**: Card management, balance checking, transaction viewing, branch locator
- **Human Handoff**: Intelligent escalation to human agents when needed
- **Modern UI**: Clean, responsive interface with real-time typing indicators
- **100% Free Stack**: All services have generous free tiers

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19.2, TypeScript 5, shadcn/ui, Tailwind CSS v4
- **AI**: Google Gemini 2.5 Flash, Vercel AI SDK v5
- **Database**: Supabase (PostgreSQL + pgvector)
- **Embeddings**: Google text-embedding-004
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google AI API key ([Get one here](https://aistudio.google.com/app/apikey))
- A Supabase account and project ([Create one here](https://supabase.com))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Google Generative AI (Required)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `scripts/setup-database.sql`
4. Paste and run the script in the SQL Editor
5. Verify that tables and functions are created

### 4. Ingest Knowledge Base (Optional but Recommended)

This populates the vector database with banking knowledge:

```bash
npx tsx scripts/ingest-knowledge.ts
```

This script:
- Reads markdown files from `data/knowledge/`
- Generates embeddings using Google's model
- Stores them in Supabase for RAG retrieval

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the chatbot.

## 📚 Project Structure

```
banking-chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts           # Main chat endpoint
│   └── page.tsx                   # Main chat page
├── components/
│   └── chat/
│       ├── ChatInterface.tsx      # Main chat component
│       ├── MessageBubble.tsx      # Message display
│       └── TypingIndicator.tsx    # Loading indicator
├── lib/
│   ├── ai/
│   │   ├── gemini.ts             # Gemini configuration
│   │   ├── embeddings.ts         # Embedding generation
│   │   └── prompts.ts            # System prompts
│   ├── tools/
│   │   └── banking-tools.ts      # AI tools for banking operations
│   ├── rag/
│   │   ├── retriever.ts          # RAG retrieval logic
│   │   └── vectorStore.ts        # Vector database operations
│   ├── intents/
│   │   ├── detector.ts           # Intent classification
│   │   └── patterns.ts           # Intent patterns
│   └── supabase/
│       └── client.ts             # Supabase client
├── data/
│   └── knowledge/                # Knowledge base documents
│       ├── policies/
│       ├── products/
│       ├── faqs/
│       └── procedures/
├── scripts/
│   ├── setup-database.sql        # Database schema
│   └── ingest-knowledge.ts       # Knowledge ingestion script
└── types/
    └── index.ts                  # TypeScript type definitions
```

## 🎮 Usage

### Chat with the Assistant

The chatbot can help with:

1. **Card Management**
   - "I lost my credit card"
   - "Freeze my debit card"
   - "I need a replacement card"

2. **Account Information**
   - "What's my checking account balance?"
   - "Show me recent transactions"

3. **Branch/ATM Locator**
   - "Find nearby branches"
   - "Where's the nearest ATM?"

4. **General Banking Questions**
   - "What are your branch hours?"
   - "Tell me about checking accounts"

5. **Human Handoff**
   - "I want to speak with someone"
   - "Connect me to an agent"

### Adding New Knowledge

1. Create markdown files in `data/knowledge/` subdirectories
2. Run the ingestion script:
   ```bash
   npx tsx scripts/ingest-knowledge.ts
   ```

## 🔧 Configuration

### Customizing the System Prompt

Edit `lib/ai/prompts.ts` to customize how the assistant behaves.

### Adding New Tools

Add new tools in `lib/tools/banking-tools.ts` using the Vercel AI SDK tool format:

```typescript
export const myNewTool = tool({
  description: 'Description of what the tool does',
  parameters: z.object({
    param1: z.string().describe('Parameter description'),
  }),
  execute: async ({ param1 }) => {
    // Tool logic
    return { result: 'success' };
  },
});
```

### Adjusting Intent Patterns

Modify `lib/intents/patterns.ts` to add or change intent detection patterns.

## 📊 Database Schema

The Supabase database includes:

- **users**: Customer user accounts
- **conversations**: Chat sessions
- **messages**: Individual messages with intent tracking
- **documents**: Knowledge base with vector embeddings
- **handoff_queue**: Queue for agent escalation
- **security_logs**: Audit trail

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive credentials
- PII masking in logs (implement as needed)
- Rate limiting (optional - use Upstash Redis)

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in Vercel:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

## 📈 Monitoring

- View logs in Vercel dashboard
- Monitor API usage in Google AI Studio
- Track database queries in Supabase dashboard

## 🧪 Testing

To test the chatbot:

1. Start with simple queries to verify basic functionality
2. Test intent detection with various phrasings
3. Verify RAG retrieval by asking knowledge-based questions
4. Test tool calling (card management, balance checks, etc.)
5. Verify error handling and edge cases

## 🤝 Contributing

This is a project template. Feel free to customize it for your needs:

- Add more banking operations
- Implement authentication
- Add multi-language support
- Integrate with real banking APIs
- Add voice interface
- Implement analytics dashboard

## 🆘 Troubleshooting

### Common Issues

**"Missing API key" error**
- Ensure `.env.local` has all required environment variables
- Restart the development server after adding env vars

**"Vector search not working"**
- Verify Supabase pgvector extension is enabled
- Check that documents table has embeddings
- Run `npx tsx scripts/ingest-knowledge.ts` to populate the database

**"Tool calls not working"**
- Check Gemini API quotas and rate limits
- Verify tool definitions in `lib/tools/banking-tools.ts`

**"Build errors"**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📧 Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Vercel AI SDK docs](https://sdk.vercel.ai/docs)
- Consult [Supabase documentation](https://supabase.com/docs)

## 🌟 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Google Gemini](https://ai.google.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is a demonstration project. For production use with real banking data, implement proper security measures, authentication, data encryption, and compliance with banking regulations.
