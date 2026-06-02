'use client';

import { useParams, useRouter } from 'next/navigation';
import { Conversation } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { cn, formatRelativeTime } from '@/lib/utils';

interface ChatListProps {
  conversations: Conversation[];
  activeId?: string;
  loading?: boolean;
}

export function ChatList({ conversations, activeId, loading }: ChatListProps) {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="h-10 w-10 rounded-full bg-surface-200 dark:bg-surface-700 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
              <div className="h-3 w-32 bg-surface-100 dark:bg-surface-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-sm text-surface-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const otherUser = conv.participants?.[0];
        const isActive = conv.id === activeId;

        return (
          <button
            key={conv.id}
            onClick={() => router.push(`/${lang}/dashboard/chat/${conv.id}`)}
            className={cn(
              'flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-start',
              isActive
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-surface-50 dark:hover:bg-surface-800'
            )}
          >
            <Avatar src={otherUser?.avatar} name={otherUser?.full_name} size="md" online={conv.is_online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-surface-900 dark:text-white truncate">
                  {otherUser?.full_name}
                </span>
                {conv.last_message && (
                  <span className="text-xs text-surface-400 shrink-0">
                    {formatRelativeTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <p className={cn('text-sm truncate', conv.unread_count > 0 ? 'text-surface-900 dark:text-white font-medium' : 'text-surface-500')}>
                {conv.last_message?.content || 'No messages yet'}
              </p>
            </div>
            {conv.unread_count > 0 && (
              <span className="h-5 min-w-[1.25rem] px-1 rounded-full bg-primary-600 text-white text-xs font-medium flex items-center justify-center">
                {conv.unread_count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
