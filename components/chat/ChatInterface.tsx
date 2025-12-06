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
  const { messages, sendMessage, error, status, stop } = useChat();

  const [input, setInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

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
    </div>
  );
}
