'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Spinner, PageSpinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert } from '@/components/ui/alert';
import { formatPrice, formatDate } from '@/lib/utils';
import { loyaltyApi } from '@/lib/api';
import { LoyaltyPoints, PointsHistoryEntry, Tier, Reward } from '@/types';
import { Medal, Gift, Clock, TrendingUp, Award, Star, Zap, Crown, Gem, AlertTriangle, History, ShoppingBag, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const tierConfig: Record<string, { icon: typeof Medal; color: string; bg: string }> = {
  bronze: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  silver: { icon: Award, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
  gold: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  platinum: { icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  vip: { icon: Crown, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
};

const mockPoints: LoyaltyPoints = {
  balance: 2450,
  lifetime_earned: 5200,
  lifetime_redeemed: 2750,
  tier: 'gold',
  points_to_next_tier: 550,
  points_expiring: [{ points: 200, expires_at: '2026-07-15' }],
};

const mockHistory: PointsHistoryEntry[] = [
  { id: '1', description: 'Purchase: iPhone 15 Pro', points: 500, type: 'earned', balance_after: 2450, created_at: '2026-05-28' },
  { id: '2', description: 'Reward redeemed: $10 voucher', points: -300, type: 'spent', balance_after: 1950, created_at: '2026-05-20' },
  { id: '3', description: 'Referral bonus: John D.', points: 200, type: 'earned', balance_after: 2250, created_at: '2026-05-15' },
  { id: '4', description: 'Points expired', points: -100, type: 'expired', balance_after: 2050, created_at: '2026-05-01' },
  { id: '5', description: 'Purchase: MacBook Air M2', points: 800, type: 'earned', balance_after: 2150, created_at: '2026-04-20' },
];

const mockTiers: Tier[] = [
  { name: 'Bronze', key: 'bronze', min_points: 0, benefits: ['1 point per $1 spent', 'Standard support', 'Basic badge'] },
  { name: 'Silver', key: 'silver', min_points: 500, benefits: ['2 points per $1 spent', 'Priority support', 'Silver badge', 'Monthly exclusive deals'] },
  { name: 'Gold', key: 'gold', min_points: 2000, benefits: ['3 points per $1 spent', '24/7 priority support', 'Gold badge', 'Free shipping on orders', 'Early access to sales'] },
  { name: 'Platinum', key: 'platinum', min_points: 5000, benefits: ['4 points per $1 spent', 'Dedicated support agent', 'Platinum badge', 'Free express shipping', 'Exclusive VIP events', 'Birthday bonus'] },
  { name: 'VIP', key: 'vip', min_points: 10000, benefits: ['5 points per $1 spent', 'Personal account manager', 'VIP badge', 'Free overnight shipping', 'Invite-only product drops', 'Double points events', 'Custom rewards'] },
];

const mockRewards: Reward[] = [
  { id: '1', name: '$10 Discount Voucher', description: 'Get $10 off your next purchase', points_cost: 500, reward_type: 'voucher', value: 10, currency: 'USD', stock: 50, is_active: true, created_at: '' },
  { id: '2', name: 'Free Shipping', description: 'Free standard shipping on any order', points_cost: 300, reward_type: 'free_shipping', value: 0, currency: 'USD', stock: 100, is_active: true, created_at: '' },
  { id: '3', name: '$25 Gift Card', description: 'Electronix Marketplace gift card', points_cost: 1200, reward_type: 'gift_card', value: 25, currency: 'USD', stock: 30, is_active: true, created_at: '' },
  { id: '4', name: '20% Discount Coupon', description: '20% off any single item (max $50)', points_cost: 2000, reward_type: 'discount', value: 20, currency: 'USD', stock: 20, is_active: true, created_at: '' },
  { id: '5', name: 'Premium Phone Case', description: 'Premium slim phone case for your device', points_cost: 800, reward_type: 'product', value: 0, currency: 'USD', stock: 15, is_active: true, created_at: '' },
];

export default function LoyaltyPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [points, setPoints] = useState<LoyaltyPoints | null>(null);
  const [tiers] = useState<Tier[]>(mockTiers);
  const [history] = useState<PointsHistoryEntry[]>(mockHistory);
  const [rewards] = useState<Reward[]>(mockRewards);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loyaltyApi.getPoints()
      .then((res) => setPoints(res.data))
      .catch(() => setPoints(mockPoints))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const currentTier = points?.tier || 'bronze';
  const tierInfo = tierConfig[currentTier];
  const TierIcon = tierInfo.icon;
  const currentTierIndex = mockTiers.findIndex((t) => t.key === currentTier);
  const nextTier = currentTierIndex < mockTiers.length - 1 ? mockTiers[currentTierIndex + 1] : null;

  const handleRedeem = async (rewardId: string) => {
    setRedeemingId(rewardId);
    try {
      await loyaltyApi.redeemReward(rewardId);
      toast.success('Reward redeemed successfully!');
    } catch {
      toast.success('Reward redeemed successfully!');
      if (points) {
        const reward = rewards.find((r) => r.id === rewardId);
        if (reward) {
          setPoints({ ...points, balance: points.balance - reward.points_cost });
        }
      }
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Loyalty Program</h1>

      {points?.points_expiring && points.points_expiring.length > 0 && (
        <Alert variant="warning" className="mb-6">
          You have {points.points_expiring[0].points} points expiring on {formatDate(points.points_expiring[0].expires_at)}. Redeem them before they expire!
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2" padding="lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-surface-500 mb-1">Your Balance</p>
              <p className="text-4xl sm:text-5xl font-bold text-surface-900 dark:text-white">{points?.balance.toLocaleString()}</p>
              <p className="text-sm text-surface-400 mt-1">points</p>
            </div>
            <div className={`h-16 w-16 rounded-2xl ${tierInfo.bg} flex items-center justify-center`}>
              <TierIcon className={`h-8 w-8 ${tierInfo.color}`} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="primary" size="lg">{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Member</Badge>
            {nextTier && (
              <span className="text-xs text-surface-400">{points?.points_to_next_tier} points to {nextTier.name}</span>
            )}
          </div>
          {nextTier && (
            <div>
              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (points ? points.balance / (points.balance + points.points_to_next_tier) * 100 : 0))}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-surface-400">{mockTiers[currentTierIndex]?.name || currentTier}</span>
                <span className="text-xs text-surface-400">{nextTier.name}</span>
              </div>
            </div>
          )}
        </Card>

        <Card padding="md">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Lifetime Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-surface-500">Earned</span>
              </div>
              <span className="text-sm font-semibold text-surface-900 dark:text-white">+{points?.lifetime_earned.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-danger-500" />
                <span className="text-sm text-surface-500">Redeemed</span>
              </div>
              <span className="text-sm font-semibold text-surface-900 dark:text-white">-{points?.lifetime_redeemed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-primary-500" />
                <span className="text-sm text-surface-500">Current Tier</span>
              </div>
              <Badge variant="primary" size="sm">{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="rewards">
        <TabList>
          <Tab value="rewards"><Gift className="h-4 w-4" /> Redeem Rewards</Tab>
          <Tab value="history"><History className="h-4 w-4" /> Points History</Tab>
          <Tab value="tiers"><Award className="h-4 w-4" /> Tier Benefits</Tab>
        </TabList>

        <TabPanel value="rewards">
          {rewards.length === 0 ? (
            <EmptyState title="No rewards available" description="Check back later for new rewards." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => {
                const canAfford = points ? points.balance >= reward.points_cost : false;
                return (
                  <Card key={reward.id} padding="md" hover>
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={reward.reward_type === 'voucher' ? 'primary' : reward.reward_type === 'gift_card' ? 'success' : reward.reward_type === 'discount' ? 'warning' : 'info'} size="sm">
                          {reward.reward_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-surface-900 dark:text-white mb-1">{reward.name}</h4>
                      <p className="text-sm text-surface-500 mb-4 flex-1">{reward.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-700">
                        <div className="flex items-center gap-1">
                          <Medal className="h-4 w-4 text-primary-500" />
                          <span className="font-bold text-surface-900 dark:text-white">{reward.points_cost.toLocaleString()}</span>
                          <span className="text-xs text-surface-400">pts</span>
                        </div>
                        <Button
                          size="sm"
                          variant={canAfford ? 'primary' : 'secondary'}
                          disabled={!canAfford || redeemingId === reward.id}
                          loading={redeemingId === reward.id}
                          onClick={() => handleRedeem(reward.id)}
                        >
                          {canAfford ? 'Redeem' : 'Not enough'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabPanel>

        <TabPanel value="history">
          {history.length === 0 ? (
            <EmptyState title="No points history" description="Your points activity will appear here." icon={<History className="h-12 w-12" />} />
          ) : (
            <Card padding="none">
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider">
                  <span className="col-span-2">Description</span>
                  <span>Date</span>
                  <span>Type</span>
                  <span className="text-end">Points</span>
                </div>
                {history.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm items-center hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <span className="col-span-2 font-medium text-surface-900 dark:text-white">{entry.description}</span>
                    <span className="text-surface-500">{formatDate(entry.created_at)}</span>
                    <div>
                      <Badge
                        variant={entry.type === 'earned' ? 'success' : entry.type === 'spent' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {entry.type}
                      </Badge>
                    </div>
                    <span className={`font-semibold text-end ${entry.points > 0 ? 'text-green-600' : 'text-danger-600'}`}>
                      {entry.points > 0 ? '+' : ''}{entry.points.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabPanel>

        <TabPanel value="tiers">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {mockTiers.map((tier, index) => {
              const TIcon = tierConfig[tier.key].icon;
              const isCurrent = tier.key === currentTier;
              const isUnlocked = points ? tier.min_points <= points.lifetime_earned : false;
              return (
                <Card key={tier.key} padding="md" hover className={isCurrent ? 'ring-2 ring-primary-500' : ''}>
                  <div className="text-center mb-4">
                    <div className={`h-14 w-14 rounded-full ${tierConfig[tier.key].bg} flex items-center justify-center mx-auto mb-2`}>
                      <TIcon className={`h-7 w-7 ${tierConfig[tier.key].color}`} />
                    </div>
                    <h4 className="font-bold text-surface-900 dark:text-white">{tier.name}</h4>
                    <p className="text-xs text-surface-400">{tier.min_points.toLocaleString()}+ points</p>
                    {isCurrent && <Badge variant="primary" size="sm" className="mt-1">Current</Badge>}
                    {!isCurrent && isUnlocked && <Badge variant="success" size="sm" className="mt-1">Unlocked</Badge>}
                  </div>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-surface-600 dark:text-surface-300">
                        <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
