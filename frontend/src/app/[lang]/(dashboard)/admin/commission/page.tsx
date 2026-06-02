'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSpinner } from '@/components/ui/spinner';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { DollarSign, Settings, Plus, Trash2, Edit, TrendingUp, Percent, BarChart3 } from 'lucide-react';
import { CommissionConfig, PlatformRevenueSummary } from '@/types';
import { commissionApi } from '@/lib/api';

const mockConfigs: CommissionConfig[] = [
  { id: 'cfg-1', name: 'Default Commission', type: 'percentage', value: 8.5, min_fee: 1.00, max_fee: 500.00, priority: 1, status: 'active', created_at: '2024-01-01T00:00:00Z' },
  { id: 'cfg-2', name: 'Smartphones Fixed', type: 'fixed', value: 5.00, category_override: 'smartphones', priority: 2, status: 'active', created_at: '2024-01-15T00:00:00Z' },
  { id: 'cfg-3', name: 'Premium Sellers', type: 'percentage', value: 5.0, seller_level_override: 4, min_fee: 0.50, priority: 3, status: 'active', created_at: '2024-01-20T00:00:00Z' },
  { id: 'cfg-4', name: 'Legacy Rate', type: 'percentage', value: 10.0, priority: 0, status: 'inactive', created_at: '2023-06-01T00:00:00Z' },
];

const mockRevenue: PlatformRevenueSummary = {
  total_revenue: 45230.00,
  by_month: [
    { month: '2024-01', revenue: 12000 },
    { month: '2024-02', revenue: 15230 },
    { month: '2024-03', revenue: 18000 },
  ],
  by_category: [
    { category: 'Smartphones', revenue: 18500 },
    { category: 'Laptops', revenue: 12300 },
    { category: 'Tablets', revenue: 7200 },
    { category: 'Accessories', revenue: 4230 },
    { category: 'Audio', revenue: 3000 },
  ],
};

const typeOptions = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed' },
];

const emptyConfig: CommissionConfig = {
  id: '', name: '', type: 'percentage', value: 0, priority: 0, status: 'active', created_at: '',
};

export default function AdminCommissionPage() {
  const t = useTranslations('commission');
  const params = useParams();
  const lang = params.lang as string;
  const [configs, setConfigs] = useState<CommissionConfig[]>(mockConfigs);
  const [revenue] = useState<PlatformRevenueSummary>(mockRevenue);
  const [loading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CommissionConfig>(emptyConfig);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = () => {
    if (!editingConfig.name || editingConfig.value <= 0) {
      toast.error(t('fillRequired'));
      return;
    }
    if (editingConfig.id) {
      setConfigs(configs.map((c) => (c.id === editingConfig.id ? editingConfig : c)));
      toast.success(t('configUpdated'));
    } else {
      const newConfig = { ...editingConfig, id: `cfg-${Date.now()}`, created_at: new Date().toISOString() };
      setConfigs([...configs, newConfig]);
      toast.success(t('configCreated'));
    }
    setShowFormModal(false);
    setEditingConfig(emptyConfig);
  };

  const handleEdit = (config: CommissionConfig) => {
    setEditingConfig(config);
    setShowFormModal(true);
  };

  const handleDelete = (id: string) => {
    setConfigs(configs.filter((c) => c.id !== id));
    toast.success(t('configDeleted'));
    setDeleteConfirm(null);
  };

  const toggleStatus = (config: CommissionConfig) => {
    setConfigs(configs.map((c) => (c.id === config.id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' as const } : c)));
    toast.success(t(config.status === 'active' ? 'configDeactivated' : 'configActivated'));
  };

  const revenueCards = [
    { icon: DollarSign, label: t('totalRevenue'), value: `$${revenue.total_revenue.toFixed(2)}`, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { icon: BarChart3, label: t('thisMonth'), value: `$${revenue.by_month[revenue.by_month.length - 1]?.revenue.toFixed(2) || '0'}`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: Percent, label: t('avgCommission'), value: '8.5%', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: TrendingUp, label: t('monthlyGrowth'), value: '+15%', color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
  ];

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('commissionConfigs')}</h1>
          <p className="text-sm text-surface-500">{t('manageConfigs')}</p>
        </div>
        <Button onClick={() => { setEditingConfig(emptyConfig); setShowFormModal(true); }}>
          <Plus className="h-4 w-4" /> {t('addConfig')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {revenueCards.map((card, idx) => (
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

      <Card padding="none" className="mb-8">
        {configs.length === 0 ? (
          <EmptyState icon={<Settings className="h-16 w-16" />} title={t('noConfigs')} description={t('noConfigsDesc')} />
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {configs.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{config.name}</p>
                    <Badge variant={config.status === 'active' ? 'success' : 'default'} size="sm">
                      {t(`configStatus.${config.status}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                    <span className="font-mono">{config.type === 'percentage' ? `${config.value}%` : `$${config.value}`}</span>
                    {config.category_override && <span>{config.category_override}</span>}
                    {config.seller_level_override && <span>{t('level')} {config.seller_level_override}</span>}
                    {config.min_fee !== undefined && <span>{t('min')}: ${config.min_fee}</span>}
                    {config.max_fee !== undefined && <span>{t('max')}: ${config.max_fee}</span>}
                    <span>{t('priority')}: {config.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(config)}>
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${config.status === 'active' ? 'bg-green-500' : 'bg-surface-400'}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(config)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {deleteConfirm === config.id ? (
                    <div className="flex items-center gap-1">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(config.id)}>{t('confirm')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>{t('cancel')}</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(config.id)}>
                      <Trash2 className="h-4 w-4 text-danger-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t('revenueByMonth')}</h3>
          <div className="space-y-3">
            {revenue.by_month.map((m) => (
              <div key={m.month} className="flex items-center justify-between">
                <span className="text-sm text-surface-600 dark:text-surface-300">{m.month}</span>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(m.revenue / revenue.total_revenue) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-surface-900 dark:text-white">${m.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t('revenueByCategory')}</h3>
          <div className="space-y-3">
            {revenue.by_category.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="text-sm text-surface-600 dark:text-surface-300">{c.category}</span>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(c.revenue / revenue.total_revenue) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-surface-900 dark:text-white">${c.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingConfig.id ? t('editConfig') : t('newConfig')} size="lg">
        <div className="space-y-4">
          <Input
            label={t('configName')}
            value={editingConfig.name}
            onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
            placeholder={t('configNamePlaceholder')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('configType')}
              value={editingConfig.type}
              onChange={(e) => setEditingConfig({ ...editingConfig, type: e.target.value as 'fixed' | 'percentage' })}
              options={typeOptions}
            />
            <Input
              label={t('value')}
              type="number" step="0.01"
              value={editingConfig.value || ''}
              onChange={(e) => setEditingConfig({ ...editingConfig, value: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('minFee')}
              type="number" step="0.01"
              value={editingConfig.min_fee ?? ''}
              onChange={(e) => setEditingConfig({ ...editingConfig, min_fee: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
            <Input
              label={t('maxFee')}
              type="number" step="0.01"
              value={editingConfig.max_fee ?? ''}
              onChange={(e) => setEditingConfig({ ...editingConfig, max_fee: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('categoryOverride')}
              value={editingConfig.category_override || ''}
              onChange={(e) => setEditingConfig({ ...editingConfig, category_override: e.target.value || undefined })}
              placeholder={t('optional')}
            />
            <Input
              label={t('sellerLevel')}
              type="number"
              value={editingConfig.seller_level_override ?? ''}
              onChange={(e) => setEditingConfig({ ...editingConfig, seller_level_override: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder={t('optional')}
            />
            <Input
              label={t('priority')}
              type="number"
              value={editingConfig.priority}
              onChange={(e) => setEditingConfig({ ...editingConfig, priority: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{editingConfig.id ? t('update') : t('create')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
