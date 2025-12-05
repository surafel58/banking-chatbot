'use client';

import { Send, Square, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({ input, setInput, onSubmit, isLoading, onStop }: ChatInputProps) {
  return (
    <div className="w-full space-y-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 h-12 text-base"
          autoComplete="off"
        />
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
