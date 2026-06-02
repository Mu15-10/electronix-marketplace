'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatList } from '@/components/chat/chat-list';
import { ConversationHeader } from '@/components/chat/conversation-header';
import { chatApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/chat-store';
import { Message, Conversation } from '@/types';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const { sendMessage, joinConversation } = useSocket();
  const { messages, setMessages, conversations, setConversations } = useChatStore();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.conversationId) {
      joinConversation(params.conversationId as string);
      Promise.all([
        chatApi.getMessages(params.conversationId as string).then(r => setMessages(r.data.results || r.data)),
        chatApi.getConversations().then(r => setConversations(r.data.results || r.data)),
      ]).catch(() => router.push(`/${lang}/dashboard/chat`))
      .finally(() => setLoading(false));
    }
  }, [params.conversationId]);

  useEffect(() => {
    const c = conversations.find(c => c.id === params.conversationId);
    if (c) setConv(c);
  }, [conversations, params.conversationId]);

  const handleSend = (content: string, type?: string) => {
    sendMessage(params.conversationId as string, content, type);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card padding="none" className="h-full">
        <div className="flex h-full">
          <div className="w-80 border-e border-surface-200 dark:border-surface-700 overflow-y-auto hidden lg:block">
            <ChatList conversations={conversations} activeId={params.conversationId as string} />
          </div>
          <div className="flex-1 flex flex-col">
            <ConversationHeader conversation={conv} />
            <ChatWindow
              messages={messages}
              conversationId={params.conversationId as string}
              onSendMessage={handleSend}
              loading={loading}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
