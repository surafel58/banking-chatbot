'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { WelcomeScreen } from './WelcomeScreen';
import { QuickActionsPanel } from '@/components/quick-actions/QuickActionsPanel';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';

// Extended message type to include createdAt for display
type ChatMessage = UIMessage & { createdAt?: Date };

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: `Hello! I'm your AI Banking Assistant. I can help you with:

- **Account Information** - Check balances and account details
- **Transaction History** - View and search your transactions
- **Spending Analysis** - Understand your spending patterns
- **Branch & ATM Locations** - Find nearby banking services
- **General Banking Questions** - Get answers about banking products and services

How can I assist you today?`,
    },
  ],
  createdAt: new Date(),
};

interface ChatInterfaceProps {
  onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { session, isAuthenticated } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);

  // Get current token
  const accessToken = session?.access_token;

  // Debug log on mount
  useEffect(() => {
    console.log('[ChatInterface] Token status:', accessToken ? 'present' : 'missing');
  }, [accessToken]);

  // Use stable chat ID - conversation persists across auth changes
  // Token is passed at call-time so we don't need to reset the chat
  const chatId = 'banking-assistant-chat';

  const {
    messages,
    status,
    error,
    stop,
    setMessages,
    sendMessage,
    regenerate,
  } = useChat({
    id: chatId, // Stable ID for session persistence
    // Uses default transport with '/api/chat' endpoint

    // Throttle UI updates for smoother streaming experience
    experimental_throttle: 50,

    // Handle errors with user-friendly notifications
    onError: (err) => {
      console.error('[Chat] Error:', err);
      if (err.message?.includes('rate limit') || err.message?.includes('quota')) {
        toast.error('Service temporarily unavailable. Please try again in a moment.');
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },

    // Log conversation completion for analytics (AI SDK v5 signature)
    onFinish: ({ message }) => {
      console.log('[Chat] Conversation finished:', {
        messageId: message.id,
        role: message.role,
        hasToolInvocations: message.parts?.some((p) => p.type.startsWith('tool-')),
        timestamp: new Date().toISOString(),
      });
    },
  });

  // Manage input state separately (AI SDK v5 pattern)
  const [input, setInput] = useState('');

  // Wrapper that includes auth token in every request
  const sendMessageWithAuth = useCallback(
    (message: string | { text: string }) => {
      const text = typeof message === 'string' ? message : message.text;
      console.log('[ChatInterface] Sending message with token:', accessToken ? 'present' : 'missing');
      sendMessage({ text }, { body: { authToken: accessToken || null } });
    },
    [accessToken, sendMessage]
  );

  // Handle retry with auth token
  const handleRetry = useCallback(() => {
    regenerate({ body: { authToken: accessToken || null } });
  }, [accessToken, regenerate]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Detect auth state changes and clean up conversation
  useEffect(() => {
    if (prevAuthRef.current === false && isAuthenticated === true) {
      // User just signed in - filter out old "sign in required" messages to prevent LLM confusion
      // Then add a message confirming they're now authenticated
      setMessages((prev) => {
        // Helper to check if a message is about signing in
        const isSignInMessage = (msg: UIMessage) => {
          if (msg.role !== 'assistant') return false;

          // Check text content in parts (AI SDK UIMessage format)
          if (msg.parts) {
            const textContent = msg.parts
              .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
              .map((part) => part.text)
              .join('');
            return (
              textContent.includes('sign in') ||
              textContent.includes('Sign in') ||
              textContent.includes('log in')
            );
          }

          return false;
        };

        // Filter out sign-in prompts from history
        const filtered = prev.filter((msg) => !isSignInMessage(msg));

        // Add confirmation message using AI SDK parts format
        const authMessage: ChatMessage = {
          id: `auth-${Date.now()}`,
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text: `Great! You're now signed in. I can now access your account information. Feel free to ask about your balance, transactions, cards, or try any banking operations again!`,
            },
          ],
          createdAt: new Date(),
        };

        return [...filtered, authMessage] as UIMessage[];
      });
      toast.info('Banking features unlocked!');
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, setMessages]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';
  const hasError = status === 'error';

  // Check for auth-required messages in tool responses
  useEffect(() => {
    if (!isAuthenticated && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Check if the AI response mentions signing in (from tool's requiresAuth response)
      if (lastMessage.role === 'assistant' && lastMessage.parts) {
        // Extract text from parts (AI SDK UIMessage format)
        const textContent = lastMessage.parts
          .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
          .map((part) => part.text)
          .join('');

        if (
          textContent.includes('Please sign in') ||
          textContent.includes('sign in to') ||
          textContent.includes('log in to')
        ) {
          // Show auth modal when AI prompts user to sign in
          setAuthModalOpen(true);
        }
      }
    }
  }, [messages, isAuthenticated]);

  // Combine welcome message with chat messages
  const allMessages = useMemo(() => {
    return [WELCOME_MESSAGE, ...messages];
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [allMessages]);

  // Form submit handler - uses input from useChat
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      sendMessageWithAuth(input.trim());
      setInput('');
    },
    [input, sendMessageWithAuth, setInput]
  );

  // Quick action handler
  const handleQuickAction = useCallback(
    (message: string) => {
      sendMessageWithAuth(message);
    },
    [sendMessageWithAuth]
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header - sticks to top with no margin */}
      <div className="shrink-0">
        <ChatHeader onSettingsClick={() => setSettingsOpen(true)} onClose={onClose} />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full">
          <div className="p-4">
            {messages.length === 0 ? (
              <>
                {/* Show welcome bot message */}
                <MessageList
                  messages={[WELCOME_MESSAGE]}
                  isLoading={false}
                  error={undefined}
                  onRetry={handleRetry}
                />
                {/* Show quick action cards below */}
                <WelcomeScreen
                  onQuickAction={handleQuickAction}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <MessageList
                messages={allMessages}
                isLoading={isLoading}
                error={error}
                onRetry={handleRetry}
              />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer - input area */}
      <div className="shrink-0 p-4 border-t border-border bg-background">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
          status={status}
          hasError={hasError}
          onRetry={handleRetry}
        />
      </div>

      {/* Floating Quick Actions Panel - always visible */}
      <QuickActionsPanel
        onAction={handleQuickAction}
        isLoading={isLoading}
        visible={true}
      />

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Auth Modal - shown when user needs to sign in for protected actions */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
