'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chat-store';
import { Message } from '@/types';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setConnected,
    addMessage,
    updateConversation,
    setUnreadCount,
  } = useChatStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('new_message', (message: Message) => {
      addMessage(message);
    });

    socketRef.current.on('conversation_updated', (conversation) => {
      updateConversation(conversation);
    });

    socketRef.current.on('unread_count', (count: number) => {
      setUnreadCount(count);
    });

    socketRef.current.on('user_online', ({ userId }) => {
      updateConversation(userId);
    });

    socketRef.current.on('user_offline', ({ userId }) => {
      updateConversation(userId);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string, messageType = 'text') => {
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          conversation_id: conversationId,
          content,
          message_type: messageType,
        });
      }
    },
    []
  );

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { conversation_id: conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', { conversation_id: conversationId });
    }
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { conversation_id: conversationId });
    }
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { conversation_id: conversationId, is_typing: isTyping });
    }
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    joinConversation,
    leaveConversation,
    markAsRead,
    sendTyping,
  };
}
