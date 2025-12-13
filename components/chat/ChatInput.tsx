'use client';

import { Send, Square, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// AI SDK UI status types
type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onStop: () => void;
  status: ChatStatus;
  hasError?: boolean;
  onRetry?: () => void;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  onStop,
  status,
  hasError,
  onRetry,
}: ChatInputProps) {
  // Get placeholder text based on status (AI SDK UI pattern)
  const getPlaceholder = () => {
    switch (status) {
      case 'submitted':
        return 'Sending...';
      case 'streaming':
        return 'AI is responding...';
      case 'error':
        return 'Error occurred. Try again...';
      default:
        return 'Type your message...';
    }
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={isLoading}
          className="flex-1 h-12 text-base"
          autoComplete="off"
        />
        {/* Show different buttons based on status (AI SDK UI pattern) */}
        {isLoading ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={onStop}
          >
            <Square className="h-4 w-4" />
            <span className="sr-only">Stop generating</span>
          </Button>
        ) : hasError && onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="h-12 px-6 shrink-0"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!input.trim()}
            className="h-12 px-6 shrink-0"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        )}
      </form>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Your security is our priority. Never share your PIN or password.</span>
      </div>
    </div>
  );
}
