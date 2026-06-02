'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { Inspection, InspectionRequirement, InspectionStatus } from '@/types';
import { Search, Check, Plus, Eye, ClipboardList, Camera, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<InspectionStatus, { variant: 'warning' | 'info' | 'primary' | 'success' | 'danger'; label: string }> = {
  requested: { variant: 'warning', label: 'Requested' },
  scheduled: { variant: 'info', label: 'Scheduled' },
  in_progress: { variant: 'primary', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
};

const mockListingsAwaiting = [
  { id: 'L-001', title: 'iPhone 14 Pro - 128GB', category: 'Smartphones', status: 'pending', created_at: '2026-06-01' },
  { id: 'L-002', title: 'MacBook Pro 14 M3', category: 'Laptops', status: 'pending', created_at: '2026-06-03' },
  { id: 'L-003', title: 'AirPods Max - Space Gray', category: 'Headphones', status: 'pending', created_at: '2026-06-05' },
];

const mockInspections: Inspection[] = [
  { id: 'INS-001', device: 'iPhone 15 Pro Max', inspection_type: 'standard', status: 'completed', preferred_date: '2026-05-25', scheduled_date: '2026-05-25', result: { overall_score: 88, condition_grade: 'B', category_scores: { screen: 92, body: 85, camera: 90, battery: 78, ports: 95, software: 88 }, inspector_notes: 'Good condition', photos: [], verified: true }, user: {} as any, created_at: '2026-05-24', updated_at: '2026-05-25' },
  { id: 'INS-002', device: 'Samsung Galaxy Tab S9', inspection_type: 'basic', status: 'completed', preferred_date: '2026-05-20', scheduled_date: '2026-05-20', result: { overall_score: 75, condition_grade: 'C', category_scores: { screen: 80, body: 72, camera: 78, battery: 65, ports: 80, software: 75 }, inspector_notes: 'Battery shows signs of wear', photos: [], verified: false }, user: {} as any, created_at: '2026-05-19', updated_at: '2026-05-20' },
];

const mockRequirements: InspectionRequirement[] = [
  { category: 'Smartphones', checks: ['Screen condition and dead pixels', 'Touch response and digitizer', 'Camera functionality (front/rear)', 'Battery health percentage', 'Ports and charging', 'Buttons and sensors', 'WiFi/Bluetooth/Cellular', 'IMEI verification'] },
  { category: 'Laptops', checks: ['Display condition and backlight', 'Keyboard and trackpad', 'Ports (USB, HDMI, Thunderbolt)', 'Battery cycle count and health', 'Storage and RAM verification', 'Webcam and microphone', 'WiFi and Bluetooth', 'Speakers and audio jack'] },
  { category: 'Headphones', checks: ['Driver functionality (L/R)', 'Noise cancellation', 'Battery and charging', 'Bluetooth connectivity', 'Microphone test', 'Physical condition', 'Ear cushions and headband', 'Carrying case condition'] },
  { category: 'Tablets', checks: ['Screen condition and touch', 'Battery health', 'Camera functionality', 'Ports and charging', 'Buttons and sensors', 'Speaker and microphone', 'WiFi/Bluetooth', 'Stylus support (if applicable)'] },
  { category: 'Smartwatches', checks: ['Display condition', 'Touch response', 'Battery and charging', 'Heart rate sensor', 'GPS functionality', 'Water resistance seal', 'Band condition', 'Button and crown function'] },
];

export default function SellerInspectionPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [listings] = useState(mockListingsAwaiting);
  const [inspections] = useState(mockInspections);
  const [requirements] = useState(mockRequirements);
  const [viewReq, setViewReq] = useState<string | null>(null);
  const [viewResult, setViewResult] = useState<Inspection | null>(null);

  const handleRequestInspection = (listingId: string) => {
    toast.success('Inspection requested for listing');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Seller Inspections</h1>
          <p className="text-sm text-surface-500">Manage inspections for your listings</p>
        </div>
      </div>

      <Tabs defaultValue="awaiting">
        <TabList>
          <Tab value="awaiting"><Search className="h-4 w-4" /> Awaiting Inspection ({listings.length})</Tab>
          <Tab value="results"><Star className="h-4 w-4" /> Inspection Results ({inspections.length})</Tab>
          <Tab value="requirements"><ClipboardList className="h-4 w-4" /> Requirements</Tab>
        </TabList>

        <TabPanel value="awaiting">
          {listings.length === 0 ? (
            <EmptyState title="No listings awaiting inspection" description="All your listings have been inspected." icon={<Search className="h-12 w-12" />} />
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <Card key={listing.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <Search className="h-5 w-5 text-surface-400" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{listing.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="primary" size="sm">{listing.category}</Badge>
                          <span className="text-xs text-surface-400">Created {formatDate(listing.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleRequestInspection(listing.id)}>
                      <Plus className="h-4 w-4" /> Request Inspection
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="results">
          {inspections.length === 0 ? (
            <EmptyState title="No inspection results" description="Results for inspected items will appear here." icon={<Star className="h-12 w-12" />} />
          ) : (
            <div className="space-y-3">
              {inspections.map((ins) => (
                <Card key={ins.id} padding="md" hover>
                  <div className="cursor-pointer" onClick={() => setViewResult(ins)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{ins.device}</p>
                        <p className="text-xs text-surface-500">{ins.inspection_type} inspection · {formatDate(ins.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <Badge variant={statusConfig[ins.status].variant} size="sm">{statusConfig[ins.status].label}</Badge>
                      {ins.result && (
                        <div className="mt-1">
                          <span className="text-lg font-bold text-surface-900 dark:text-white">{ins.result.overall_score}%</span>
                          <Badge variant={ins.result.condition_grade === 'A' || ins.result.condition_grade === 'B' ? 'success' : 'warning'} size="sm" className="ms-1">{ins.result.condition_grade}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {ins.result?.verified && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <Check className="h-3 w-3" /> Verified inspection
                    </div>
                  )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal isOpen={!!viewResult} onClose={() => setViewResult(null)} title="Inspection Result" size="xl">
            {viewResult?.result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white text-lg">{viewResult.device}</h3>
                    <p className="text-sm text-surface-500">{viewResult.inspection_type} inspection</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-surface-900 dark:text-white">{viewResult.result.overall_score}%</p>
                    <Badge variant={viewResult.result.condition_grade === 'A' || viewResult.result.condition_grade === 'B' ? 'success' : 'warning'} size="sm">{viewResult.result.condition_grade}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(viewResult.result.category_scores) as [string, number][]).map(([key, score]) => (
                    <div key={key} className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                      <p className="text-xs text-surface-400 capitalize mb-1">{key}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full">
                          <div className={`h-full rounded-full ${score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-primary-500' : 'bg-warning-500'}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-surface-900 dark:text-white">{score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                  <p className="text-xs text-surface-500 mb-1">Inspector Notes</p>
                  <p className="text-sm text-surface-900 dark:text-white">{viewResult.result.inspector_notes}</p>
                </div>
                {viewResult.result.verified && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
                    <Check className="h-4 w-4" /> This inspection has been verified and authenticated
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setViewResult(null)}>Close</Button>
                </div>
              </div>
            )}
          </Modal>
        </TabPanel>

        <TabPanel value="requirements">
          <div className="mb-4">
            <p className="text-sm text-surface-500">Inspection requirements by device category</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requirements.map((req) => (
              <Card key={req.category} padding="md" hover>
                <div className="cursor-pointer" onClick={() => setViewReq(viewReq === req.category ? null : req.category)}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-surface-900 dark:text-white">{req.category}</h3>
                  <Badge variant="primary" size="sm">{req.checks.length} checks</Badge>
                </div>
                {viewReq === req.category && (
                  <ul className="space-y-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                    {req.checks.map((check, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-300">
                        <ClipboardList className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                        {check}
                      </li>
                    ))}
                  </ul>
                )}
                {viewReq !== req.category && (
                  <p className="text-xs text-surface-400">Click to view {req.checks.length} inspection checks</p>
                )}
                </div>
              </Card>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
