'use client';

import { ArrowUp, CircleStop, Shield, RotateCcw } from 'lucide-react';
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
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={isLoading}
          className="flex-1 h-12 text-base rounded-full px-5"
          autoComplete="off"
        />
        {/* Modern circular action buttons */}
        {isLoading ? (
          <Button
            type="button"
            size="icon"
            onClick={onStop}
            className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <CircleStop className="h-5 w-5" />
            <span className="sr-only">Stop generating</span>
          </Button>
        ) : hasError && onRetry ? (
          <Button
            type="button"
            size="icon"
            onClick={onRetry}
            className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Retry</span>
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Send message</span>
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
