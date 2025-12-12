import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { geminiModel } from '@/lib/ai/gemini';
import { BANKING_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createBankingTools } from '@/lib/tools/banking-tools';
import { intentDetector } from '@/lib/intents/detector';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, authToken }: { messages: UIMessage[]; authToken?: string } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', {
        status: 400,
      });
    }

    // Get user ID from token (passed in body from client)
    let userId: string | null = null;
    try {
      console.log('[Chat API] Auth token in body:', authToken ? 'present' : 'missing');

      if (authToken) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        console.log('[Chat API] User lookup result:', {
          userId: user?.id,
          email: user?.email,
          error: userError?.message
        });

        userId = user?.id || null;
      }
    } catch (authError) {
      console.log('Auth check failed (user may be guest):', authError);
    }

    console.log('[Chat API] Final userId for tools:', userId);

    // Create banking tools with user context
    const bankingTools = createBankingTools(userId);

    // Helper to extract text from message (handles both content and parts formats)
    const getMessageText = (message: UIMessage): string => {
      if ('parts' in message) {
        return message.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.type === 'text' ? part.text : '')
          .join('');
      }
      return '';
    };

    // Get the last user message for intent detection
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .pop();

    // Detect intent (optional - for logging and analytics)
    let detectedIntent = null;
    if (lastUserMessage) {
      const messageText = getMessageText(lastUserMessage);
      if (messageText) {
        detectedIntent = await intentDetector.detect(messageText);
        console.log('Detected intent:', detectedIntent);
      }
    }

    // Convert UI messages to model messages using the official SDK method
    const modelMessages = convertToModelMessages(messages);

    // Stream the response with Agentic RAG behavior
    // maxSteps (via stopWhen) allows the agent to:
    // 1. Call getInformation to search knowledge base
    // 2. Evaluate results and potentially search again with different terms
    // 3. Call banking operation tools if needed
    // 4. Generate final response
    const result = streamText({
      model: geminiModel,
      messages: modelMessages,
      system: BANKING_SYSTEM_PROMPT,
      tools: bankingTools,
      temperature: 0.3,
      maxRetries: 2,
      stopWhen: stepCountIs(5), // Allow up to 5 steps for agentic multi-step reasoning

      onStepFinish: async ({ toolCalls, text }) => {
        // Log each step for agentic behavior tracking
        if (toolCalls && toolCalls.length > 0) {
          console.log('[Agentic RAG] Step completed:', {
            tools: toolCalls.map((tc) => ({
              name: tc.toolName,
            })),
          });
        }
      },

      onFinish: async ({ text, toolCalls, usage, finishReason, steps }) => {
        // Log the complete conversation with agentic behavior details
        console.log('[Agentic RAG] Conversation finished:', {
          intent: detectedIntent?.type,
          confidence: detectedIntent?.confidence,
          totalSteps: steps?.length || 0,
          toolsUsed: toolCalls?.map((tc) => tc.toolName) || [],
          tokens: usage,
          finishReason,
          // Track if knowledge base was consulted
          usedKnowledgeBase: toolCalls?.some((tc) => tc.toolName === 'getInformation') || false,
        });

        // Here you would typically:
        // 1. Save the conversation to database
        // 2. Update analytics (track RAG usage patterns)
        // 3. Check if escalation is needed
        // 4. Log for audit purposes
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
