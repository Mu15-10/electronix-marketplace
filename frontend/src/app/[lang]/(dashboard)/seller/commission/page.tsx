'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSpinner } from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp, Wallet, Percent, Download, Filter, Search, Clock, CheckCircle } from 'lucide-react';
import { CommissionEntry, CommissionSummary } from '@/types';
import { commissionApi } from '@/lib/api';

const mockSummary: CommissionSummary = {
  total_commission_paid: 2450.00,
  pending_commission: 380.50,
  net_earnings: 18320.00,
  platform_fees: 420.75,
  current_rate: 8.5,
};

const mockHistory: CommissionEntry[] = [
  { id: 'c1', sale_amount: 999.00, commission_percentage: 8.5, commission_amount: 84.92, platform_fee: 4.25, tax: 12.74, net: 897.09, status: 'paid', sale: { id: 's1', listing_title: 'iPhone 15 Pro' }, created_at: '2024-02-10T10:00:00Z' },
  { id: 'c2', sale_amount: 599.00, commission_percentage: 8.5, commission_amount: 50.92, platform_fee: 2.55, tax: 7.64, net: 537.89, status: 'paid', sale: { id: 's2', listing_title: 'Samsung Galaxy S24' }, created_at: '2024-02-08T14:00:00Z' },
  { id: 'c3', sale_amount: 1299.00, commission_percentage: 8.5, commission_amount: 110.42, platform_fee: 5.52, tax: 16.56, net: 1166.50, status: 'paid', sale: { id: 's3', listing_title: 'MacBook Pro M3' }, created_at: '2024-02-05T09:00:00Z' },
  { id: 'c4', sale_amount: 349.00, commission_percentage: 8.5, commission_amount: 29.67, platform_fee: 1.48, tax: 4.45, net: 313.40, status: 'pending', sale: { id: 's4', listing_title: 'AirPods Max' }, created_at: '2024-02-12T16:00:00Z' },
  { id: 'c5', sale_amount: 749.00, commission_percentage: 8.5, commission_amount: 63.67, platform_fee: 3.18, tax: 9.55, net: 672.60, status: 'pending', sale: { id: 's5', listing_title: 'iPad Air' }, created_at: '2024-02-11T11:00:00Z' },
];

export default function SellerCommissionPage() {
  const t = useTranslations('commission');
  const params = useParams();
  const lang = params.lang as string;
  const [summary] = useState<CommissionSummary>(mockSummary);
  const [history] = useState<CommissionEntry[]>(mockHistory);
  const [loading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const summaryCards = [
    { icon: DollarSign, label: t('totalCommissionPaid'), value: `$${summary.total_commission_paid.toFixed(2)}`, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { icon: Clock, label: t('pendingCommission'), value: `$${summary.pending_commission.toFixed(2)}`, color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
    { icon: Wallet, label: t('netEarnings'), value: `$${summary.net_earnings.toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: TrendingUp, label: t('platformFees'), value: `$${summary.platform_fees.toFixed(2)}`, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  ];

  const handleExport = () => {
    toast.success(t('exportStarted'));
  };

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = entry.sale.listing_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('commission')}</h1>
          <p className="text-sm text-surface-500">{t('manageCommission')}</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" /> {t('export')}
        </Button>
      </div>

      <Card padding="md" className="mb-6">
        <div className="flex items-center gap-3">
          <Percent className="h-5 w-5 text-primary-600" />
          <div>
            <p className="text-sm text-surface-500">{t('currentRate')}</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white">{summary.current_rate}%</p>
          </div>
          <div className="text-xs text-surface-400 ms-4">{t('rateInfo')}</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card, idx) => (
          <Card key={idx} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{card.label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">{t('commissionHistory')}</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('search')}
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <EmptyState title={t('noHistory')} description={t('noHistoryDesc')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-start py-3 px-2 text-surface-500 font-medium">{t('date')}</th>
                  <th className="text-start py-3 px-2 text-surface-500 font-medium">{t('listing')}</th>
                  <th className="text-end py-3 px-2 text-surface-500 font-medium">{t('saleAmount')}</th>
                  <th className="text-end py-3 px-2 text-surface-500 font-medium">{t('commissionPercent')}</th>
                  <th className="text-end py-3 px-2 text-surface-500 font-medium">{t('commissionAmount')}</th>
                  <th className="text-end py-3 px-2 text-surface-500 font-medium">{t('platformFee')}</th>
                  <th className="text-end py-3 px-2 text-surface-500 font-medium">{t('tax')}</th>
                  <th className="text-end py-3 px-2 text-surface-500 font-medium">{t('net')}</th>
                  <th className="text-center py-3 px-2 text-surface-500 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-2 text-surface-600 dark:text-surface-300 whitespace-nowrap">{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-2 text-surface-900 dark:text-white font-medium">{entry.sale.listing_title}</td>
                    <td className="py-3 px-2 text-end text-surface-900 dark:text-white">${entry.sale_amount.toFixed(2)}</td>
                    <td className="py-3 px-2 text-end text-surface-600 dark:text-surface-300">{entry.commission_percentage}%</td>
                    <td className="py-3 px-2 text-end text-surface-900 dark:text-white">${entry.commission_amount.toFixed(2)}</td>
                    <td className="py-3 px-2 text-end text-surface-600 dark:text-surface-300">${entry.platform_fee.toFixed(2)}</td>
                    <td className="py-3 px-2 text-end text-surface-600 dark:text-surface-300">${entry.tax.toFixed(2)}</td>
                    <td className="py-3 px-2 text-end text-surface-900 dark:text-white font-medium">${entry.net.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={entry.status === 'paid' ? 'success' : 'warning'} size="sm">
                        {entry.status === 'paid' ? <CheckCircle className="h-3 w-3 me-1" /> : <Clock className="h-3 w-3 me-1" />}
                        {t(`entryStatus.${entry.status}`)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
