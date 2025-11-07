import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { geminiModel } from '@/lib/ai/gemini';
import { BANKING_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { bankingTools } from '@/lib/tools/banking-tools';
import { intentDetector } from '@/lib/intents/detector';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', {
        status: 400,
      });
    }

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

    // Stream the response with tools
    const result = streamText({
      model: geminiModel,
      messages: modelMessages,
      system: BANKING_SYSTEM_PROMPT,
      tools: bankingTools,
      temperature: 0.3,
      maxRetries: 2,
      stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calling and response generation

      onFinish: async ({ text, toolCalls, usage, finishReason }) => {
        // Log the conversation (in production, save to database)
        console.log('Conversation finished:', {
          intent: detectedIntent?.type,
          confidence: detectedIntent?.confidence,
          toolsUsed: toolCalls?.map((tc) => tc.toolName) || [],
          tokens: usage,
          finishReason,
          generatedTextLength: text?.length || 0,
          generatedText: text,
        });

        // Here you would typically:
        // 1. Save the conversation to database
        // 2. Update analytics
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
