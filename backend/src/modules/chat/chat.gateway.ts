import {
  WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection,
  OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { LoggerService } from '../../config/logger.config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new LoggerService('ChatGateway');
  private onlineUsers = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      });

      client.userId = payload.sub;
      client.userEmail = payload.email;

      const userSockets = this.onlineUsers.get(payload.sub) || [];
      userSockets.push(client.id);
      this.onlineUsers.set(payload.sub, userSockets);

      client.join(`user:${payload.sub}`);
      this.server.emit('userOnline', { userId: payload.sub });

      this.logger.log(`User connected: ${payload.email} (${payload.sub})`);
    } catch (error) {
      this.logger.warn(`WebSocket connection rejected: ${error.message}`);
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      const userSockets = this.onlineUsers.get(client.userId) || [];
      const filtered = userSockets.filter((sid) => sid !== client.id);
      if (filtered.length === 0) {
        this.onlineUsers.delete(client.userId);
        this.server.emit('userOffline', { userId: client.userId });
      } else {
        this.onlineUsers.set(client.userId, filtered);
      }
      this.logger.log(`User disconnected: ${client.userEmail} (${client.userId})`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { conversationId: string; content: string; attachments?: any[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const message = await this.chatService.sendMessage(
        {
          conversationId: data.conversationId,
          content: data.content,
          attachments: data.attachments || [],
        },
        client.userId!,
      );

      this.server.to(`conversation:${data.conversationId}`).emit('newMessage', message);
      this.server.to(`conversation:${data.conversationId}`).emit('notification', {
        type: 'new_message',
        conversationId: data.conversationId,
        message: message,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.chatService.markAsRead(data.conversationId, client.userId!);
    this.server.to(`conversation:${data.conversationId}`).emit('messagesRead', {
      conversationId: data.conversationId,
      userId: client.userId,
    });
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    client.to(`conversation:${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    client.join(`conversation:${data.conversationId}`);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
