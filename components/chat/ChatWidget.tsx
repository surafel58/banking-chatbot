'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  // Stable key - no longer reset on auth change since we pass token at call-time
  // This preserves conversation history when user signs in mid-conversation

  return (
    <>
      {/* Chat Widget Button - Fixed bottom right */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'transition-all duration-300 ease-in-out',
          'hover:scale-110 active:scale-95',
          isOpen && 'scale-0 opacity-0 pointer-events-none'
        )}
        size="icon"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
      </Button>

      {/* Full Screen Chat Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50',
          'transition-all duration-300 ease-in-out',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Chat Interface - conversation persists across auth changes */}
        {isOpen && <ChatInterface onClose={() => setIsOpen(false)} />}
      </div>
    </>
  );
}
