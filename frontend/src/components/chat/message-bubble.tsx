'use client';

import { Message } from '@/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Check, CheckCheck, File, ImageIcon, DollarSign } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const renderContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="rounded-lg overflow-hidden max-w-[200px]">
            <img src={message.content} alt="" className="w-full h-auto" />
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10">
            <File className="h-5 w-5" />
            <span className="text-sm truncate">{message.content}</span>
          </div>
        );
      case 'offer':
        return (
          <div className="p-3 rounded-lg border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary-600" />
              <span className="font-semibold text-primary-600">{message.content}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 text-xs font-medium rounded-lg bg-primary-600 text-white">Accept</button>
              <button className="px-3 py-1 text-xs font-medium rounded-lg border border-surface-300 dark:border-surface-600">Counter</button>
              <button className="px-3 py-1 text-xs font-medium rounded-lg text-danger-600">Decline</button>
            </div>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <div className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : '')}>
      <div className={cn('max-w-[75%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary-600 text-white rounded-tr-md'
              : 'bg-surface-100 dark:bg-surface-700 text-surface-900 dark:text-white rounded-tl-md'
          )}
        >
          {renderContent()}
        </div>
        <div className={cn('flex items-center gap-1 px-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-surface-400">{formatRelativeTime(message.created_at)}</span>
          {isOwn && (
            message.is_read ? <CheckCheck className="h-3 w-3 text-primary-500" /> : <Check className="h-3 w-3 text-surface-400" />
          )}
          {message.is_translated && (
            <span className="text-[10px] text-primary-500 italic">Translated</span>
          )}
        </div>
      </div>
    </div>
  );
}
