'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rating } from '@/components/ui/rating';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { PageSpinner } from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Paperclip, Lock, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SupportTicket, TicketMessage } from '@/types';
import { supportApi } from '@/lib/api';

const statusVariant: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'default'> = {
  open: 'warning',
  awaiting_reply: 'info',
  in_progress: 'primary',
  resolved: 'success',
  closed: 'default',
};

const priorityVariant: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

const mockTicket: SupportTicket = {
  id: '1', ticket_number: 'SUP-001', subject: 'Payment not processed',
  description: 'I purchased an iPhone 15 Pro but the payment status still shows as pending. The seller has not received the payment confirmation. My card was charged but the order is not updating.',
  status: 'open', priority: 'high', category: 'payment',
  messages: [
    {
      id: 'm1', ticket_id: '1',
      sender: { id: 'u1', email: '', username: '', full_name: 'John Doe', role: 'user', is_verified: true, is_two_factor_enabled: false, created_at: '' },
      content: 'I paid for the item but it is still pending. Please help.', is_internal: false, attachments: [],
      created_at: '2024-02-10T10:00:00Z',
    },
    {
      id: 'm2', ticket_id: '1',
      sender: { id: 'u2', email: '', username: '', full_name: 'Sarah Support', role: 'admin', is_verified: true, is_two_factor_enabled: false, created_at: '' },
      content: 'Hello John, I can see your payment was processed but there was a delay in the webhook. Let me check with our payment provider and get back to you.', is_internal: false, attachments: [],
      created_at: '2024-02-10T11:30:00Z',
    },
    {
      id: 'm3', ticket_id: '1',
      sender: { id: 'u2', email: '', username: '', full_name: 'Sarah Support', role: 'admin', is_verified: true, is_two_factor_enabled: false, created_at: '' },
      content: 'Internal note: Payment gateway returned a 503 error during processing. Will escalate to engineering.', is_internal: true, attachments: [],
      created_at: '2024-02-10T11:35:00Z',
    },
  ],
  attachments: ['screenshot_1.png'],
  user: { id: 'u1', email: '', username: '', full_name: 'John Doe', role: 'user', is_verified: true, is_two_factor_enabled: false, created_at: '' },
  assigned_to: { id: 'u2', email: '', username: '', full_name: 'Sarah Support', role: 'admin', is_verified: true, is_two_factor_enabled: false, created_at: '' },
  created_at: '2024-02-10T10:00:00Z', updated_at: '2024-02-10T11:35:00Z',
};

export default function TicketDetailPage() {
  const t = useTranslations('support');
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [ticket] = useState<SupportTicket>(mockTicket);
  const [newMessage, setNewMessage] = useState('');
  const [showInternal, setShowInternal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    toast.success(t('messageSent'));
    setNewMessage('');
  };

  const handleResolve = () => {
    toast.success(t('ticketResolved'));
  };

  const handleClose = () => {
    toast.success(t('ticketClosed'));
  };

  const handleRate = () => {
    if (ratingValue === 0) {
      toast.error(t('selectRating'));
      return;
    }
    toast.success(t('ratingSubmitted'));
    setRatingSubmitted(true);
  };

  const userRole = 'admin';

  return (
    <div>
      <Link
        href={`/${lang}/dashboard/support`}
        className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> {t('backToTickets')}
      </Link>

      <Card padding="md" className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-surface-400">{ticket.ticket_number}</span>
                <Badge variant={statusVariant[ticket.status]}>{t(`status.${ticket.status}`)}</Badge>
                <Badge variant={priorityVariant[ticket.priority]}>{t(`priority.${ticket.priority}`)}</Badge>
              </div>
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">{ticket.subject}</h1>
              <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                <span><Clock className="h-3 w-3 inline me-1" />{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span>{t('category')}: {t(`category.${ticket.category}`)}</span>
                {ticket.assigned_to && <span>{t('assignedTo')}: {ticket.assigned_to.full_name}</span>}
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="bg-surface-50 dark:bg-surface-700/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-surface-700 dark:text-surface-300">{ticket.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <>
              <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700" onClick={handleResolve}>
                <CheckCircle className="h-4 w-4" /> {t('resolve')}
              </Button>
              <Button size="sm" variant="danger" onClick={handleClose}>
                <XCircle className="h-4 w-4" /> {t('close')}
              </Button>
            </>
          )}
          {userRole === 'admin' && (
            <Button size="sm" variant="outline" onClick={() => setShowInternal(!showInternal)}>
              <Lock className="h-4 w-4" /> {t('internalNotes')}
            </Button>
          )}
        </div>
      </Card>

      <Card padding="md" className="mb-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          <MessageSquare className="h-5 w-5 inline me-2" />{t('messages')}
        </h2>

        <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
          {ticket.messages
            .filter((m) => !m.is_internal || (m.is_internal && showInternal))
            .map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar name={msg.sender.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-surface-900 dark:text-white">{msg.sender.full_name}</span>
                    {msg.sender.role === 'admin' && (
                      <Badge variant="primary" size="sm">{t('agent')}</Badge>
                    )}
                    {msg.is_internal && (
                      <Badge variant="warning" size="sm"><Lock className="h-3 w-3 me-1" />{t('internal')}</Badge>
                    )}
                    <span className="text-xs text-surface-400">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-700/30 rounded-lg p-3">
                    <p className="text-sm text-surface-700 dark:text-surface-300">{msg.content}</p>
                  </div>
                  {msg.attachments.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Paperclip className="h-3 w-3 text-surface-400" />
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="text-xs text-primary-600 hover:underline cursor-pointer">{att}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Textarea
                placeholder={t('typeMessage')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {ticket.status === 'resolved' && !ratingSubmitted && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">{t('rateExperience')}</h3>
          <div className="flex items-center gap-3">
            <Rating value={ratingValue} onChange={setRatingValue} size="md" />
            <Button size="sm" variant="outline" onClick={handleRate}>{t('submitRating')}</Button>
          </div>
        </Card>
      )}

      {ratingSubmitted && (
        <Alert variant="success" title={t('thankYou')}>
          {t('ratingReceived')}
        </Alert>
      )}
    </div>
  );
}
