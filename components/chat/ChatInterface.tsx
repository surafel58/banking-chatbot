'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { WelcomeScreen } from './WelcomeScreen';
import { QuickActionsPanel } from '@/components/quick-actions/QuickActionsPanel';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/auth/context';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: `Hello! 👋 I'm your AI Banking Assistant. I can help you with:

- **Account Information** - Check balances and account details
- **Transaction History** - View and search your transactions
- **Spending Analysis** - Understand your spending patterns
- **Branch & ATM Locations** - Find nearby banking services
- **General Banking Questions** - Get answers about banking products and services

How can I assist you today?`,
  createdAt: new Date(),
};

interface ChatInterfaceProps {
  onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { session, isAuthenticated } = useAuth();
  const { messages, sendMessage, error, status, stop } = useChat({
    // Pass the access token in fetch options for authenticated requests
    fetch: session?.access_token
      ? (url, options) =>
          fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              Authorization: `Bearer ${session.access_token}`,
            },
          })
      : undefined,
  });

  const [input, setInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  // Check for auth-required messages in tool responses
  useEffect(() => {
    if (!isAuthenticated && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Check if the AI response mentions signing in (from tool's requiresAuth response)
      if (lastMessage.role === 'assistant' && 'parts' in lastMessage) {
        // Extract text from parts
        const textContent = lastMessage.parts
          .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
          .map(part => part.text)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleQuickAction = (message: string) => {
    sendMessage({ text: message });
  };

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
