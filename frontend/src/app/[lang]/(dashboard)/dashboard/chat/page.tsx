'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ChatList } from '@/components/chat/chat-list';
import { chatApi } from '@/lib/api';
import { Conversation } from '@/types';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatApi.getConversations()
      .then(res => setConversations(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Messages</h1>
      <Card padding="none" className="h-full">
        <div className="flex h-full">
          <div className="w-80 border-e border-surface-200 dark:border-surface-700 overflow-y-auto">
            <ChatList conversations={conversations} loading={loading} />
          </div>
          <div className="flex-1 flex items-center justify-center text-surface-400">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
