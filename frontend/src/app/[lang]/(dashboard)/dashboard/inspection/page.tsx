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
import { Inspection, InspectionType, InspectionStatus, InspectionResult, ConditionGrade, CategoryScore } from '@/types';
import { Search, Check, X, CalendarDays, Clock, Star, Camera, FileText, Plus, ChevronRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const inspectionTypeConfig: Record<InspectionType, { variant: 'default' | 'primary' | 'info'; label: string; price: string }> = {
  basic: { variant: 'default', label: 'Basic', price: '$9.99' },
  standard: { variant: 'primary', label: 'Standard', price: '$19.99' },
  premium: { variant: 'info', label: 'Premium', price: '$39.99' },
};

const statusConfig: Record<InspectionStatus, { variant: 'warning' | 'info' | 'primary' | 'success' | 'danger'; label: string }> = {
  requested: { variant: 'warning', label: 'Requested' },
  scheduled: { variant: 'info', label: 'Scheduled' },
  in_progress: { variant: 'primary', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
};

const conditionGradeConfig: Record<ConditionGrade, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  A: { variant: 'success', label: 'A - Like New' },
  B: { variant: 'info', label: 'B - Good' },
  C: { variant: 'warning', label: 'C - Fair' },
  D: { variant: 'danger', label: 'D - Poor' },
  F: { variant: 'default', label: 'F - Damaged' },
};

const mockDevices = [
  { value: 'listing-1', label: 'iPhone 15 Pro Max - 256GB' },
  { value: 'listing-2', label: 'MacBook Air M2 - 13"' },
  { value: 'listing-3', label: 'Sony WH-1000XM5' },
];

const inspectionTypes = [
  { value: 'basic', label: 'Basic - Visual inspection' },
  { value: 'standard', label: 'Standard - Full functional check' },
  { value: 'premium', label: 'Premium - Comprehensive diagnostic' },
];

const mockInspection: Inspection = {
  id: 'INS-001',
  device: 'iPhone 15 Pro Max',
  listing_id: 'listing-1',
  inspection_type: 'standard',
  status: 'completed',
  preferred_date: '2026-05-25',
  scheduled_date: '2026-05-25',
  result: {
    overall_score: 88,
    condition_grade: 'B',
    category_scores: { screen: 92, body: 85, camera: 90, battery: 78, ports: 95, software: 88 },
    inspector_notes: 'Device is in good condition overall. Screen has minor micro-scratches visible under direct light. Battery health at 85%. All ports functional. Camera produces clear images with no defects.',
    photos: ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg'],
    verified: true,
  },
  inspector: { id: 'I-001', name: 'Mike Tech', email: 'mike@example.com', is_available: true, specializations: ['smartphones', 'tablets'], total_inspections: 342, average_score: 92, created_at: '' },
  user: {} as any,
  created_at: '2026-05-24',
  updated_at: '2026-05-25',
};

const mockInspections: Inspection[] = [
  mockInspection,
  { ...mockInspection, id: 'INS-002', device: 'MacBook Air M2', inspection_type: 'premium', status: 'scheduled', preferred_date: '2026-06-10', scheduled_date: '2026-06-10', result: undefined },
  { ...mockInspection, id: 'INS-003', device: 'Sony WH-1000XM5', inspection_type: 'basic', status: 'requested', preferred_date: '2026-06-15', result: undefined },
];

function CategoryScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-primary-500' : score >= 60 ? 'bg-warning-500' : 'bg-danger-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-surface-600 dark:text-surface-300">{label}</span>
        <span className="font-medium text-surface-900 dark:text-white">{score}%</span>
      </div>
      <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function InspectionPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [inspections] = useState<Inspection[]>(mockInspections);
  const [requestModal, setRequestModal] = useState(false);
  const [viewResult, setViewResult] = useState<Inspection | null>(null);
  const [reschedModal, setReschedModal] = useState<Inspection | null>(null);
  const [form, setForm] = useState({ device: '', type: 'standard', preferred_date: '' });
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!form.device || !form.preferred_date) {
      toast.error('Please select a device and preferred date');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Inspection request submitted!');
    setRequestModal(false);
    setForm({ device: '', type: 'standard', preferred_date: '' });
    setLoading(false);
  };

  const handleReschedule = async () => {
    if (!reschedModal) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Inspection rescheduled');
    setReschedModal(null);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Inspections</h1>
          <p className="text-sm text-surface-500">Request and manage device inspections</p>
        </div>
        <Button onClick={() => setRequestModal(true)}><Plus className="h-4 w-4" /> Request Inspection</Button>
      </div>

      <Tabs defaultValue="my-inspections">
        <TabList>
          <Tab value="my-inspections"><Search className="h-4 w-4" /> My Inspections</Tab>
          <Tab value="results"><Star className="h-4 w-4" /> Inspection Results</Tab>
        </TabList>

        <TabPanel value="my-inspections">
          {inspections.length === 0 ? (
            <EmptyState title="No inspections yet" description="Request an inspection to get started." action={<Button onClick={() => setRequestModal(true)}><Plus className="h-4 w-4" /> Request Inspection</Button>} />
          ) : (
            <div className="space-y-3">
              {inspections.map((ins) => (
                <Card key={ins.id} padding="md" hover>
                  <div className="cursor-pointer" onClick={() => ins.result ? setViewResult(ins) : undefined}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Search className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{ins.device}</p>
                        <p className="text-xs text-surface-500">#{ins.id} · {inspectionTypeConfig[ins.inspection_type].label} ({inspectionTypeConfig[ins.inspection_type].price})</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-surface-400">
                            <CalendarDays className="h-3 w-3" />
                            {ins.scheduled_date ? formatDate(ins.scheduled_date) : formatDate(ins.preferred_date)}
                          </div>
                          {ins.status === 'scheduled' && (
                            <button
                              className="text-xs text-primary-600 hover:underline"
                              onClick={(e) => { e.stopPropagation(); setReschedModal(ins); }}
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <Badge variant={statusConfig[ins.status].variant} size="sm">{statusConfig[ins.status].label}</Badge>
                      {ins.result && <p className="text-xs font-semibold text-surface-900 dark:text-white mt-1">Score: {ins.result.overall_score}%</p>}
                    </div>
                  </div>
                  {ins.result && (
                    <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                      <div className="flex items-center justify-between">
                        <Badge variant={conditionGradeConfig[ins.result.condition_grade].variant} size="sm">{conditionGradeConfig[ins.result.condition_grade].label}</Badge>
                        {ins.result.verified && <Badge variant="success" size="sm" dot>Verified</Badge>}
                        <ChevronRight className="h-4 w-4 text-surface-400" />
                      </div>
                    </div>
                  )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="results">
          {inspections.filter((i) => i.result).length === 0 ? (
            <EmptyState title="No inspection results" description="Completed inspections with results will appear here." icon={<Star className="h-12 w-12" />} />
          ) : (
            <div className="space-y-4">
              {inspections.filter((i) => i.result).map((ins) => (
                <Card key={ins.id} padding="md" hover>
                  <div className="cursor-pointer" onClick={() => setViewResult(ins)}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-surface-900 dark:text-white">{ins.device}</h4>
                      <p className="text-xs text-surface-500">{formatDate(ins.created_at)}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-2xl font-bold text-surface-900 dark:text-white">{ins.result!.overall_score}%</p>
                      <Badge variant={conditionGradeConfig[ins.result!.condition_grade].variant} size="sm">{ins.result!.condition_grade}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(Object.keys(ins.result!.category_scores) as (keyof CategoryScore)[]).map((key) => (
                      <div key={key} className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                        <p className="text-xs text-surface-400 capitalize">{key}</p>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{ins.result!.category_scores[key]}%</p>
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 text-surface-400 ms-auto mt-2" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>

      <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title="Request Inspection" size="lg">
        <div className="space-y-4">
          <Select label="Device" options={mockDevices} placeholder="Select device to inspect" value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} />
          <Select label="Inspection Type" options={inspectionTypes} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input label="Preferred Date" type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            {inspectionTypes.map((t) => (
              <div key={t.value} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${form.type === t.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-200 dark:border-surface-700'}`} onClick={() => setForm({ ...form, type: t.value })}>
                <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">{t.value}</p>
                <p className="text-xs text-surface-400 mt-1">{inspectionTypeConfig[t.value as InspectionType].price}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRequestModal(false)}>Cancel</Button>
            <Button onClick={handleRequest} loading={loading}><Plus className="h-4 w-4" /> Submit Request</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewResult} onClose={() => setViewResult(null)} title="Inspection Result" size="xl">
        {viewResult?.result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white text-lg">{viewResult.device}</h3>
                <p className="text-sm text-surface-500">{viewResult.inspection_type} inspection · {formatDate(viewResult.scheduled_date || viewResult.preferred_date)}</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-surface-900 dark:text-white">{viewResult.result.overall_score}%</p>
                <Badge variant={conditionGradeConfig[viewResult.result.condition_grade].variant} size="sm" className="mt-1">{conditionGradeConfig[viewResult.result.condition_grade].label}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              {(Object.entries(viewResult.result.category_scores) as [string, number][]).map(([key, score]) => (
                <CategoryScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={score} />
              ))}
            </div>

            {viewResult.inspector && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Inspected by {viewResult.inspector.name}</p>
                  <p className="text-xs text-surface-400">{viewResult.inspector.total_inspections} inspections completed</p>
                </div>
                {viewResult.result.verified && <Badge variant="success" size="sm" dot className="ms-auto">Verified</Badge>}
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Inspector Notes</h4>
              <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/50 p-3 rounded-lg">{viewResult.result.inspector_notes}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Photos</h4>
              <div className="flex gap-2">
                {viewResult.result.photos.map((photo, i) => (
                  <div key={i} className="h-24 w-24 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-400">
                    <Camera className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!reschedModal} onClose={() => setReschedModal(null)} title="Reschedule Inspection" size="md">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">Reschedule inspection for <strong>{reschedModal?.device}</strong></p>
          <Input label="New Preferred Date" type="date" />
          <Textarea label="Reason for rescheduling" placeholder="Optional: tell us why..." rows={2} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setReschedModal(null)}>Cancel</Button>
            <Button onClick={handleReschedule} loading={loading}><CalendarDays className="h-4 w-4" /> Confirm Reschedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
