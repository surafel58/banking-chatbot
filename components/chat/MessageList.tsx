'use client';

import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  error?: Error;
}

// Helper to check if a message has actual content to display
function hasContent(message: any): boolean {
  // Check parts array for text content
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts.some((part: any) => {
      if (part.type === 'text' && part.text && part.text.trim().length > 0) {
        return true;
      }
      if (part.type === 'tool-invocation') {
        return true;
      }
      return false;
    });
  }
  // Fallback to content
  if (message.content && message.content.trim().length > 0) {
    return true;
  }
  return false;
}

export function MessageList({ messages, isLoading, error }: MessageListProps) {
  // Filter messages to only show those with content
  // For assistant messages that are still streaming, only show if they have content
  const visibleMessages = messages.filter((message) => {
    // Always show user messages
    if (message.role === 'user') return true;
    // Only show assistant messages that have content
    return hasContent(message);
  });

  // Determine if we should show the typing indicator
  // Show it only when loading AND the last assistant message is empty or doesn't exist
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isLoading && (
    !lastMessage ||
    lastMessage.role === 'user' ||
    !hasContent(lastMessage)
  );

  return (
    <div className="space-y-4 pb-4">
      {visibleMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {showTypingIndicator && <TypingIndicator />}

      {error && (
        <Alert variant="destructive" className="mx-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Something went wrong. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
