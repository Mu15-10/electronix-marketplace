'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { PageSpinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { adminLoyaltyApi } from '@/lib/api';
import { Reward, LoyaltyAdminStats } from '@/types';
import { Gift, Plus, Pencil, Trash2, Users, Award, TrendingUp, Medal, X } from 'lucide-react';
import toast from 'react-hot-toast';

const mockRewards: Reward[] = [
  { id: '1', name: '$10 Discount Voucher', description: 'Get $10 off your next purchase', points_cost: 500, reward_type: 'voucher', value: 10, currency: 'USD', stock: 50, is_active: true, created_at: '2026-01-15' },
  { id: '2', name: 'Free Shipping', description: 'Free standard shipping on any order', points_cost: 300, reward_type: 'free_shipping', value: 0, currency: 'USD', stock: 100, is_active: true, created_at: '2026-01-20' },
  { id: '3', name: '$25 Gift Card', description: 'Electronix Marketplace gift card', points_cost: 1200, reward_type: 'gift_card', value: 25, currency: 'USD', stock: 30, is_active: true, created_at: '2026-02-01' },
  { id: '4', name: '20% Discount Coupon', description: '20% off any single item (max $50)', points_cost: 2000, reward_type: 'discount', value: 20, currency: 'USD', stock: 0, is_active: false, created_at: '2026-02-10' },
];

const mockStats: LoyaltyAdminStats = {
  total_points_issued: 1250000,
  total_points_redeemed: 890000,
  active_users_by_tier: [
    { tier: 'bronze', count: 4520 },
    { tier: 'silver', count: 1230 },
    { tier: 'gold', count: 480 },
    { tier: 'platinum', count: 120 },
    { tier: 'vip', count: 25 },
  ],
};

const rewardTypeOptions = [
  { value: 'discount', label: 'Discount' },
  { value: 'free_shipping', label: 'Free Shipping' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'gift_card', label: 'Gift Card' },
  { value: 'product', label: 'Product' },
];

const emptyReward: Partial<Reward> = {
  name: '',
  description: '',
  points_cost: 100,
  reward_type: 'voucher',
  value: 0,
  currency: 'USD',
  stock: 10,
  is_active: true,
};

export default function AdminLoyaltyPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<LoyaltyAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      adminLoyaltyApi.getRewards().then((r) => r.data).catch(() => mockRewards),
      adminLoyaltyApi.getStats().then((r) => r.data).catch(() => mockStats),
    ]).then(([rewardsData, statsData]) => {
      setRewards(rewardsData);
      setStats(statsData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const openCreate = () => {
    setEditingReward({ ...emptyReward });
    setShowModal(true);
  };

  const openEdit = (reward: Reward) => {
    setEditingReward({ ...reward });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingReward) return;
    setSaving(true);
    try {
      if (editingReward.id) {
        await adminLoyaltyApi.updateReward(editingReward.id, editingReward as Record<string, unknown>);
        setRewards((prev) => prev.map((r) => r.id === editingReward.id ? { ...r, ...editingReward } as Reward : r));
        toast.success('Reward updated');
      } else {
        const res = await adminLoyaltyApi.createReward(editingReward as Record<string, unknown>);
        setRewards((prev) => [...prev, { ...editingReward, id: res.data.id || String(Date.now()), created_at: new Date().toISOString() } as Reward]);
        toast.success('Reward created');
      }
      setShowModal(false);
      setEditingReward(null);
    } catch {
      toast.error('Failed to save reward');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminLoyaltyApi.deleteReward(deleteId);
      setRewards((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success('Reward deleted');
    } catch {
      toast.error('Failed to delete reward');
    } finally {
      setDeleteId(null);
    }
  };

  const totalUsers = stats?.active_users_by_tier.reduce((a, b) => a + b.count, 0) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Loyalty Rewards</h1>
          <p className="text-sm text-surface-500">Manage rewards and loyalty program</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Reward</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Points Issued</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{(stats?.total_points_issued || 0).toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Points Redeemed</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{(stats?.total_points_redeemed || 0).toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <Gift className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Active Users</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Total Rewards</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{rewards.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Medal className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card padding="md" className="lg:col-span-3">
          <CardHeader>
            <h3 className="font-semibold text-surface-900 dark:text-white">Rewards</h3>
          </CardHeader>
          {rewards.length === 0 ? (
            <EmptyState title="No rewards yet" description="Create your first reward to get started." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Create Reward</Button>} />
          ) : (
            <CardContent>
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="h-10 w-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center shrink-0">
                      <Gift className="h-5 w-5 text-surface-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{reward.name}</p>
                      <div className="flex items-center gap-2 text-xs text-surface-500">
                        <span>{reward.points_cost.toLocaleString()} pts</span>
                        <Badge variant={reward.reward_type === 'voucher' ? 'primary' : reward.reward_type === 'gift_card' ? 'success' : 'info'} size="sm">{reward.reward_type}</Badge>
                        <span>Stock: {reward.stock}</span>
                      </div>
                    </div>
                    <Badge variant={reward.is_active ? 'success' : 'default'} size="sm">{reward.is_active ? 'Active' : 'Inactive'}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(reward)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(reward.id)}><Trash2 className="h-4 w-4 text-danger-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <Card padding="md">
          <CardHeader>
            <h3 className="font-semibold text-surface-900 dark:text-white">Users by Tier</h3>
          </CardHeader>
          <div className="space-y-3">
            {stats?.active_users_by_tier.map((t) => (
              <div key={t.tier}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize text-surface-700 dark:text-surface-300">{t.tier}</span>
                  <span className="font-medium text-surface-900 dark:text-white">{t.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${(t.count / totalUsers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingReward(null); }} title={editingReward?.id ? 'Edit Reward' : 'Create Reward'} size="lg">
        <div className="space-y-4">
          <Input label="Name" value={editingReward?.name || ''} onChange={(e) => setEditingReward((prev) => ({ ...prev, name: e.target.value }))} />
          <Textarea label="Description" value={editingReward?.description || ''} onChange={(e) => setEditingReward((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Points Cost" type="number" value={editingReward?.points_cost || 0} onChange={(e) => setEditingReward((prev) => ({ ...prev, points_cost: Number(e.target.value) }))} />
            <Select label="Reward Type" options={rewardTypeOptions} value={editingReward?.reward_type || 'voucher'} onChange={(e) => setEditingReward((prev) => ({ ...prev, reward_type: e.target.value as Reward['reward_type'] }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Value" type="number" value={editingReward?.value || 0} onChange={(e) => setEditingReward((prev) => ({ ...prev, value: Number(e.target.value) }))} />
            <Input label="Currency" value={editingReward?.currency || 'USD'} onChange={(e) => setEditingReward((prev) => ({ ...prev, currency: e.target.value }))} />
          </div>
          <Input label="Stock" type="number" value={editingReward?.stock || 0} onChange={(e) => setEditingReward((prev) => ({ ...prev, stock: Number(e.target.value) }))} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={editingReward?.is_active ?? true} onChange={(e) => setEditingReward((prev) => ({ ...prev, is_active: e.target.checked }))} className="rounded border-surface-300" />
            <label htmlFor="isActive" className="text-sm text-surface-700 dark:text-surface-300">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingReward(null); }}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingReward?.id ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Reward" size="sm">
        <p className="text-surface-600 dark:text-surface-300 mb-6">Are you sure you want to delete this reward? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
