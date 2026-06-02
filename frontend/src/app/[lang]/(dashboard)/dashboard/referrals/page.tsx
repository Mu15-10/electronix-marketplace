'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { PageSpinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { referralApi } from '@/lib/api';
import { ReferralStats, ReferralEntry, ReferralLeaderboardEntry } from '@/types';
import { UserPlus, Trophy, Copy, Share2, Users, DollarSign, Check, Link, TrendingUp, Award, Crown, Medal, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const mockStats: ReferralStats = { total_referrals: 12, converted: 8, pending: 3, earnings: 150 };

const mockReferrals: ReferralEntry[] = [
  { id: '1', referred_user_name: 'John Smith', date: '2026-05-20', status: 'rewarded', reward_amount: 25 },
  { id: '2', referred_user_name: 'Sarah Johnson', date: '2026-05-15', status: 'converted', reward_amount: 0 },
  { id: '3', referred_user_name: 'Mike Brown', date: '2026-05-10', status: 'pending', reward_amount: 0 },
  { id: '4', referred_user_name: 'Emily Davis', date: '2026-04-28', status: 'rewarded', reward_amount: 25 },
  { id: '5', referred_user_name: 'Alex Wilson', date: '2026-04-20', status: 'converted', reward_amount: 0 },
];

const mockLeaderboard: ReferralLeaderboardEntry[] = [
  { user: { id: '1', full_name: 'Alice Cooper' }, referral_count: 24, conversion_rate: 0.85 },
  { user: { id: '2', full_name: 'Bob Martin' }, referral_count: 18, conversion_rate: 0.72 },
  { user: { id: '3', full_name: 'Carol White' }, referral_count: 15, conversion_rate: 0.68 },
  { user: { id: '4', full_name: 'You' }, referral_count: 12, conversion_rate: 0.67 },
  { user: { id: '5', full_name: 'Dave Green' }, referral_count: 10, conversion_rate: 0.60 },
];

export default function ReferralsPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [referralCode, setReferralCode] = useState('ELECTRO-ABC123');
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${lang}/register?ref=${referralCode}`;

  useEffect(() => {
    Promise.all([
      referralApi.getStats().then((r) => r.data).catch(() => mockStats),
      referralApi.getReferrals().then((r) => r.data).catch(() => mockReferrals),
      referralApi.getCode().then((r) => r.data.code).catch(() => 'ELECTRO-ABC123'),
      referralApi.getLeaderboard().then((r) => r.data).catch(() => mockLeaderboard),
    ]).then(([statsData, referralsData, code, lb]) => {
      setStats(statsData);
      setReferrals(referralsData);
      setReferralCode(code);
      setLeaderboard(lb);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusVariant: Record<string, 'success' | 'primary' | 'warning'> = {
    rewarded: 'success',
    converted: 'primary',
    pending: 'warning',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Referral Program</h1>

      <Card padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <div className="flex-1">
            <p className="text-sm text-surface-500 mb-1">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-wider text-primary-600 dark:text-primary-400">{referralCode}</span>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(referralCode, 'Referral code')}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => copyToClipboard(referralLink, 'Referral link')}>
              <Link className="h-4 w-4" /> Copy Link
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on Electronix Marketplace! Use my referral code: ${referralCode}`)}`, '_blank')}>
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.open(`mailto:?subject=Join Electronix Marketplace&body=${encodeURIComponent(`Use my referral code ${referralCode} to sign up!`)}`)}>
              <Send className="h-4 w-4" /> Email
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Total Referrals</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stats?.total_referrals || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Converted</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stats?.converted || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Pending</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stats?.pending || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-500">Earnings</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{formatPrice(stats?.earnings || 0)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="referrals">
        <TabList>
          <Tab value="referrals"><Users className="h-4 w-4" /> Referrals</Tab>
          <Tab value="leaderboard"><Trophy className="h-4 w-4" /> Leaderboard</Tab>
        </TabList>

        <TabPanel value="referrals">
          {referrals.length === 0 ? (
            <EmptyState
              title="No referrals yet"
              description="Share your referral code with friends and earn rewards when they join!"
              icon={<UserPlus className="h-12 w-12" />}
              action={
                <Button onClick={() => copyToClipboard(referralLink, 'Referral link')}>
                  <Share2 className="h-4 w-4" /> Invite Friends
                </Button>
              }
            />
          ) : (
            <Card padding="none">
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider">
                  <span>Referred User</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span className="text-end">Reward</span>
                </div>
                {referrals.map((ref) => (
                  <div key={ref.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm items-center hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <span className="font-medium text-surface-900 dark:text-white">{ref.referred_user_name}</span>
                    <span className="text-surface-500">{formatDate(ref.date)}</span>
                    <Badge variant={statusVariant[ref.status]} size="sm">{ref.status}</Badge>
                    <span className="text-end font-semibold text-green-600">{ref.reward_amount > 0 ? `+${formatPrice(ref.reward_amount)}` : '-'}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabPanel>

        <TabPanel value="leaderboard">
          {leaderboard.length === 0 ? (
            <EmptyState title="No data yet" description="Leaderboard will populate as users refer friends." icon={<Trophy className="h-12 w-12" />} />
          ) : (
            <Card padding="none">
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {leaderboard.map((entry, index) => {
                  const isYou = entry.user.full_name === 'You';
                  return (
                    <div key={entry.user.id} className={`flex items-center gap-4 px-4 py-3 ${isYou ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                      <div className="w-8 text-center">
                        {index === 0 ? <Crown className="h-5 w-5 text-yellow-500 mx-auto" /> : index === 1 ? <Medal className="h-5 w-5 text-slate-400 mx-auto" /> : index === 2 ? <Award className="h-5 w-5 text-amber-600 mx-auto" /> : <span className="text-sm font-medium text-surface-400">{index + 1}</span>}
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300">
                          {entry.user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium ${isYou ? 'text-primary-600' : 'text-surface-900 dark:text-white'}`}>
                          {entry.user.full_name} {isYou && '(You)'}
                        </span>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{entry.referral_count} referrals</p>
                        <p className="text-xs text-surface-400">{Math.round(entry.conversion_rate * 100)}% conversion</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
