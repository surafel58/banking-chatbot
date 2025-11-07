'use client';

interface MessageBubbleProps {
  message: any; // Using any since @ai-sdk/react has different message format
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Extract text content from parts array (for @ai-sdk/react messages)
  const getMessageText = () => {
    if (message.parts) {
      return message.parts
        .map((part: any) => (part.type === 'text' ? part.text : null))
        .filter(Boolean)
        .join('');
    }
    // Fallback to content if parts doesn't exist
    return message.content || '';
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-800 shadow-sm border border-gray-200'
        }`}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words">
          {getMessageText()}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {/* Tool Calls Indicator (if any) */}
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              {message.toolInvocations.map((tool, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-mono">
                    {tool.toolName.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
