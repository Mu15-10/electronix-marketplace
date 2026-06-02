'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { WarrantyClaim, WarrantyConfig, WarrantyStats, ClaimStatus } from '@/types';
import { ShieldCheck, Check, X, Eye, Search, Filter, BarChart3, Settings, FileText, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const claimStatusConfig: Record<ClaimStatus, { variant: 'warning' | 'info' | 'success' | 'danger' | 'primary'; label: string }> = {
  submitted: { variant: 'warning', label: 'Submitted' },
  under_review: { variant: 'info', label: 'Under Review' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },
  resolved: { variant: 'primary', label: 'Resolved' },
};

const mockClaims: WarrantyClaim[] = [
  { id: 'CL-001', warranty: { id: 'W-003', device: 'AirPods Pro 2', model: 'A2931', brand: 'Apple', warranty_type: 'extended', start_date: '2025-03-10', end_date: '2026-03-10', days_remaining: -84, status: 'claimed', created_at: '2025-03-10' }, issue_description: 'Right earbud not charging. LED indicator not lighting up when placed in case.', evidence: ['photo-1.jpg'], status: 'under_review', claim_timeline: [{ id: '1', status: 'submitted', note: 'Claim submitted', timestamp: '2026-05-10T10:00:00Z' }, { id: '2', status: 'under_review', note: 'Under review', timestamp: '2026-05-11T14:00:00Z' }], created_at: '2026-05-10T10:00:00Z', updated_at: '2026-05-11T14:00:00Z' },
  { id: 'CL-002', warranty: { id: 'W-001', device: 'iPhone 15 Pro Max', model: 'A3101', brand: 'Apple', warranty_type: 'manufacturer', start_date: '2025-12-15', end_date: '2026-12-15', days_remaining: 196, status: 'active', created_at: '2025-12-15' }, issue_description: 'Battery draining rapidly after latest iOS update. Phone gets hot during normal use.', evidence: ['photo-2.jpg', 'photo-3.jpg'], status: 'submitted', claim_timeline: [{ id: '1', status: 'submitted', note: 'Claim submitted', timestamp: '2026-06-01T09:00:00Z' }], created_at: '2026-06-01T09:00:00Z', updated_at: '2026-06-01T09:00:00Z' },
  { id: 'CL-003', warranty: { id: 'W-004', device: 'Sony WH-1000XM5', model: 'WH-1000XM5', brand: 'Sony', warranty_type: 'manufacturer', start_date: '2026-04-01', end_date: '2027-04-01', days_remaining: 303, status: 'active', created_at: '2026-04-01' }, issue_description: 'Noise cancellation stopped working on left ear cup.', evidence: [], status: 'resolved', claim_timeline: [{ id: '1', status: 'submitted', note: 'Claim submitted', timestamp: '2026-05-20T10:00:00Z' }, { id: '2', status: 'under_review', note: 'Under review', timestamp: '2026-05-21T14:00:00Z' }, { id: '3', status: 'approved', note: 'Claim approved - replacement authorized', timestamp: '2026-05-22T10:00:00Z' }, { id: '4', status: 'resolved', note: 'Replacement unit shipped to customer', timestamp: '2026-05-24T10:00:00Z' }], created_at: '2026-05-20T10:00:00Z', updated_at: '2026-05-24T10:00:00Z' },
];

const mockStats: WarrantyStats = {
  total_active: 1245,
  claims_by_status: [
    { status: 'submitted', count: 23 },
    { status: 'under_review', count: 15 },
    { status: 'approved', count: 8 },
    { status: 'rejected', count: 4 },
    { status: 'resolved', count: 156 },
  ],
  average_processing_time: 3.5,
  approval_rate: 82,
};

const mockConfigs: WarrantyConfig[] = [
  { id: 'C-001', category: 'Smartphones', default_duration_months: 12, warranty_type: 'manufacturer', is_active: true },
  { id: 'C-002', category: 'Laptops', default_duration_months: 12, warranty_type: 'manufacturer', is_active: true },
  { id: 'C-003', category: 'Headphones', default_duration_months: 6, warranty_type: 'manufacturer', is_active: true },
  { id: 'C-004', category: 'Tablets', default_duration_months: 12, warranty_type: 'manufacturer', is_active: true },
  { id: 'C-005', category: 'Smartwatches', default_duration_months: 6, warranty_type: 'manufacturer', is_active: false },
];

const statusFilters = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'resolved', label: 'Resolved' },
];

const categoryOptions = [
  { value: 'Smartphones', label: 'Smartphones' },
  { value: 'Laptops', label: 'Laptops' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'Tablets', label: 'Tablets' },
  { value: 'Smartwatches', label: 'Smartwatches' },
];

export default function AdminWarrantyPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [claims, setClaims] = useState<WarrantyClaim[]>(mockClaims);
  const [stats] = useState<WarrantyStats>(mockStats);
  const [configs, setConfigs] = useState<WarrantyConfig[]>(mockConfigs);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewClaim, setViewClaim] = useState<WarrantyClaim | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({ category: '', duration: '12', type: 'manufacturer' });

  const filteredClaims = statusFilter ? claims.filter((c) => c.status === statusFilter) : claims;

  const handleApprove = async (claimId: string) => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, status: 'approved' as ClaimStatus, claim_timeline: [...c.claim_timeline, { id: Date.now().toString(), status: 'approved' as ClaimStatus, note: reasonText || 'Claim approved', timestamp: new Date().toISOString() }] } : c));
    toast.success('Claim approved');
    setViewClaim(null);
    setReasonText('');
    setActionLoading(false);
  };

  const handleReject = async (claimId: string) => {
    if (!reasonText.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, status: 'rejected' as ClaimStatus, admin_notes: reasonText, claim_timeline: [...c.claim_timeline, { id: Date.now().toString(), status: 'rejected' as ClaimStatus, note: reasonText, timestamp: new Date().toISOString() }] } : c));
    toast.success('Claim rejected');
    setViewClaim(null);
    setReasonText('');
    setActionLoading(false);
  };

  const handleAddConfig = () => {
    const newConfig: WarrantyConfig = {
      id: `C-${Date.now()}`,
      category: configForm.category,
      default_duration_months: parseInt(configForm.duration),
      warranty_type: configForm.type as 'manufacturer' | 'seller' | 'extended',
      is_active: true,
    };
    setConfigs((prev) => [...prev, newConfig]);
    toast.success('Warranty config added');
    setShowConfigModal(false);
    setConfigForm({ category: '', duration: '12', type: 'manufacturer' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Warranty Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card padding="md">
          <p className="text-sm text-surface-500">Total Active</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total_active}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-surface-500">Avg Processing</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.average_processing_time} days</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-surface-500">Approval Rate</p>
          <p className="text-2xl font-bold text-green-600">{stats.approval_rate}%</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-surface-500">Pending Review</p>
          <p className="text-2xl font-bold text-warning-600">{stats.claims_by_status.find((s) => s.status === 'submitted' || s.status === 'under_review')?.count || 0}</p>
        </Card>
      </div>

      <Tabs defaultValue="claims">
        <TabList>
          <Tab value="claims"><FileText className="h-4 w-4" /> Claims</Tab>
          <Tab value="config"><Settings className="h-4 w-4" /> Warranty Config</Tab>
        </TabList>

        <TabPanel value="claims">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-48">
              <Select
                options={statusFilters}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />
            </div>
            <span className="text-sm text-surface-500">{filteredClaims.length} claim(s)</span>
          </div>

          {filteredClaims.length === 0 ? (
            <EmptyState title="No claims found" description="No warranty claims match your filters." icon={<FileText className="h-12 w-12" />} />
          ) : (
            <div className="space-y-3">
              {filteredClaims.map((claim) => (
                <Card key={claim.id} padding="md" hover>
                  <div className="cursor-pointer" onClick={() => setViewClaim(claim)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-surface-400" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{claim.warranty.device}</p>
                        <p className="text-xs text-surface-500">Claim #{claim.id} · {claim.warranty.brand} {claim.warranty.model}</p>
                        <p className="text-sm text-surface-600 dark:text-surface-300 mt-1 line-clamp-1">{claim.issue_description}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <Badge variant={claimStatusConfig[claim.status].variant} size="sm">{claimStatusConfig[claim.status].label}</Badge>
                      <p className="text-xs text-surface-400 mt-1">{formatDate(claim.created_at)}</p>
                    </div>
                  </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal isOpen={!!viewClaim} onClose={() => { setViewClaim(null); setReasonText(''); }} title={`Claim #${viewClaim?.id}`} size="xl">
            {viewClaim && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={claimStatusConfig[viewClaim.status].variant} size="lg">{claimStatusConfig[viewClaim.status].label}</Badge>
                  <span className="text-sm text-surface-400">{formatDate(viewClaim.created_at)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-surface-500">Device</p>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{viewClaim.warranty.device}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Brand / Model</p>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{viewClaim.warranty.brand} {viewClaim.warranty.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Warranty Type</p>
                    <Badge variant="primary" size="sm">{viewClaim.warranty.warranty_type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Warranty Period</p>
                    <p className="text-sm text-surface-600">{formatDate(viewClaim.warranty.start_date)} - {formatDate(viewClaim.warranty.end_date)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                  <p className="text-xs text-surface-500 mb-1">Issue Description</p>
                  <p className="text-sm text-surface-900 dark:text-white">{viewClaim.issue_description}</p>
                </div>
                {viewClaim.evidence.length > 0 && (
                  <div>
                    <p className="text-xs text-surface-500 mb-2">Evidence ({viewClaim.evidence.length})</p>
                    <div className="flex gap-2">
                      {viewClaim.evidence.map((ev, i) => (
                        <div key={i} className="h-20 w-20 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-400">
                          <Camera className="h-6 w-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-surface-500 mb-2">Timeline</p>
                  <div className="space-y-2">
                    {viewClaim.claim_timeline.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-2">
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-surface-900 dark:text-white">{entry.note}</p>
                          <p className="text-xs text-surface-400">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant={claimStatusConfig[entry.status].variant} size="sm">{claimStatusConfig[entry.status].label}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                {(viewClaim.status === 'submitted' || viewClaim.status === 'under_review' || viewClaim.status === 'rejected') && (
                  <div className="space-y-3 pt-2 border-t border-surface-200 dark:border-surface-700">
                    <Textarea
                      label={viewClaim.status === 'rejected' ? 'Rejection Reason' : 'Admin Notes'}
                      placeholder="Add notes or reason..."
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="danger" onClick={() => handleReject(viewClaim.id)} loading={actionLoading}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                      <Button onClick={() => handleApprove(viewClaim.id)} loading={actionLoading}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </TabPanel>

        <TabPanel value="config">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-surface-500">Configure default warranty durations by device category</p>
            <Button size="sm" onClick={() => setShowConfigModal(true)}><Settings className="h-4 w-4" /> Add Config</Button>
          </div>
          <Card padding="none">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider">
                <span>Category</span>
                <span>Duration</span>
                <span>Type</span>
                <span className="text-end">Status</span>
              </div>
              {configs.map((config) => (
                <div key={config.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm items-center">
                  <span className="font-medium text-surface-900 dark:text-white">{config.category}</span>
                  <span className="text-surface-600">{config.default_duration_months} months</span>
                  <Badge variant="primary" size="sm">{config.warranty_type}</Badge>
                  <div className="text-end">
                    <Badge variant={config.is_active ? 'success' : 'default'} size="sm">{config.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>
      </Tabs>

      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title="Add Warranty Config" size="md">
        <div className="space-y-4">
          <Select label="Category" options={categoryOptions} value={configForm.category} onChange={(e) => setConfigForm({ ...configForm, category: e.target.value })} placeholder="Select category" />
          <Input label="Duration (months)" type="number" value={configForm.duration} onChange={(e) => setConfigForm({ ...configForm, duration: e.target.value })} />
          <Select label="Warranty Type" options={[{ value: 'manufacturer', label: 'Manufacturer' }, { value: 'seller', label: 'Seller' }, { value: 'extended', label: 'Extended' }]} value={configForm.type} onChange={(e) => setConfigForm({ ...configForm, type: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowConfigModal(false)}>Cancel</Button>
            <Button onClick={handleAddConfig}>Add Config</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
