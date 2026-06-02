'use client';

import { Conversation } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical } from 'lucide-react';

interface ConversationHeaderProps {
  conversation: Conversation | null;
}

export function ConversationHeader({ conversation }: ConversationHeaderProps) {
  if (!conversation) return null;
  const otherUser = conversation.participants?.[0];

  return (
    <div className="flex items-center justify-between p-3 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
      <div className="flex items-center gap-3">
        <Avatar src={otherUser?.avatar} name={otherUser?.full_name} size="md" online={conversation.is_online} />
        <div>
          <p className="text-sm font-medium text-surface-900 dark:text-white">{otherUser?.full_name}</p>
          <p className="text-xs text-surface-500">{conversation.is_online ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"><Phone className="h-4 w-4" /></button>
        <button className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"><Video className="h-4 w-4" /></button>
        <button className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"><MoreVertical className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
