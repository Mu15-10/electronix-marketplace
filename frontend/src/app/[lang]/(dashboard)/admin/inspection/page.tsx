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
import { Inspection, InspectionStatus, Inspector, InspectionStats, ConditionGrade, CategoryScore } from '@/types';
import { Search, Check, X, UserCheck, Users, BarChart3, Camera, Star, Plus, Edit3, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<InspectionStatus, { variant: 'warning' | 'info' | 'primary' | 'success' | 'danger'; label: string }> = {
  requested: { variant: 'warning', label: 'Requested' },
  scheduled: { variant: 'info', label: 'Scheduled' },
  in_progress: { variant: 'primary', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
};

const conditionGradeConfig: Record<ConditionGrade, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  A: { variant: 'success', label: 'A' },
  B: { variant: 'info', label: 'B' },
  C: { variant: 'warning', label: 'C' },
  D: { variant: 'danger', label: 'D' },
  F: { variant: 'default', label: 'F' },
};

const mockInspections: Inspection[] = [
  { id: 'INS-001', device: 'iPhone 15 Pro Max', inspection_type: 'standard', status: 'completed', preferred_date: '2026-05-25', scheduled_date: '2026-05-25', result: { overall_score: 88, condition_grade: 'B', category_scores: { screen: 92, body: 85, camera: 90, battery: 78, ports: 95, software: 88 }, inspector_notes: 'Good condition overall', photos: [], verified: true }, inspector: { id: 'I-001', name: 'Mike Tech', email: 'mike@example.com', is_available: true, specializations: ['smartphones'], total_inspections: 342, average_score: 92, created_at: '' }, user: {} as any, created_at: '2026-05-24', updated_at: '2026-05-25' },
  { id: 'INS-002', device: 'MacBook Air M2', inspection_type: 'premium', status: 'scheduled', preferred_date: '2026-06-10', scheduled_date: '2026-06-10', user: {} as any, created_at: '2026-06-05', updated_at: '2026-06-05' },
  { id: 'INS-003', device: 'Sony WH-1000XM5', inspection_type: 'basic', status: 'requested', preferred_date: '2026-06-15', user: {} as any, created_at: '2026-06-08', updated_at: '2026-06-08' },
  { id: 'INS-004', device: 'iPad Pro M4', inspection_type: 'standard', status: 'requested', preferred_date: '2026-06-18', user: {} as any, created_at: '2026-06-09', updated_at: '2026-06-09' },
  { id: 'INS-005', device: 'Galaxy S24 Ultra', inspection_type: 'standard', status: 'in_progress', preferred_date: '2026-06-12', scheduled_date: '2026-06-12', inspector: { id: 'I-002', name: 'Sarah Fix', email: 'sarah@example.com', is_available: false, specializations: ['smartphones', 'tablets'], total_inspections: 215, average_score: 88, created_at: '' }, user: {} as any, created_at: '2026-06-07', updated_at: '2026-06-12' },
];

const mockInspectors: Inspector[] = [
  { id: 'I-001', name: 'Mike Tech', email: 'mike@example.com', phone: '+1-555-0101', is_available: true, specializations: ['smartphones', 'tablets', 'laptops'], total_inspections: 342, average_score: 92, created_at: '2025-01-15' },
  { id: 'I-002', name: 'Sarah Fix', email: 'sarah@example.com', phone: '+1-555-0102', is_available: false, specializations: ['smartphones', 'tablets'], total_inspections: 215, average_score: 88, created_at: '2025-03-20' },
  { id: 'I-003', name: 'John Parts', email: 'john@example.com', phone: '+1-555-0103', is_available: true, specializations: ['headphones', 'wearables', 'speakers'], total_inspections: 178, average_score: 85, created_at: '2025-06-01' },
];

const mockStats: InspectionStats = {
  total: 1240,
  completed_today: 18,
  average_score: 86,
  pass_rate: 78,
  by_status: [
    { status: 'requested', count: 34 },
    { status: 'scheduled', count: 22 },
    { status: 'in_progress', count: 15 },
    { status: 'completed', count: 1156 },
    { status: 'failed', count: 13 },
  ],
};

const statusFilters = [
  { value: '', label: 'All Statuses' },
  { value: 'requested', label: 'Requested' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const categoryLabels: Record<keyof CategoryScore, string> = {
  screen: 'Screen',
  body: 'Body',
  camera: 'Camera',
  battery: 'Battery',
  ports: 'Ports',
  software: 'Software',
};

export default function AdminInspectionPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [inspections, setInspections] = useState<Inspection[]>(mockInspections);
  const [inspectors, setInspectors] = useState<Inspector[]>(mockInspectors);
  const [stats] = useState<InspectionStats>(mockStats);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInsp, setSelectedInsp] = useState<Inspection | null>(null);
  const [assignModal, setAssignModal] = useState<Inspection | null>(null);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [resultModal, setResultModal] = useState<Inspection | null>(null);
  const [inspectorModal, setInspectorModal] = useState<Inspector | null>(null);
  const [editInspector, setEditInspector] = useState(false);
  const [loading, setLoading] = useState(false);

  const [resultForm, setResultForm] = useState({
    overall_score: '85',
    condition_grade: 'B' as ConditionGrade,
    screen: '85', body: '85', camera: '85', battery: '85', ports: '85', software: '85',
    notes: '',
  });

  const [inspectorForm, setInspectorForm] = useState({ name: '', email: '', phone: '', specializations: '' });

  const filteredInspections = statusFilter ? inspections.filter((i) => i.status === statusFilter) : inspections;

  const handleAssign = () => {
    if (!selectedInspector) { toast.error('Please select an inspector'); return; }
    setLoading(true);
    setTimeout(() => {
      setInspections((prev) => prev.map((i) => i.id === assignModal?.id ? { ...i, inspector: inspectors.find((ins) => ins.id === selectedInspector), status: 'scheduled' as InspectionStatus, scheduled_date: new Date().toISOString().split('T')[0] } : i));
      setInspectors((prev) => prev.map((ins) => ins.id === selectedInspector ? { ...ins, is_available: false } : ins));
      toast.success('Inspector assigned');
      setAssignModal(null);
      setSelectedInspector('');
      setLoading(false);
    }, 800);
  };

  const handleSubmitResult = () => {
    setLoading(true);
    setTimeout(() => {
      setInspections((prev) => prev.map((i) => i.id === resultModal?.id ? {
        ...i, status: 'completed' as InspectionStatus,
        result: {
          overall_score: parseInt(resultForm.overall_score),
          condition_grade: resultForm.condition_grade,
          category_scores: { screen: parseInt(resultForm.screen), body: parseInt(resultForm.body), camera: parseInt(resultForm.camera), battery: parseInt(resultForm.battery), ports: parseInt(resultForm.ports), software: parseInt(resultForm.software) },
          inspector_notes: resultForm.notes,
          photos: [],
          verified: true,
        }
      } : i));
      toast.success('Inspection result submitted');
      setResultModal(null);
      setLoading(false);
    }, 800);
  };

  const handleSaveInspector = () => {
    if (editInspector && inspectorModal) {
      setInspectors((prev) => prev.map((i) => i.id === inspectorModal.id ? { ...i, ...inspectorForm, specializations: inspectorForm.specializations.split(',').map((s) => s.trim()) } : i));
      toast.success('Inspector updated');
    } else {
      const newInspector: Inspector = { id: `I-${Date.now()}`, ...inspectorForm, is_available: true, specializations: inspectorForm.specializations.split(',').map((s) => s.trim()), total_inspections: 0, average_score: 0, created_at: new Date().toISOString() };
      setInspectors((prev) => [...prev, newInspector]);
      toast.success('Inspector added');
    }
    setInspectorModal(null);
    setEditInspector(false);
    setInspectorForm({ name: '', email: '', phone: '', specializations: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Inspection Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card padding="md">
          <p className="text-sm text-surface-500">Total Inspections</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-surface-500">Completed Today</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed_today}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-surface-500">Average Score</p>
          <p className="text-2xl font-bold text-primary-600">{stats.average_score}%</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-surface-500">Pass Rate</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.pass_rate}%</p>
        </Card>
      </div>

      <Tabs defaultValue="queue">
        <TabList>
          <Tab value="queue"><Search className="h-4 w-4" /> Inspection Queue ({inspections.filter((i) => i.status === 'requested' || i.status === 'scheduled').length})</Tab>
          <Tab value="inspectors"><Users className="h-4 w-4" /> Inspectors ({inspectors.length})</Tab>
          <Tab value="all"><BarChart3 className="h-4 w-4" /> All Inspections</Tab>
        </TabList>

        <TabPanel value="queue">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-48">
              <Select options={statusFilters} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="Filter" />
            </div>
            <span className="text-sm text-surface-500">{filteredInspections.length} inspection(s)</span>
          </div>
          {filteredInspections.filter((i) => i.status === 'requested' || i.status === 'scheduled').length === 0 ? (
            <EmptyState title="Queue is clear" description="No pending inspection requests." icon={<Search className="h-12 w-12" />} />
          ) : (
            <div className="space-y-3">
              {filteredInspections.filter((i) => i.status === 'requested' || i.status === 'scheduled').map((ins) => (
                <Card key={ins.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{ins.device}</p>
                      <p className="text-xs text-surface-500">{ins.inspection_type} inspection · Requested {formatDate(ins.created_at)}</p>
                      <p className="text-xs text-surface-400 mt-1">Preferred: {formatDate(ins.preferred_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[ins.status].variant} size="sm">{statusConfig[ins.status].label}</Badge>
                      {ins.status === 'requested' && (
                        <Button size="sm" onClick={() => setAssignModal(ins)}><UserCheck className="h-3.5 w-3.5" /> Assign</Button>
                      )}
                      {ins.status === 'scheduled' && (
                        <Button size="sm" onClick={() => setResultModal(ins)}><Star className="h-3.5 w-3.5" /> Submit Result</Button>
                      )}
                    </div>
                  </div>
                  {ins.inspector && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-surface-500">
                      <UserCheck className="h-3 w-3" />
                      <span>Inspector: {ins.inspector.name}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="inspectors">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-surface-500">Manage inspection personnel</p>
            <Button size="sm" onClick={() => { setInspectorForm({ name: '', email: '', phone: '', specializations: '' }); setEditInspector(false); setInspectorModal({} as Inspector); }}>
              <Plus className="h-4 w-4" /> Add Inspector
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspectors.map((insp) => (
              <Card key={insp.id} padding="md" hover>
                <div className="cursor-pointer" onClick={() => { setInspectorForm({ name: insp.name, email: insp.email, phone: insp.phone || '', specializations: insp.specializations.join(', ') }); setEditInspector(true); setInspectorModal(insp); }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{insp.name}</p>
                    <p className="text-xs text-surface-400">{insp.email}</p>
                  </div>
                  <Badge variant={insp.is_available ? 'success' : 'default'} size="sm" dot className="ms-auto">{insp.is_available ? 'Available' : 'Busy'}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {insp.specializations.map((spec) => (
                    <Badge key={spec} variant="primary" size="sm">{spec}</Badge>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-surface-500 pt-2 border-t border-surface-100 dark:border-surface-700">
                  <span>{insp.total_inspections} inspections</span>
                  <span>Avg score: {insp.average_score}%</span>
                </div>
                </div>
              </Card>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="all">
          <Card padding="none">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider">
                <span className="col-span-2">Device</span>
                <span>Type</span>
                <span>Inspector</span>
                <span>Status</span>
                <span className="text-end">Score</span>
              </div>
              {inspections.map((ins) => (
                <div key={ins.id} className="grid grid-cols-6 gap-4 px-4 py-3 text-sm items-center hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer" onClick={() => setSelectedInsp(ins)}>
                  <span className="col-span-2 font-medium text-surface-900 dark:text-white">{ins.device}</span>
                  <Badge variant="primary" size="sm">{ins.inspection_type}</Badge>
                  <span className="text-surface-500">{ins.inspector?.name || '-'}</span>
                  <Badge variant={statusConfig[ins.status].variant} size="sm">{statusConfig[ins.status].label}</Badge>
                  <span className="text-end font-semibold text-surface-900 dark:text-white">{ins.result?.overall_score || '-'}%</span>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>
      </Tabs>

      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Inspector" size="md">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">Assign an inspector for <strong>{assignModal?.device}</strong></p>
          <Select
            label="Select Inspector"
            options={inspectors.filter((i) => i.is_available).map((i) => ({ value: i.id, label: `${i.name} - ${i.specializations.join(', ')}` }))}
            placeholder="Choose inspector"
            value={selectedInspector}
            onChange={(e) => setSelectedInspector(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={handleAssign} loading={loading}><UserCheck className="h-4 w-4" /> Assign</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!resultModal} onClose={() => setResultModal(null)} title="Submit Inspection Result" size="xl">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">Submitting result for <strong>{resultModal?.device}</strong></p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Overall Score (%)" type="number" min="0" max="100" value={resultForm.overall_score} onChange={(e) => setResultForm({ ...resultForm, overall_score: e.target.value })} />
            <Select label="Condition Grade" options={Object.entries(conditionGradeConfig).map(([k, v]) => ({ value: k, label: v.label }))} value={resultForm.condition_grade} onChange={(e) => setResultForm({ ...resultForm, condition_grade: e.target.value as ConditionGrade })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(categoryLabels) as (keyof CategoryScore)[]).map((key) => (
              <Input key={key} label={categoryLabels[key]} type="number" min="0" max="100" value={resultForm[key].toString()} onChange={(e) => setResultForm({ ...resultForm, [key]: e.target.value })} />
            ))}
          </div>
          <Textarea label="Inspector Notes" rows={3} value={resultForm.notes} onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setResultModal(null)}>Cancel</Button>
            <Button onClick={handleSubmitResult} loading={loading}><Check className="h-4 w-4" /> Submit Result</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!inspectorModal && !resultModal && !assignModal} onClose={() => setInspectorModal(null)} title={editInspector ? 'Edit Inspector' : 'Add Inspector'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={inspectorForm.name} onChange={(e) => setInspectorForm({ ...inspectorForm, name: e.target.value })} />
          <Input label="Email" type="email" value={inspectorForm.email} onChange={(e) => setInspectorForm({ ...inspectorForm, email: e.target.value })} />
          <Input label="Phone" value={inspectorForm.phone} onChange={(e) => setInspectorForm({ ...inspectorForm, phone: e.target.value })} />
          <Input label="Specializations (comma-separated)" placeholder="smartphones, laptops, tablets" value={inspectorForm.specializations} onChange={(e) => setInspectorForm({ ...inspectorForm, specializations: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setInspectorModal(null)}>Cancel</Button>
            <Button onClick={handleSaveInspector}><Check className="h-4 w-4" /> {editInspector ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
