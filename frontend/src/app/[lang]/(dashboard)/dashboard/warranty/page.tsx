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
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import { Warranty, WarrantyClaim, WarrantyType, ClaimStatus } from '@/types';
import { ShieldCheck, AlertTriangle, Clock, FileText, Camera, Plus, Check, X, ChevronRight, History, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const warrantyTypeConfig: Record<WarrantyType, { variant: 'primary' | 'success' | 'info'; label: string }> = {
  seller: { variant: 'primary', label: 'Seller' },
  manufacturer: { variant: 'success', label: 'Manufacturer' },
  extended: { variant: 'info', label: 'Extended' },
};

const warrantyStatusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  expiring_soon: { variant: 'warning', label: 'Expiring Soon' },
  expired: { variant: 'danger', label: 'Expired' },
  claimed: { variant: 'info', label: 'Claimed' },
};

const claimStatusConfig: Record<ClaimStatus, { variant: 'warning' | 'info' | 'success' | 'danger' | 'primary'; label: string }> = {
  submitted: { variant: 'warning', label: 'Submitted' },
  under_review: { variant: 'info', label: 'Under Review' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },
  resolved: { variant: 'primary', label: 'Resolved' },
};

const mockWarranties: Warranty[] = [
  { id: 'W-001', device: 'iPhone 15 Pro Max', model: 'A3101', brand: 'Apple', warranty_type: 'manufacturer', start_date: '2025-12-15', end_date: '2026-12-15', days_remaining: 196, status: 'active', created_at: '2025-12-15' },
  { id: 'W-002', device: 'MacBook Air M2', model: 'A2681', brand: 'Apple', warranty_type: 'seller', start_date: '2026-01-20', end_date: '2026-07-20', days_remaining: 48, status: 'expiring_soon', created_at: '2026-01-20' },
  { id: 'W-003', device: 'AirPods Pro 2', model: 'A2931', brand: 'Apple', warranty_type: 'extended', start_date: '2025-03-10', end_date: '2026-03-10', days_remaining: -84, status: 'claimed', created_at: '2025-03-10' },
  { id: 'W-004', device: 'Sony WH-1000XM5', model: 'WH-1000XM5', brand: 'Sony', warranty_type: 'manufacturer', start_date: '2026-04-01', end_date: '2027-04-01', days_remaining: 303, status: 'active', created_at: '2026-04-01' },
];

const mockClaims: WarrantyClaim[] = [
  {
    id: 'CL-001',
    warranty: mockWarranties[2],
    issue_description: 'Right earbud not charging. LED indicator not lighting up when placed in case.',
    evidence: ['photo-placeholder-1.jpg'],
    status: 'under_review',
    claim_timeline: [
      { id: '1', status: 'submitted', note: 'Claim submitted', timestamp: '2026-05-10T10:00:00Z' },
      { id: '2', status: 'under_review', note: 'Claim is being reviewed by our team', timestamp: '2026-05-11T14:00:00Z' },
    ],
    created_at: '2026-05-10T10:00:00Z',
    updated_at: '2026-05-11T14:00:00Z',
  },
];

const warrantyTypes = [
  { value: 'seller', label: 'Seller Warranty' },
  { value: 'manufacturer', label: 'Manufacturer Warranty' },
  { value: 'extended', label: 'Extended Warranty' },
];

const claimStatusSteps: ClaimStatus[] = ['submitted', 'under_review', 'approved', 'resolved'];

export default function WarrantyPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [warranties] = useState<Warranty[]>(mockWarranties);
  const [claims] = useState<WarrantyClaim[]>(mockClaims);
  const [claimModal, setClaimModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [claimFormLoading, setClaimFormLoading] = useState(false);
  const [viewClaim, setViewClaim] = useState<WarrantyClaim | null>(null);

  const activeWarranties = warranties.filter((w) => w.status === 'active' || w.status === 'expiring_soon');
  const expiredWarranties = warranties.filter((w) => w.status === 'expired' || w.status === 'claimed');

  const handleSubmitClaim = async () => {
    if (!selectedWarranty || !issueDescription.trim()) {
      toast.error('Please select a warranty and describe the issue');
      return;
    }
    setClaimFormLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Warranty claim submitted successfully!');
    setClaimModal(false);
    setSelectedWarranty('');
    setIssueDescription('');
    setClaimFormLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">My Warranties</h1>

      {warranties.filter((w) => w.status === 'expiring_soon').length > 0 && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          You have {warranties.filter((w) => w.status === 'expiring_soon').length} warranty(warranties) expiring soon. Renew or file a claim before they expire!
        </Alert>
      )}

      <Tabs defaultValue="active">
        <TabList>
          <Tab value="active"><ShieldCheck className="h-4 w-4" /> Active Warranties ({activeWarranties.length})</Tab>
          <Tab value="claims"><FileText className="h-4 w-4" /> Claims ({claims.length})</Tab>
          <Tab value="history"><History className="h-4 w-4" /> History</Tab>
        </TabList>

        <TabPanel value="active">
          {activeWarranties.length === 0 ? (
            <EmptyState title="No active warranties" description="Warranties for your purchases will appear here." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWarranties.map((w) => (
                <Card key={w.id} padding="md" hover className={w.status === 'expiring_soon' ? 'ring-2 ring-warning-400' : ''}>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={warrantyTypeConfig[w.warranty_type].variant} size="sm">{warrantyTypeConfig[w.warranty_type].label}</Badge>
                    <Badge variant={warrantyStatusConfig[w.status].variant} size="sm">{warrantyStatusConfig[w.status].label}</Badge>
                  </div>
                  <h4 className="font-semibold text-surface-900 dark:text-white mb-1">{w.device}</h4>
                  <p className="text-xs text-surface-500 mb-3">{w.brand} {w.model}</p>
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 mb-3">
                    <CalendarDays className="h-4 w-4 text-surface-400" />
                    <span>{formatDate(w.start_date)} - {formatDate(w.end_date)}</span>
                  </div>
                  {w.status === 'active' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (w.days_remaining / 365) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium text-primary-600">{w.days_remaining} days left</span>
                    </div>
                  )}
                  {w.status === 'expiring_soon' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-warning-50 dark:bg-warning-900/20 mb-3">
                      <Clock className="h-4 w-4 text-warning-600" />
                      <span className="text-xs font-medium text-warning-600">Expiring in {w.days_remaining} days</span>
                    </div>
                  )}
                  <Button
                    variant={w.status === 'expiring_soon' ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => { setSelectedWarranty(w.id); setClaimModal(true); }}
                    disabled={w.status === 'expired'}
                  >
                    {w.status === 'expired' ? 'Expired' : 'File Claim'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="claims">
          {claims.length === 0 ? (
            <EmptyState title="No warranty claims" description="Your warranty claims will appear here." icon={<FileText className="h-12 w-12" />} />
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Card key={claim.id} padding="md" hover>
                  <div className="cursor-pointer" onClick={() => setViewClaim(claim)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-surface-900 dark:text-white">{claim.warranty.device}</h4>
                      <p className="text-xs text-surface-500">Claim #{claim.id}</p>
                    </div>
                    <Badge variant={claimStatusConfig[claim.status].variant} size="sm">{claimStatusConfig[claim.status].label}</Badge>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-300 mb-3 line-clamp-2">{claim.issue_description}</p>
                  <div className="flex items-center gap-1">
                    {claimStatusSteps.map((step, idx) => {
                      const stepIdx = claimStatusSteps.indexOf(claim.status === 'rejected' ? 'submitted' : claim.status);
                      const isCompleted = idx < stepIdx;
                      const isCurrent = idx === stepIdx;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`h-2 w-2 rounded-full ${
                            isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary-500 ring-2 ring-primary-200' : 'bg-surface-200 dark:bg-surface-600'
                          }`} />
                          {idx < claimStatusSteps.length - 1 && <div className={`flex-1 h-0.5 ${idx < stepIdx ? 'bg-green-500' : 'bg-surface-200 dark:bg-surface-600'}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-surface-400 mt-1">
                    {claimStatusSteps.map((step) => <span key={step}>{step.replace('_', ' ')}</span>)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-400 ms-auto mt-2" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="history">
          {expiredWarranties.length === 0 ? (
            <EmptyState title="No warranty history" description="Past warranties and claims will appear here." icon={<History className="h-12 w-12" />} />
          ) : (
            <Card padding="none">
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider">
                  <span className="col-span-2">Device</span>
                  <span>Type</span>
                  <span>End Date</span>
                  <span className="text-end">Status</span>
                </div>
                {expiredWarranties.map((w) => (
                  <div key={w.id} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm items-center">
                    <span className="col-span-2 font-medium text-surface-900 dark:text-white">{w.device}</span>
                    <Badge variant={warrantyTypeConfig[w.warranty_type].variant} size="sm">{warrantyTypeConfig[w.warranty_type].label}</Badge>
                    <span className="text-surface-500">{formatDate(w.end_date)}</span>
                    <span className="text-end"><Badge variant={warrantyStatusConfig[w.status].variant} size="sm">{warrantyStatusConfig[w.status].label}</Badge></span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabPanel>
      </Tabs>

      <Modal isOpen={claimModal} onClose={() => setClaimModal(false)} title="File a Warranty Claim" size="lg">
        <div className="space-y-4">
          <Select
            label="Select Warranty"
            options={warranties.filter((w) => w.status !== 'expired').map((w) => ({ value: w.id, label: `${w.device} (${w.brand} - ${warrantyTypeConfig[w.warranty_type].label})` }))}
            placeholder="Choose a warranty"
            value={selectedWarranty}
            onChange={(e) => setSelectedWarranty(e.target.value)}
          />
          <Textarea
            label="Issue Description"
            placeholder="Describe the issue with your device..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            rows={4}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Attach Evidence</label>
            <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
              <Camera className="h-8 w-8 mx-auto text-surface-400 mb-2" />
              <p className="text-sm text-surface-500">Click to upload photos or evidence</p>
              <p className="text-xs text-surface-400 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setClaimModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitClaim} loading={claimFormLoading}><FileText className="h-4 w-4" /> Submit Claim</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewClaim} onClose={() => setViewClaim(null)} title="Claim Details" size="lg">
        {viewClaim && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={claimStatusConfig[viewClaim.status].variant} size="lg">{claimStatusConfig[viewClaim.status].label}</Badge>
              <span className="text-sm text-surface-400">#{viewClaim.id}</span>
            </div>
            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white">{viewClaim.warranty.device}</h4>
              <p className="text-sm text-surface-500">{viewClaim.warranty.brand} {viewClaim.warranty.model}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Issue Description</p>
              <p className="text-sm text-surface-600 dark:text-surface-400">{viewClaim.issue_description}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Claim Timeline</h5>
              <div className="space-y-3">
                {viewClaim.claim_timeline.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{entry.note}</p>
                      <p className="text-xs text-surface-400">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant={claimStatusConfig[entry.status].variant} size="sm" className="ms-auto">{claimStatusConfig[entry.status].label}</Badge>
                  </div>
                ))}
              </div>
            </div>
            {viewClaim.evidence.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Evidence</h5>
                <div className="flex gap-2">
                  {viewClaim.evidence.map((ev, i) => (
                    <div key={i} className="h-20 w-20 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-xs text-surface-400">
                      <Camera className="h-6 w-6" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
