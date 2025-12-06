'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
            <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // Style headings
                  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>,
                  // Style paragraphs
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  // Style bold
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  // Style italic
                  em: ({ children }) => <em className="italic">{children}</em>,
                  // Style lists
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  // Style code
                  code: ({ className, children }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  // Style code blocks
                  pre: ({ children }) => (
                    <pre className="bg-muted p-3 rounded-md overflow-x-auto my-2 text-sm">{children}</pre>
                  ),
                  // Style links
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  // Style blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-2">{children}</blockquote>
                  ),
                }}
              >
                {part.text}
              </ReactMarkdown>
            </div>
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
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
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
              <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary pl-4 italic my-2">{children}</blockquote>
            ),
          }}
        >
          {message.content || ''}
        </ReactMarkdown>
      </div>
    );
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
