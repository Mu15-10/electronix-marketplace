'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { useAuthStore } from '@/store/auth-store';
import { useSocket } from '@/hooks/useSocket';

interface ChatWindowProps {
  messages: Message[];
  conversationId: string;
  onSendMessage: (content: string, type?: string) => void;
  loading?: boolean;
}

export function ChatWindow({ messages, conversationId, onSendMessage, loading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { markAsRead } = useSocket();

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <div className="h-8 w-8 rounded-full bg-surface-200 dark:bg-surface-700 animate-pulse shrink-0" />
            <div className={`space-y-2 ${i % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
              <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={onSendMessage} />
    </div>
  );
}
