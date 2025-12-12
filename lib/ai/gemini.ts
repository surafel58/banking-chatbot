import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy initialization to allow environment variables to be loaded first
let _google: ReturnType<typeof createGoogleGenerativeAI> | null = null;
let _genAI: GoogleGenerativeAI | null = null;

function getApiKey(): string {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable"
    );
  }
  return key;
}

function getGoogleProvider() {
  if (!_google) {
    _google = createGoogleGenerativeAI({
      apiKey: getApiKey(),
    });
  }
  return _google;
}

function getGenAI() {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(getApiKey());
  }
  return _genAI;
}

// Native Google AI SDK client for embeddings (lazy)
export const genAI = new Proxy({} as GoogleGenerativeAI, {
  get(target, prop) {
    return (getGenAI() as any)[prop];
  },
}) as GoogleGenerativeAI;

// Model configurations
export const CHAT_MODEL = "gemini-2.5-flash-lite";
export const EMBEDDING_MODEL = "text-embedding-004";

// Lazy-loaded chat model - directly export the model instance
let _geminiModel: any = null;

export function getGeminiModel() {
  if (!_geminiModel) {
    const provider = getGoogleProvider();
    _geminiModel = provider(CHAT_MODEL);
  }
  return _geminiModel;
}

// Export the model directly
export const geminiModel = new Proxy({} as any, {
  get(target, prop) {
    return (getGeminiModel() as any)[prop];
  },
});
