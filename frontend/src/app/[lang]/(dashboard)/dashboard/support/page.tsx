'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Rating } from '@/components/ui/rating';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { LifeBuoy, Plus, ChevronRight, MessageSquare, Send, Paperclip, Clock, ArrowLeft } from 'lucide-react';
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

const categoryOptions = [
  { value: 'technical', label: 'Technical' },
  { value: 'payment', label: 'Payment' },
  { value: 'verification', label: 'Verification' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'account', label: 'Account' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const mockTickets: SupportTicket[] = [
  {
    id: '1', ticket_number: 'SUP-001', subject: 'Payment not processed', description: 'I paid for an item but the seller says payment is pending.',
    status: 'open', priority: 'high', category: 'payment', messages: [], attachments: [],
    user: { id: 'u1', email: '', username: '', full_name: 'John Doe', role: 'user', is_verified: true, is_two_factor_enabled: false, created_at: '' },
    created_at: '2024-02-10T10:00:00Z', updated_at: '2024-02-10T10:00:00Z',
  },
  {
    id: '2', ticket_number: 'SUP-002', subject: 'Account verification issue', description: 'My ID document was rejected.',
    status: 'resolved', priority: 'medium', category: 'verification', messages: [], attachments: [],
    user: { id: 'u2', email: '', username: '', full_name: 'Jane Smith', role: 'user', is_verified: true, is_two_factor_enabled: false, created_at: '' },
    rating: 5, created_at: '2024-02-08T14:00:00Z', updated_at: '2024-02-09T10:00:00Z',
  },
];

export default function SupportPage() {
  const t = useTranslations('support');
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [tickets] = useState<SupportTicket[]>(mockTickets);
  const [loading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingTicketId, setRatingTicketId] = useState<string | null>(null);

  const [form, setForm] = useState({ subject: '', description: '', category: '', priority: 'medium' });

  const handleCreateTicket = () => {
    if (!form.subject || !form.description || !form.category) {
      toast.error(t('fillRequiredFields'));
      return;
    }
    toast.success(t('ticketCreated'));
    setShowCreateModal(false);
    setForm({ subject: '', description: '', category: '', priority: 'medium' });
  };

  const handleSendMessage = (ticketId: string) => {
    if (!newMessage.trim()) return;
    toast.success(t('messageSent'));
    setNewMessage('');
  };

  const handleResolve = (ticketId: string) => {
    toast.success(t('ticketResolved'));
  };

  const handleClose = (ticketId: string) => {
    toast.success(t('ticketClosed'));
  };

  const handleRate = (ticketId: string) => {
    if (ratingValue === 0) {
      toast.error(t('selectRating'));
      return;
    }
    toast.success(t('ratingSubmitted'));
    setRatingTicketId(null);
    setRatingValue(0);
  };

  const lastMessage = (ticket: SupportTicket) => {
    if (ticket.messages.length === 0) return ticket.description;
    return ticket.messages[ticket.messages.length - 1].content;
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('myTickets')}</h1>
          <p className="text-sm text-surface-500">{t('manageSupport')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" /> {t('createTicket')}
        </Button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="h-16 w-16" />}
          title={t('noTickets')}
          description={t('noTicketsDesc')}
          action={<Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4" /> {t('createTicket')}</Button>}
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {tickets.map((ticket) => (
              <div key={ticket.id}>
                <div
                  className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-surface-400">{ticket.ticket_number}</span>
                      <Badge variant={statusVariant[ticket.status]} size="sm">{t(`status.${ticket.status}`)}</Badge>
                      <Badge variant={priorityVariant[ticket.priority]} size="sm">{t(`priority.${ticket.priority}`)}</Badge>
                    </div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-surface-400">{t(`category.${ticket.category}`)}</span>
                      <span className="text-xs text-surface-400"><Clock className="h-3 w-3 inline me-1" />{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-surface-500 mt-1 truncate">{lastMessage(ticket)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-400 shrink-0 rtl-flip" />
                </div>

                {expandedId === ticket.id && (
                  <div className="border-t border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/30">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => router.push(`/${lang}/dashboard/support/${ticket.id}`)}
                        >
                          <MessageSquare className="h-4 w-4" /> {t('viewFullConversation')}
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {ticket.messages.length === 0 ? (
                          <p className="text-sm text-surface-400 italic">{t('noMessages')}</p>
                        ) : (
                          ticket.messages.map((msg) => (
                            <div key={msg.id} className="bg-white dark:bg-surface-800 rounded-lg p-3 border border-surface-200 dark:border-surface-700">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-surface-900 dark:text-white">{msg.sender.full_name}</span>
                                <span className="text-xs text-surface-400">{new Date(msg.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-surface-600 dark:text-surface-300">{msg.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('typeMessage')}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(ticket.id); }}
                          />
                          <Button size="sm" onClick={() => handleSendMessage(ticket.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {ticket.status === 'open' || ticket.status === 'awaiting_reply' || ticket.status === 'in_progress' ? (
                          <>
                            <Button size="sm" variant="primary" onClick={() => handleResolve(ticket.id)} className="bg-green-600 hover:bg-green-700">{t('resolve')}</Button>
                            <Button size="sm" variant="danger" onClick={() => handleClose(ticket.id)}>{t('close')}</Button>

                          </>
                        ) : null}
                        {ticket.status === 'resolved' && !ticket.rating && (
                          <div className="flex items-center gap-2">
                            <Rating value={ratingTicketId === ticket.id ? ratingValue : 0} onChange={(v) => { setRatingTicketId(ticket.id); setRatingValue(v); }} size="sm" />
                            <Button size="sm" variant="outline" onClick={() => handleRate(ticket.id)}>{t('submitRating')}</Button>
                          </div>
                        )}
                        {ticket.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-surface-400">{t('rated')}:</span>
                            <Rating value={ticket.rating} size="sm" readOnly />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('createNewTicket')} size="lg">
        <div className="space-y-4">
          <Input label={t('subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t('subjectPlaceholder')} />
          <Textarea label={t('description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('descriptionPlaceholder')} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('category')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={categoryOptions} placeholder={t('selectCategory')}
            />
            <Select
              label={t('priority')} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={priorityOptions}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleCreateTicket}>{t('submitTicket')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
