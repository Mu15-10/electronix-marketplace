'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { advertisingApi } from '@/lib/api';
import { Campaign, Ad } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, Play, Pause, StopCircle, TrendingUp, Eye, MousePointerClick,
  DollarSign, Megaphone, BarChart3,
} from 'lucide-react';

const placements = [
  { value: 'home_top', label: 'Home Top' },
  { value: 'home_bottom', label: 'Home Bottom' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'search_results', label: 'Search Results' },
  { value: 'listing_detail', label: 'Listing Detail' },
];

const adTypes = [
  { value: 'banner', label: 'Banner' },
  { value: 'video', label: 'Video' },
  { value: 'native', label: 'Native' },
];

const locationOptions = [
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'Europe' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'TR', label: 'Turkey' },
  { value: 'AE', label: 'UAE' },
  { value: 'ALL', label: 'All Locations' },
];

const deviceOptions = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'all', label: 'All Devices' },
];

const categoryOptions = [
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'cameras', label: 'Cameras' },
  { value: 'watches', label: 'Watches' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'all', label: 'All Categories' },
];

interface CampaignForm {
  name: string;
  description: string;
  budget: string;
  daily_budget: string;
  start_date: string;
  end_date: string;
  targeting_locations: string;
  targeting_devices: string;
  targeting_categories: string;
}

interface AdForm {
  campaign_id: string;
  title: string;
  description: string;
  type: string;
  placement: string;
  bid_amount: string;
}

export default function AdvertisingPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignModal, setCampaignModal] = useState(false);
  const [adModal, setAdModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [campaignForm, setCampaignForm] = useState<CampaignForm>({
    name: '', description: '', budget: '', daily_budget: '',
    start_date: '', end_date: '', targeting_locations: 'ALL',
    targeting_devices: 'all', targeting_categories: 'all',
  });

  const [adForm, setAdForm] = useState<AdForm>({
    campaign_id: '', title: '', description: '', type: 'banner', placement: 'home_top', bid_amount: '',
  });

  const [adImage, setAdImage] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, analyticsRes] = await Promise.all([
        advertisingApi.getCampaigns(),
        advertisingApi.getAnalytics(),
      ]);
      setCampaigns(campRes.data.results || campRes.data || []);
      setAnalytics(analyticsRes.data || {});
    } catch { /* ignore */ }
    setLoading(false);
    setAnalyticsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchAds = async (campaignId?: string) => {
    try {
      const res = await advertisingApi.getCampaignAds(campaignId || '');
      setAds(res.data.results || res.data || []);
    } catch { setAds([]); }
  };

  useEffect(() => {
    if (activeTab === 'ads') fetchAds();
  }, [activeTab]);

  const handleCreateCampaign = async () => {
    setSubmitting(true);
    try {
      const data = {
        name: campaignForm.name,
        description: campaignForm.description,
        budget: Number(campaignForm.budget),
        daily_budget: campaignForm.daily_budget ? Number(campaignForm.daily_budget) : undefined,
        start_date: campaignForm.start_date,
        end_date: campaignForm.end_date || undefined,
        targeting: {
          locations: campaignForm.targeting_locations === 'ALL' ? [] : [campaignForm.targeting_locations],
          devices: campaignForm.targeting_devices === 'all' ? [] : [campaignForm.targeting_devices],
          categories: campaignForm.targeting_categories === 'all' ? [] : [campaignForm.targeting_categories],
        },
      };
      if (editingCampaign) {
        await advertisingApi.updateCampaign(editingCampaign.id, data);
        toast.success('Campaign updated');
      } else {
        await advertisingApi.createCampaign(data);
        toast.success('Campaign created');
      }
      setCampaignModal(false);
      resetCampaignForm();
      fetchData();
    } catch { toast.error('Failed to save campaign'); }
    setSubmitting(false);
  };

  const handlePauseCampaign = async (id: string) => {
    try { await advertisingApi.pauseCampaign(id); toast.success('Campaign paused'); fetchData(); }
    catch { toast.error('Failed to pause'); }
  };

  const handleResumeCampaign = async (id: string) => {
    try { await advertisingApi.resumeCampaign(id); toast.success('Campaign resumed'); fetchData(); }
    catch { toast.error('Failed to resume'); }
  };

  const handleEndCampaign = async (id: string) => {
    try { await advertisingApi.endCampaign(id); toast.success('Campaign ended'); fetchData(); }
    catch { toast.error('Failed to end'); }
  };

  const handleCreateAd = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('campaign_id', adForm.campaign_id);
      formData.append('title', adForm.title);
      formData.append('description', adForm.description);
      formData.append('type', adForm.type);
      formData.append('placement', adForm.placement);
      formData.append('bid_amount', adForm.bid_amount);
      if (adImage) formData.append('image', adImage);
      await advertisingApi.createAd(formData);
      toast.success('Ad created');
      setAdModal(false);
      resetAdForm();
      fetchAds();
    } catch { toast.error('Failed to create ad'); }
    setSubmitting(false);
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    try { await advertisingApi.deleteAd(id); toast.success('Ad deleted'); fetchAds(); }
    catch { toast.error('Failed to delete'); }
  };

  const resetCampaignForm = () => {
    setCampaignForm({ name: '', description: '', budget: '', daily_budget: '', start_date: '', end_date: '', targeting_locations: 'ALL', targeting_devices: 'all', targeting_categories: 'all' });
    setEditingCampaign(null);
  };

  const resetAdForm = () => {
    setAdForm({ campaign_id: '', title: '', description: '', type: 'banner', placement: 'home_top', bid_amount: '' });
    setAdImage(null);
  };

  const openEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || '',
      budget: String(campaign.budget),
      daily_budget: campaign.daily_budget ? String(campaign.daily_budget) : '',
      start_date: campaign.start_date?.split('T')[0] || '',
      end_date: campaign.end_date?.split('T')[0] || '',
      targeting_locations: campaign.targeting?.locations?.[0] || 'ALL',
      targeting_devices: campaign.targeting?.devices?.[0] || 'all',
      targeting_categories: campaign.targeting?.categories?.[0] || 'all',
    });
    setCampaignModal(true);
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" label="Loading advertising..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Advertising</h1>
          <p className="text-sm text-surface-500">{campaigns.length} campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { resetCampaignForm(); setCampaignModal(true); }}>
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
          <Link href={`/${lang}/dashboard/advertising/create`}>
            <Button><Megaphone className="h-4 w-4" /> Create Campaign</Button>
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      {!analyticsLoading && Object.keys(analytics).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Impressions', value: analytics.total_impressions || 0, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { label: 'Total Clicks', value: analytics.total_clicks || 0, icon: MousePointerClick, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
            { label: 'Avg CTR', value: analytics.avg_ctr ? `${(analytics.avg_ctr * 100).toFixed(2)}%` : '0%', icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
            { label: 'Total Spend', value: analytics.total_spend ? formatPrice(analytics.total_spend) : '$0', icon: DollarSign, color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
          ].map((stat, i) => (
            <Card key={i} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-surface-500">{stat.label}</p>
                  <p className="text-lg font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="campaigns" onChange={setActiveTab}>
        <TabList>
          <Tab value="campaigns">Campaigns</Tab>
          <Tab value="ads">Ads</Tab>
        </TabList>

        <TabPanel value="campaigns">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-16 w-16" />}
              title="No campaigns yet"
              description="Create your first advertising campaign to reach more buyers."
              action={
                <Button onClick={() => { resetCampaignForm(); setCampaignModal(true); }}>
                  <Plus className="h-4 w-4" /> Create Campaign
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} padding="md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">{campaign.name}</h3>
                      {campaign.description && (
                        <p className="text-sm text-surface-500 mt-0.5">{campaign.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : campaign.status === 'ended' ? 'default' : 'info'} size="sm">
                          {campaign.status}
                        </Badge>
                        <span className="text-xs text-surface-400">
                          {formatDate(campaign.start_date)} {campaign.end_date ? `- ${formatDate(campaign.end_date)}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {campaign.status === 'active' && (
                        <button onClick={() => handlePauseCampaign(campaign.id)}
                          className="p-2 rounded-lg text-surface-400 hover:text-warning-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                          title="Pause"><Pause className="h-4 w-4" /></button>
                      )}
                      {campaign.status === 'paused' && (
                        <button onClick={() => handleResumeCampaign(campaign.id)}
                          className="p-2 rounded-lg text-surface-400 hover:text-green-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                          title="Resume"><Play className="h-4 w-4" /></button>
                      )}
                      {(campaign.status === 'active' || campaign.status === 'paused') && (
                        <>
                          <button onClick={() => handleEndCampaign(campaign.id)}
                            className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                            title="End"><StopCircle className="h-4 w-4" /></button>
                          <button onClick={() => openEditCampaign(campaign)}
                            className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                            title="Edit"><Edit2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-surface-500">Budget</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{formatPrice(campaign.budget)}</p>
                      {campaign.daily_budget && <p className="text-xs text-surface-400">{formatPrice(campaign.daily_budget)}/day</p>}
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Spent</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{formatPrice(campaign.spent)}</p>
                      <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mt-1">
                        <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Impressions</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500">Clicks / CTR</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{campaign.clicks.toLocaleString()} / {(campaign.ctr * 100).toFixed(2)}%</p>
                    </div>
                  </div>

                  {campaign.targeting && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                      {campaign.targeting.locations?.map(l => <Badge key={l} variant="primary" size="sm">{l}</Badge>)}
                      {campaign.targeting.devices?.map(d => <Badge key={d} variant="info" size="sm">{d}</Badge>)}
                      {campaign.targeting.categories?.map(c => <Badge key={c} variant="warning" size="sm">{c}</Badge>)}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="ads">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-surface-500">{ads.length} ads</p>
            <Button size="sm" onClick={() => { resetAdForm(); setAdModal(true); }}>
              <Plus className="h-4 w-4" /> New Ad
            </Button>
          </div>

          {ads.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-16 w-16" />}
              title="No ads yet"
              description="Create your first ad to start promoting listings."
              action={
                <Button size="sm" onClick={() => { resetAdForm(); setAdModal(true); }}>
                  <Plus className="h-4 w-4" /> Create Ad
                </Button>
              }
            />
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Ad</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Campaign</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Type</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Placement</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Bid</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Impressions</th>
                      <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">CTR</th>
                      <th className="text-end px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad) => (
                      <tr key={ad.id} className="border-b border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {ad.image_url && (
                              <div className="h-10 w-10 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                                <img src={ad.image_url} alt="" className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-surface-900 dark:text-white">{ad.title}</p>
                              <p className="text-xs text-surface-500 truncate max-w-[150px]">{ad.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-500">{ad.campaign_name || ad.campaign_id}</td>
                        <td className="px-4 py-3"><Badge variant="primary" size="sm">{ad.type}</Badge></td>
                        <td className="px-4 py-3 text-sm text-surface-500">{ad.placement.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">{formatPrice(ad.bid_amount)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={ad.status === 'active' ? 'success' : ad.status === 'paused' ? 'warning' : 'default'} size="sm">{ad.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-500">{ad.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-surface-500">{(ad.ctr * 100).toFixed(2)}%</td>
                        <td className="px-4 py-3 text-end">
                          <button onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-surface-100 dark:hover:bg-surface-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabPanel>
      </Tabs>

      {/* Create/Edit Campaign Modal */}
      <Modal isOpen={campaignModal} onClose={() => { setCampaignModal(false); resetCampaignForm(); }}
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'} size="xl">
        <div className="space-y-4">
          <Input label="Campaign Name" value={campaignForm.name}
            onChange={(e) => setCampaignForm(p => ({ ...p, name: e.target.value }))} placeholder="Summer Sale 2026" />
          <Textarea label="Description" value={campaignForm.description}
            onChange={(e) => setCampaignForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your campaign..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Budget" type="number" value={campaignForm.budget}
              onChange={(e) => setCampaignForm(p => ({ ...p, budget: e.target.value }))} placeholder="1000" />
            <Input label="Daily Budget" type="number" value={campaignForm.daily_budget}
              onChange={(e) => setCampaignForm(p => ({ ...p, daily_budget: e.target.value }))} placeholder="100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={campaignForm.start_date}
              onChange={(e) => setCampaignForm(p => ({ ...p, start_date: e.target.value }))} />
            <Input label="End Date (optional)" type="date" value={campaignForm.end_date}
              onChange={(e) => setCampaignForm(p => ({ ...p, end_date: e.target.value }))} />
          </div>
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Targeting</h4>
            <div className="grid grid-cols-3 gap-3">
              <Select label="Locations" options={locationOptions} value={campaignForm.targeting_locations}
                onChange={(e) => setCampaignForm(p => ({ ...p, targeting_locations: e.target.value }))} />
              <Select label="Devices" options={deviceOptions} value={campaignForm.targeting_devices}
                onChange={(e) => setCampaignForm(p => ({ ...p, targeting_devices: e.target.value }))} />
              <Select label="Categories" options={categoryOptions} value={campaignForm.targeting_categories}
                onChange={(e) => setCampaignForm(p => ({ ...p, targeting_categories: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setCampaignModal(false); resetCampaignForm(); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateCampaign} loading={submitting} disabled={!campaignForm.name || !campaignForm.budget}>
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Ad Modal */}
      <Modal isOpen={adModal} onClose={() => { setAdModal(false); resetAdForm(); }} title="Create Ad" size="lg">
        <div className="space-y-4">
          <Select label="Campaign" options={campaigns.filter(c => c.status === 'active' || c.status === 'paused').map(c => ({ value: c.id, label: c.name }))}
            value={adForm.campaign_id} onChange={(e) => setAdForm(p => ({ ...p, campaign_id: e.target.value }))} placeholder="Select campaign" />
          <Input label="Ad Title" value={adForm.title}
            onChange={(e) => setAdForm(p => ({ ...p, title: e.target.value }))} placeholder="Summer Sale Banner" />
          <Textarea label="Description" value={adForm.description}
            onChange={(e) => setAdForm(p => ({ ...p, description: e.target.value }))} placeholder="Ad description..." />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" options={adTypes} value={adForm.type}
              onChange={(e) => setAdForm(p => ({ ...p, type: e.target.value }))} />
            <Select label="Placement" options={placements} value={adForm.placement}
              onChange={(e) => setAdForm(p => ({ ...p, placement: e.target.value }))} />
          </div>
          <Input label="Bid Amount" type="number" value={adForm.bid_amount}
            onChange={(e) => setAdForm(p => ({ ...p, bid_amount: e.target.value }))} placeholder="0.50" />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Ad Image</label>
            <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setAdImage(e.target.files?.[0] || null)} />
              {adImage ? (
                <p className="text-sm text-surface-600">{adImage.name}</p>
              ) : (
                <p className="text-sm text-surface-400">Click to upload image</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setAdModal(false); resetAdForm(); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateAd} loading={submitting} disabled={!adForm.campaign_id || !adForm.title || !adForm.bid_amount}>
              Create Ad
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
