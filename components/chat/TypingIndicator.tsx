'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <Card className="px-4 py-3 bg-card text-card-foreground rounded-tl-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
          <span className="ml-2 text-sm text-muted-foreground">Thinking...</span>
        </div>
      </Card>
    </div>
  );
}
