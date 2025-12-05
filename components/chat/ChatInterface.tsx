'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { WelcomeScreen } from './WelcomeScreen';
import { QuickActionsPanel } from '@/components/quick-actions/QuickActionsPanel';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

interface ChatInterfaceProps {
  onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { messages, sendMessage, error, status, stop } = useChat();

  const [input, setInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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
              <WelcomeScreen
                onQuickAction={handleQuickAction}
                isLoading={isLoading}
              />
            ) : (
              <MessageList
                messages={messages}
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

      {/* Floating Quick Actions Panel */}
      <QuickActionsPanel
        onAction={handleQuickAction}
        isLoading={isLoading}
        visible={messages.length > 0}
      />

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
