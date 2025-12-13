'use client';

import type { UIMessage } from '@ai-sdk/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';

// Extended message type to include createdAt
type ChatMessage = UIMessage & { createdAt?: Date };

interface MessageBubbleProps {
  message: ChatMessage;
}

// Markdown components configuration for consistent styling
const markdownComponents: Partial<Components> = {
  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="ml-2">{children}</li>,
  code: ({ className, children }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ) : (
      <code className={className}>{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-muted p-3 rounded-md overflow-x-auto my-2 text-sm">{children}</pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-2">{children}</blockquote>
  ),
};

// Helper to get tool name from a part
function getToolName(part: UIMessage['parts'][number]): string | null {
  if ('toolName' in part && typeof part.toolName === 'string') {
    return part.toolName;
  }
  return null;
}

// Helper to get tool state from a part
function getToolState(part: UIMessage['parts'][number]): string | null {
  if ('state' in part && typeof part.state === 'string') {
    return part.state;
  }
  return null;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Extract and render content from message parts (AI SDK UIMessage format)
  const renderMessageContent = () => {
    if (!message.parts || message.parts.length === 0) {
      return null;
    }

    const renderedParts = message.parts
      .map((part, index) => {
        // Handle text parts - only render if there's actual content
        if (part.type === 'text') {
          const text = part.text?.trim();
          if (!text) return null; // Skip empty text parts

          return (
            <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown components={markdownComponents}>{part.text}</ReactMarkdown>
            </div>
          );
        }

        // Handle tool invocations (AI SDK v5 pattern - type starts with 'tool-')
        if (part.type.startsWith('tool-')) {
          const toolName = getToolName(part);
          const toolState = getToolState(part);

          if (!toolName) return null;

          const displayName = toolName
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase();

          // Show loading state for pending tool calls
          if (toolState === 'call' || toolState === 'input-streaming') {
            return (
              <div
                key={index}
                className="mt-2 p-2 rounded bg-muted/50 text-xs flex items-center gap-2"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-muted-foreground">Processing: </span>
                <span className="font-mono">{displayName}</span>
              </div>
            );
          }

          // Show completed state
          if (toolState === 'result') {
            return (
              <div key={index} className="mt-2 p-2 rounded bg-muted/50 text-xs">
                <span className="text-muted-foreground">Completed: </span>
                <span className="font-mono">{displayName}</span>
              </div>
            );
          }

          return null;
        }

        return null;
      })
      .filter(Boolean);

    // Return null if no parts rendered (prevents empty bubble)
    return renderedParts.length > 0 ? renderedParts : null;
  };

  // Format timestamp
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Extract tool names from parts (AI SDK v5 format)
  const toolNames = message.parts
    ?.filter((part) => part.type.startsWith('tool-'))
    .map((part) => getToolName(part))
    .filter((name): name is string => name !== null) || [];

  // Get rendered content
  const content = renderMessageContent();

  // Don't render empty bubbles (safety check)
  if (!content && !isUser) {
    return null;
  }

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
          <div className="break-words text-sm md:text-base">{content}</div>
        </Card>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>

          {/* Tool invocations indicator (AI SDK v5 pattern) */}
          {toolNames.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {toolNames.map((name, index) => (
                <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0">
                  {name
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
