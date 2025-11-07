# Setup Guide - Banking Chatbot

This guide will walk you through setting up the Banking Customer Support Chatbot from scratch.

## Overview

You'll need to:
1. Get API keys (Google AI, Supabase)
2. Configure environment variables
3. Set up the database
4. Ingest knowledge base
5. Run the application

**Estimated time**: 15-20 minutes

---

## Step 1: Get Google AI API Key (FREE)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)
5. Store it safely - you'll need it in Step 3

**Note**: Google AI offers generous free tier:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

---

## Step 2: Set Up Supabase (FREE)

### 2.1 Create Supabase Project

1. Visit [Supabase](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - Project name: `banking-chatbot` (or any name)
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to you
5. Click **"Create new project"** (takes ~2 minutes)

### 2.2 Get Supabase Credentials

Once your project is ready:

1. Go to **Settings** > **API**
2. Copy these three values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (click "Reveal" to see it)

**⚠️ Important**: The `service_role` key has admin privileges. Keep it secret!

### 2.3 Set Up Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `scripts/setup-database.sql` in your project
4. Copy ALL the contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned" - this is correct!

### 2.4 Verify Database Setup

1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - `conversations`
   - `documents`
   - `handoff_queue`
   - `messages`
   - `security_logs`
   - `users`

If you see all 6 tables, you're good to go! ✅

---

## Step 3: Configure Environment Variables

1. In your project root, find `.env.local.example`
2. Copy it to create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

3. Open `.env.local` and fill in:

   ```env
   # Google AI API Key (from Step 1)
   GOOGLE_GENERATIVE_AI_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXX

   # Supabase Credentials (from Step 2.2)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Save the file

**✅ Checkpoint**: Your `.env.local` should have all 4 values filled in.

---

## Step 4: Install Dependencies

In your terminal, navigate to the project directory and run:

```bash
npm install
```

This will install all required packages (~1-2 minutes).

---

## Step 5: Ingest Knowledge Base (OPTIONAL but Recommended)

This step populates your vector database with banking knowledge for the RAG system.

Run:

```bash
npm run ingest-knowledge
```

You should see output like:

```
🚀 Starting knowledge base ingestion...

📁 Processing faq documents...
   Found 1 documents
   ⏳ Ingesting: /path/to/branch-hours.md
   ✅ Success: abc-123-def

📁 Processing policy documents...
   Found 1 documents
   ⏳ Ingesting: /path/to/card-lost-stolen.md
   ✅ Success: def-456-ghi

📁 Processing product documents...
   Found 1 documents
   ⏳ Ingesting: /path/to/checking-accounts.md
   ✅ Success: ghi-789-jkl

✨ Knowledge base ingestion complete!
```

**⚠️ Note**: This process:
- Reads markdown files from `data/knowledge/`
- Generates embeddings using Google AI
- Stores them in Supabase
- Takes ~30 seconds depending on your documents

### Troubleshooting Ingestion

If you get errors:

**"Missing API key"**
- Check that `.env.local` has `GOOGLE_GENERATIVE_AI_API_KEY`
- Make sure you're in the project root directory

**"Cannot connect to Supabase"**
- Verify Supabase credentials in `.env.local`
- Check that database tables exist

**"Rate limit exceeded"**
- Wait a minute and try again
- Google AI has rate limits on free tier

---

## Step 6: Run the Application

Start the development server:

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

---

## Step 7: Test the Chatbot

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. You should see the chat interface with welcome message
3. Try these test queries:

### Test 1: Simple Greeting
**Type**: `Hello`

**Expected**: Friendly greeting from the assistant

### Test 2: Knowledge Base Query
**Type**: `What are your branch hours?`

**Expected**: Detailed hours information (if you ran Step 5)

### Test 3: Tool Usage - Branch Locator
**Type**: `Find nearby branches`

**Expected**: List of mock branch locations

### Test 4: Tool Usage - Card Management
**Type**: `I lost my credit card`

**Expected**: Security prompts and card freeze options

### Test 5: Tool Usage - Balance Check
**Type**: `What's my checking account balance?`

**Expected**: Mock balance information

### Test 6: Human Handoff
**Type**: `I want to speak with someone`

**Expected**: Agent handoff message with queue info

---

## Troubleshooting

### App won't start

**Error: "Missing environment variable"**
- Check that `.env.local` exists in project root
- Verify all 4 required variables are set
- Restart the dev server

**Error: "Port 3000 is already in use"**
- Kill the process: `lsof -ti:3000 | xargs kill -9`
- Or use a different port: `npm run dev -- -p 3001`

### Chatbot not responding

**No response after sending message**
- Check browser console for errors (F12)
- Verify Google AI API key is valid
- Check Supabase connection

**"Failed to fetch" error**
- Make sure dev server is running
- Check that API route exists: `app/api/chat/route.ts`

### Knowledge base queries not working

**Generic responses instead of specific knowledge**
- Verify Step 5 (ingestion) completed successfully
- Check Supabase `documents` table has data
- Make sure embeddings were generated

---

## Next Steps

Now that your chatbot is running:

### Add More Knowledge

1. Create new markdown files in `data/knowledge/`
2. Organize by category: `policies/`, `products/`, `faqs/`, `procedures/`
3. Run: `npm run ingest-knowledge`

### Customize the Assistant

- **Change personality**: Edit `lib/ai/prompts.ts`
- **Add tools**: Modify `lib/tools/banking-tools.ts`
- **Adjust intents**: Update `lib/intents/patterns.ts`

### Deploy to Production

1. Push code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

See [README.md](./README.md) for more details.

---

## Quick Reference

### Environment Variables

```
GOOGLE_GENERATIVE_AI_API_KEY    # Google AI API key
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon key
SUPABASE_SERVICE_KEY            # Supabase service key
```

### Common Commands

```bash
npm install              # Install dependencies
npm run dev              # Start development server
npm run build            # Build for production
npm run ingest-knowledge # Load knowledge base
```

### File Structure Reference

```
Key files:
- app/api/chat/route.ts           # Chat API endpoint
- components/chat/ChatInterface.tsx # Main UI
- lib/tools/banking-tools.ts      # AI tools
- lib/ai/prompts.ts               # System prompts
- lib/rag/retriever.ts            # RAG logic
- data/knowledge/                 # Knowledge base
```

---

## Support

If you're stuck:

1. Check the [README.md](./README.md) for detailed docs
2. Review error messages carefully
3. Verify each setup step was completed
4. Check the troubleshooting section

---

**🎉 Congratulations!** Your banking chatbot is now ready to use!

For questions about specific features, see the main [README.md](./README.md).
