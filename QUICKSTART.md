# Quick Start - Banking Chatbot

## ✅ What's Been Set Up

Your banking chatbot project is now **fully configured** with:

### Core Features ✨
- ✅ **Next.js 14** with App Router and TypeScript
- ✅ **Google Gemini 1.5** AI integration
- ✅ **Vercel AI SDK** for streaming chat
- ✅ **RAG System** with vector search
- ✅ **Intent Detection** for user queries
- ✅ **Banking Tools** (card management, balance, branches, etc.)
- ✅ **Modern Chat UI** with real-time streaming
- ✅ **Knowledge Base** structure with sample documents
- ✅ **Database Schema** for Supabase

### Project Structure 📁
```
banking-chatbot/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Core logic (AI, RAG, tools, etc.)
├── data/knowledge/   # Knowledge base documents
├── scripts/          # Setup and utility scripts
└── types/            # TypeScript definitions
```

---

## 🚀 Next Steps (3 Steps to Run)

### Step 1: Get API Keys (5 min)

**Google AI API Key** (FREE)
1. Visit: https://aistudio.google.com/app/apikey
2. Create API key
3. Copy it

**Supabase Setup** (FREE)
1. Visit: https://supabase.com
2. Create new project
3. Run `scripts/setup-database.sql` in SQL Editor
4. Copy: Project URL, anon key, service key

### Step 2: Configure Environment (2 min)

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your keys
nano .env.local  # or use your preferred editor
```

Add:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_KEY=your_key_here
```

### Step 3: Run the App (30 sec)

```bash
# Ingest knowledge base (optional but recommended)
npm run ingest-knowledge

# Start development server
npm run dev
```

Open: http://localhost:3000

---

## 🎯 Test It Out

Try these messages:

1. **"Hello"** - Test basic greeting
2. **"What are your branch hours?"** - Test RAG retrieval
3. **"I lost my credit card"** - Test card management
4. **"Find nearby branches"** - Test branch locator
5. **"What's my balance?"** - Test account operations

---

## 📚 Documentation

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **Full Documentation**: See `README.md`
- **Database Schema**: See `scripts/setup-database.sql`

---

## 🔧 Common Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run ingest-knowledge # Load knowledge base
npm run lint             # Check code quality
```

---

## 🎨 Customization

### Add Banking Knowledge
1. Create markdown files in `data/knowledge/[category]/`
2. Run `npm run ingest-knowledge`

### Customize AI Behavior
- Edit `lib/ai/prompts.ts` for system prompts
- Edit `lib/intents/patterns.ts` for intent detection

### Add New Tools
- Edit `lib/tools/banking-tools.ts`
- Follow the Vercel AI SDK tool format

---

## 🚢 Deploy (When Ready)

### To Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### To Other Platforms
- Works on any Node.js hosting platform
- Requires: Node.js 18+, PostgreSQL with pgvector

---

## 💡 Tips

- **Start Simple**: Test with basic queries first
- **Check Logs**: Use browser console (F12) to debug
- **Add Knowledge**: More documents = better responses
- **Monitor Usage**: Check API quotas in Google AI Studio
- **Supabase Limits**: Free tier has generous limits

---

## 🆘 Need Help?

**Can't start the app?**
→ Check `SETUP_GUIDE.md` troubleshooting section

**Chatbot not responding?**
→ Verify API keys in `.env.local`

**RAG not working?**
→ Run `npm run ingest-knowledge` first

**Other issues?**
→ See `README.md` for detailed docs

---

## 🌟 What You Can Build

This is a **fully functional foundation**. Extend it to:

- ✨ Add real banking API integrations
- ✨ Implement user authentication
- ✨ Add multi-language support
- ✨ Create admin dashboard
- ✨ Add voice interface
- ✨ Implement analytics
- ✨ Add payment processing
- ✨ Create mobile app

---

**Ready to go?** Follow the 3 steps above and you'll be chatting with your AI banking assistant in minutes! 🎉
