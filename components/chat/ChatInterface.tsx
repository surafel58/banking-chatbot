'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function ChatInterface() {
  const { messages, sendMessage, error, status } = useChat({
    api: '/api/chat',
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !input.trim()) return;

    const messageText = input.trim();
    setInput('');
    sendMessage({ text: messageText });
  };

  // Handle quick reply button clicks
  const handleQuickReply = (message: string) => {
    sendMessage({ text: message });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">SB</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">SecureBank Assistant</h1>
            <p className="text-sm text-blue-100">
              Available 24/7 to help you
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">👋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to SecureBank!
            </h2>
            <p className="text-gray-600 mb-6">
              How can I assist you today?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <button
                onClick={() => handleQuickReply('Check my account balance')}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
                disabled={isLoading}
              >
                <div className="font-semibold text-blue-600 mb-1">
                  💰 Check Balance
                </div>
                <div className="text-sm text-gray-600">
                  View your account balance
                </div>
              </button>
              <button
                onClick={() => handleQuickReply('Find nearby branches')}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
                disabled={isLoading}
              >
                <div className="font-semibold text-blue-600 mb-1">
                  📍 Find Branch
                </div>
                <div className="text-sm text-gray-600">
                  Locate branches and ATMs
                </div>
              </button>
              <button
                onClick={() => handleQuickReply('I lost my credit card')}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
                disabled={isLoading}
              >
                <div className="font-semibold text-blue-600 mb-1">
                  🚨 Lost Card
                </div>
                <div className="text-sm text-gray-600">
                  Report a lost or stolen card
                </div>
              </button>
              <button
                onClick={() => handleQuickReply('What are your branch hours?')}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
                disabled={isLoading}
              >
                <div className="font-semibold text-blue-600 mb-1">
                  ℹ️ Information
                </div>
                <div className="text-sm text-gray-600">
                  General banking questions
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading || !input || !input.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your security is our priority. Never share your PIN or password.
        </p>
      </div>
    </div>
  );
}
