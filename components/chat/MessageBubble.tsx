'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: any;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Extract text content from message parts (AI SDK pattern)
  const renderMessageContent = () => {
    if (message.parts) {
      return message.parts.map((part: any, index: number) => {
        if (part.type === 'text') {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {part.text}
            </span>
          );
        }
        // Handle tool results - can be extended for rich content
        if (part.type === 'tool-invocation') {
          return (
            <div key={index} className="mt-2 p-2 rounded bg-muted/50 text-xs">
              <span className="text-muted-foreground">Processing: </span>
              <span className="font-mono">{part.toolInvocation?.toolName}</span>
            </div>
          );
        }
        return null;
      }).filter(Boolean);
    }
    // Fallback to content if parts doesn't exist
    return <span className="whitespace-pre-wrap">{message.content || ''}</span>;
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback
          className={
            isUser
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-primary text-primary-foreground'
          }
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <Card
          className={`px-4 py-3 ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card text-card-foreground rounded-tl-sm'
          }`}
        >
          <div className="break-words text-sm md:text-base">
            {renderMessageContent()}
          </div>
        </Card>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>

          {/* Tool invocations indicator */}
          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {message.toolInvocations.map((tool: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                >
                  {tool.toolName
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .toLowerCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
