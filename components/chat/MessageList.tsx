'use client';

import type { UIMessage } from '@ai-sdk/react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Extended message type to include createdAt
type ChatMessage = UIMessage & { createdAt?: Date };

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: Error;
  onRetry?: () => void;
}

// Helper to check if a message has actual visible content to display
function hasVisibleContent(message: ChatMessage): boolean {
  // Check parts array for text content (AI SDK UIMessage format)
  if (!message.parts || !Array.isArray(message.parts) || message.parts.length === 0) {
    return false;
  }

  return message.parts.some((part) => {
    // Text content must have actual non-empty text
    if (part.type === 'text') {
      return typeof part.text === 'string' && part.text.trim().length > 0;
    }
    // Tool invocations are visible (show processing/completed indicator)
    // But only if they have a tool name (not just empty tool calls)
    if (part.type.startsWith('tool-') && 'toolName' in part) {
      return true;
    }
    return false;
  });
}

export function MessageList({ messages, isLoading, error, onRetry }: MessageListProps) {
  // Filter messages to only show those with visible content
  // For assistant messages that are still streaming, only show if they have actual content
  const visibleMessages = messages.filter((message) => {
    // Always show user messages (they always have content)
    if (message.role === 'user') return true;
    // Only show assistant messages that have visible content
    return hasVisibleContent(message);
  });

  // Determine if we should show the typing indicator
  // Show it when loading AND the last assistant message has no visible content yet
  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator =
    isLoading && (!lastMessage || lastMessage.role === 'user' || !hasVisibleContent(lastMessage));

  return (
    <div className="space-y-4 pb-4">
      {visibleMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {showTypingIndicator && <TypingIndicator />}

      {/* Error display with retry button (AI SDK UI pattern) */}
      {error && (
        <Alert variant="destructive" className="mx-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message || 'Something went wrong. Please try again.'}</span>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
