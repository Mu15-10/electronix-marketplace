'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Image, DollarSign } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string, type?: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
      <div className="flex items-center gap-2">
        <button type="button" className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
          <Paperclip className="h-5 w-5" />
        </button>
        <button type="button" className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
          <Image className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
        />
        <button type="button" className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
          <DollarSign className="h-5 w-5" />
        </button>
        <Button type="submit" size="sm" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
