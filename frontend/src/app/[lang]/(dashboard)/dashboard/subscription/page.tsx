'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { CreditCard, Check, X, Crown, Sparkles, Zap, HelpCircle, Clock, AlertTriangle } from 'lucide-react';
import { Subscription, SubscriptionPlan } from '@/types';
import { subscriptionApi } from '@/lib/api';

const mockCurrent: Subscription = {
  id: 'sub-1', plan: 'professional', plan_name: 'Professional', price: 29.99, currency: 'USD',
  status: 'active', period: 'monthly', auto_renew: true,
  features: ['Up to 100 listings', 'Priority support', 'Advanced analytics', 'Promoted listings', 'Bulk listing upload', 'API access', 'Custom storefront'],
  current_period_start: '2024-01-15T00:00:00Z', current_period_end: '2024-02-15T00:00:00Z',
  created_at: '2024-01-15T00:00:00Z',
};

const mockPlans: SubscriptionPlan[] = [
  { id: 'plan-free', name: 'Free', key: 'free', price: 0, currency: 'USD', period: 'monthly', features: ['Up to 5 listings', 'Basic analytics', 'Email support', 'Standard visibility'], is_featured: false },
  { id: 'plan-basic', name: 'Basic', key: 'basic', price: 9.99, currency: 'USD', period: 'monthly', features: ['Up to 25 listings', 'Advanced analytics', 'Priority email support', 'Promoted listings', 'Bulk listing upload'], is_featured: false },
  { id: 'plan-pro', name: 'Professional', key: 'professional', price: 29.99, currency: 'USD', period: 'monthly', features: ['Up to 100 listings', 'Priority support', 'Advanced analytics', 'Promoted listings', 'Bulk listing upload', 'API access', 'Custom storefront'], is_featured: true },
  { id: 'plan-enterprise', name: 'Enterprise', key: 'enterprise', price: 99.99, currency: 'USD', period: 'monthly', features: ['Unlimited listings', '24/7 priority support', 'Custom analytics', 'Dedicated account manager', 'API access', 'Custom storefront', 'White label option', 'Team accounts'], is_featured: false },
];

const mockHistory: Subscription[] = [
  { id: 'hist-1', plan: 'basic', plan_name: 'Basic', price: 9.99, currency: 'USD', status: 'expired', period: 'monthly', auto_renew: false, features: [], current_period_start: '2023-11-15T00:00:00Z', current_period_end: '2023-12-15T00:00:00Z', created_at: '' },
  { id: 'hist-2', plan: 'free', plan_name: 'Free', price: 0, currency: 'USD', status: 'expired', period: 'monthly', auto_renew: false, features: [], current_period_start: '2023-10-15T00:00:00Z', current_period_end: '2023-11-15T00:00:00Z', created_at: '' },
];

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const params = useParams();
  const lang = params.lang as string;
  const [current, setCurrent] = useState<Subscription | null>(mockCurrent);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleAutoRenew = () => {
    toast.success(current?.auto_renew ? t('autoRenewDisabled') : t('autoRenewEnabled'));
    if (current) setCurrent({ ...current, auto_renew: !current.auto_renew });
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.key === current?.plan) {
      toast(t('alreadyCurrent'));
      return;
    }
    setTargetPlan(plan);
    setShowSwitchModal(true);
  };

  const confirmSwitch = () => {
    if (!targetPlan) return;
    toast.success(t('planChanged', { plan: targetPlan.name }));
    setShowSwitchModal(false);
    setTargetPlan(null);
  };

  const handleCancel = () => {
    toast.success(t('cancelled'));
    setShowCancelModal(false);
  };

  const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success', trial: 'info', expired: 'danger', cancelled: 'warning',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('subscription')}</h1>
        <p className="text-sm text-surface-500">{t('manageSubscription')}</p>
      </div>

      {current && (
        <Card padding="md" className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Crown className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">{current.plan_name}</h2>
                  <Badge variant={statusBadge[current.status]}>{t(`status.${current.status}`)}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-surface-500">
                  <span className="text-2xl font-bold text-surface-900 dark:text-white">${current.price}</span>
                  <span>/ {current.period}</span>
                  <span><Clock className="h-3 w-3 inline me-1" />{t('renews')} {new Date(current.current_period_end).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
                <input type="checkbox" checked={current.auto_renew} onChange={handleAutoRenew} className="h-4 w-4 rounded border-surface-300 text-primary-600" />
                {t('autoRenew')}
              </label>
              <Button variant="danger" size="sm" onClick={() => setShowCancelModal(true)}>{t('cancelPlan')}</Button>
            </div>
          </div>
        </Card>
      )}

      {current && current.features.length > 0 && (
        <Card padding="md" className="mb-8">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-3">{t('currentFeatures')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {current.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </Card>
      )}

      <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t('availablePlans')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockPlans.map((plan) => {
          const isCurrent = plan.key === current?.plan;
          return (
            <Card key={plan.id} padding="md" className={`relative ${plan.is_featured ? 'ring-2 ring-primary-500 shadow-lg' : ''}`}>
              {plan.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary"><Sparkles className="h-3 w-3 me-1" />{t('popular')}</Badge>
                </div>
              )}
              <div className="text-center mb-4">
                <div className="h-10 w-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-3">
                  {plan.key === 'free' ? <CreditCard className="h-5 w-5 text-surface-500" /> :
                   plan.key === 'basic' ? <Zap className="h-5 w-5 text-blue-500" /> :
                   plan.key === 'professional' ? <Crown className="h-5 w-5 text-primary-600" /> :
                   <Sparkles className="h-5 w-5 text-warning-500" />}
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-surface-900 dark:text-white">${plan.price}</span>
                  <span className="text-sm text-surface-400">/{t('month')}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-300">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Button
                variant={isCurrent ? 'secondary' : plan.is_featured ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrent}
              >
                {isCurrent ? t('current') : t('subscribe')}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="mb-8">
        <Button variant="ghost" onClick={() => setShowHistory(!showHistory)}>
          {t('viewHistory')}
        </Button>
        {showHistory && (
          <Card padding="none" className="mt-2">
            {mockHistory.length === 0 ? (
              <div className="p-4 text-center text-sm text-surface-400">{t('noHistory')}</div>
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {mockHistory.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{sub.plan_name}</p>
                      <p className="text-xs text-surface-400">
                        {new Date(sub.current_period_start).toLocaleDateString()} - {new Date(sub.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={statusBadge[sub.status]}>{t(`status.${sub.status}`)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      <Modal isOpen={showSwitchModal} onClose={() => setShowSwitchModal(false)} title={t('changePlan')} size="sm">
        <div className="space-y-4">
          <Alert variant="info">
            {t('changePlanInfo')}
          </Alert>
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-700/30 rounded-lg">
            {targetPlan && (
              <>
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">{targetPlan.name}</p>
                  <p className="text-sm text-surface-500">${targetPlan.price}/{t('month')}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSwitchModal(false)}>{t('cancel')}</Button>
            <Button onClick={confirmSwitch}>{t('confirmChange')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title={t('cancelSubscription')} size="sm">
        <div className="space-y-4">
          <Alert variant="warning" title={t('areYouSure')}>
            {t('cancelWarning')}
          </Alert>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>{t('keepPlan')}</Button>
            <Button variant="danger" onClick={handleCancel}>{t('confirmCancel')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
