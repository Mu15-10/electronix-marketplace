'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils';
import { Shipment, ShippingMethod } from '@/types';
import { Package, Truck, MapPin, Weight, Ruler, Plus, Search, ChevronRight, Copy, Check, ExternalLink, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  picked_up: { variant: 'info', label: 'Picked Up' },
  in_transit: { variant: 'primary', label: 'In Transit' },
  out_for_delivery: { variant: 'info', label: 'Out for Delivery' },
  delivered: { variant: 'success', label: 'Delivered' },
  failed: { variant: 'danger', label: 'Failed' },
};

const statusSteps = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    tracking_number: '1Z999AA10123456784',
    carrier: 'UPS',
    status: 'in_transit',
    package_details: { weight: 1.5, length: 25, width: 15, height: 5, package_type: 'box' },
    origin: { street: '123 Tech Lane', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' },
    destination: { street: '456 Buyer Ave', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' },
    shipping_method: 'express',
    insurance: true,
    estimated_delivery: '2026-06-05',
    tracking_events: [
      { id: '1', status: 'pending', location: 'San Francisco, CA', description: 'Label created', timestamp: '2026-06-01T10:00:00Z' },
      { id: '2', status: 'picked_up', location: 'San Francisco, CA', description: 'Picked up by carrier', timestamp: '2026-06-01T14:00:00Z' },
      { id: '3', status: 'in_transit', location: 'Los Angeles, CA', description: 'Arrived at sorting facility', timestamp: '2026-06-02T08:00:00Z' },
    ],
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-02T08:00:00Z',
  },
  {
    id: 'SHP-002',
    tracking_number: '9400111899223456789012',
    carrier: 'USPS',
    status: 'delivered',
    package_details: { weight: 0.5, length: 20, width: 12, height: 3, package_type: 'envelope' },
    origin: { street: '123 Tech Lane', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' },
    destination: { street: '789 Market St', city: 'San Diego', state: 'CA', postal_code: '92101', country: 'US' },
    shipping_method: 'standard',
    insurance: false,
    estimated_delivery: '2026-05-28',
    actual_delivery: '2026-05-27',
    tracking_events: [
      { id: '1', status: 'pending', location: 'San Francisco, CA', description: 'Label created', timestamp: '2026-05-25T10:00:00Z' },
      { id: '2', status: 'picked_up', location: 'San Francisco, CA', description: 'Picked up', timestamp: '2026-05-25T16:00:00Z' },
      { id: '3', status: 'in_transit', location: 'San Diego, CA', description: 'Arrived at regional facility', timestamp: '2026-05-26T12:00:00Z' },
      { id: '4', status: 'out_for_delivery', location: 'San Diego, CA', description: 'Out for delivery', timestamp: '2026-05-27T08:00:00Z' },
      { id: '5', status: 'delivered', location: 'San Diego, CA', description: 'Delivered', timestamp: '2026-05-27T14:00:00Z' },
    ],
    created_at: '2026-05-25T10:00:00Z',
    updated_at: '2026-05-27T14:00:00Z',
  },
  {
    id: 'SHP-003',
    tracking_number: '1Z510AAE1234567890',
    carrier: 'FedEx',
    status: 'pending',
    package_details: { weight: 3.2, length: 40, width: 30, height: 10, package_type: 'box' },
    origin: { street: '123 Tech Lane', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' },
    destination: { street: '321 Pine Rd', city: 'Seattle', state: 'WA', postal_code: '98101', country: 'US' },
    shipping_method: 'overnight',
    insurance: true,
    estimated_delivery: '2026-06-04',
    tracking_events: [
      { id: '1', status: 'pending', location: 'San Francisco, CA', description: 'Label created', timestamp: '2026-06-02T09:00:00Z' },
    ],
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
];

const carriers = [
  { value: 'ups', label: 'UPS' },
  { value: 'usps', label: 'USPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'dhl', label: 'DHL' },
  { value: 'dtdc', label: 'DTDC' },
  { value: 'aramex', label: 'Aramex' },
];

const packageTypes = [
  { value: 'box', label: 'Box' },
  { value: 'envelope', label: 'Envelope' },
  { value: 'tube', label: 'Tube' },
  { value: 'pallet', label: 'Pallet' },
];

const shippingMethods = [
  { value: 'standard', label: 'Standard (5-7 days)' },
  { value: 'express', label: 'Express (2-3 days)' },
  { value: 'overnight', label: 'Overnight (next day)' },
];

function StatusTimeline({ events }: { events: Shipment['tracking_events'] }) {
  const currentIdx = statusSteps.findIndex((s) => s === events[events.length - 1]?.status);
  return (
    <div className="flex items-center gap-1 py-2">
      {statusSteps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500' :
                  isCurrent ? 'bg-primary-500 border-primary-500 ring-2 ring-primary-200' :
                  'bg-surface-200 border-surface-300 dark:bg-surface-700 dark:border-surface-600'
                }`}
              />
              <span className={`text-[10px] mt-1 text-center leading-tight ${
                isCompleted ? 'text-green-600' : isCurrent ? 'text-primary-600' : 'text-surface-400'
              }`}>
                {step.replace(/_/g, ' ')}
              </span>
            </div>
            {idx < statusSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${
                idx < currentIdx ? 'bg-green-500' : 'bg-surface-200 dark:bg-surface-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ShippingPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [shipments] = useState<Shipment[]>(mockShipments);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<Shipment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    carrier: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    package_type: 'box',
    origin_street: '',
    origin_city: '',
    origin_state: '',
    origin_postal: '',
    origin_country: 'US',
    dest_street: '',
    dest_city: '',
    dest_state: '',
    dest_postal: '',
    dest_country: 'US',
    shipping_method: 'standard' as ShippingMethod,
    insurance: false,
  });

  const handleCopy = (tracking: string, id: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedId(id);
    toast.success('Tracking number copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    const found = shipments.find((s) => s.tracking_number.includes(trackingNumber));
    if (found) {
      setTrackingResult(found);
    } else {
      toast.error('Shipment not found');
      setTrackingResult(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Shipment created successfully!');
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Shipping</h1>

      <Tabs defaultValue="my-shipments">
        <TabList>
          <Tab value="my-shipments"><Package className="h-4 w-4" /> My Shipments</Tab>
          <Tab value="new-shipment"><Plus className="h-4 w-4" /> New Shipment</Tab>
          <Tab value="track"><Search className="h-4 w-4" /> Track Shipment</Tab>
        </TabList>

        <TabPanel value="my-shipments">
          {shipments.length === 0 ? (
            <EmptyState title="No shipments yet" description="Create your first shipment to get started." action={<Button onClick={() => {}}>Create Shipment</Button>} />
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => {
                const st = statusConfig[shipment.status];
                return (
                  <Card key={shipment.id} padding="md" hover>
                    <div className="cursor-pointer" onClick={() => router.push(`/${lang}/dashboard/shipping/${shipment.id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="h-4 w-4 text-primary-500" />
                          <span className="font-mono text-sm font-semibold text-surface-900 dark:text-white">{shipment.tracking_number}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(shipment.tracking_number, shipment.id); }}
                            className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
                          >
                            {copiedId === shipment.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-surface-400" />}
                          </button>
                        </div>
                        <p className="text-xs text-surface-500">{shipment.carrier} · {shipment.shipping_method}</p>
                      </div>
                      <Badge variant={st.variant} size="sm">{st.label}</Badge>
                    </div>
                    <StatusTimeline events={shipment.tracking_events} />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                      <div className="flex items-center gap-2 text-xs text-surface-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{shipment.origin.city} → {shipment.destination.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-surface-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Est. {formatDate(shipment.estimated_delivery)}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-surface-400 rtl-flip" />
                    </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabPanel>

        <TabPanel value="new-shipment">
          <form onSubmit={handleCreate}>
            <div className="space-y-6">
              <Card padding="md">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Carrier & Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Carrier"
                    options={carriers}
                    placeholder="Select carrier"
                    value={form.carrier}
                    onChange={(e) => handleFormChange('carrier', e.target.value)}
                  />
                  <Select
                    label="Shipping Method"
                    options={shippingMethods}
                    value={form.shipping_method}
                    onChange={(e) => handleFormChange('shipping_method', e.target.value)}
                  />
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <Weight className="h-4 w-4" /> Package Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <Input label="Weight (kg)" type="number" step="0.1" value={form.weight} onChange={(e) => handleFormChange('weight', e.target.value)} />
                  <Input label="Length (cm)" type="number" value={form.length} onChange={(e) => handleFormChange('length', e.target.value)} />
                  <Input label="Width (cm)" type="number" value={form.width} onChange={(e) => handleFormChange('width', e.target.value)} />
                  <Input label="Height (cm)" type="number" value={form.height} onChange={(e) => handleFormChange('height', e.target.value)} />
                  <Select label="Package Type" options={packageTypes} value={form.package_type} onChange={(e) => handleFormChange('package_type', e.target.value)} />
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Origin Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Street" className="sm:col-span-2" value={form.origin_street} onChange={(e) => handleFormChange('origin_street', e.target.value)} />
                  <Input label="City" value={form.origin_city} onChange={(e) => handleFormChange('origin_city', e.target.value)} />
                  <Input label="State" value={form.origin_state} onChange={(e) => handleFormChange('origin_state', e.target.value)} />
                  <Input label="Postal Code" value={form.origin_postal} onChange={(e) => handleFormChange('origin_postal', e.target.value)} />
                  <Input label="Country" value={form.origin_country} onChange={(e) => handleFormChange('origin_country', e.target.value)} />
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Destination Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Street" className="sm:col-span-2" value={form.dest_street} onChange={(e) => handleFormChange('dest_street', e.target.value)} />
                  <Input label="City" value={form.dest_city} onChange={(e) => handleFormChange('dest_city', e.target.value)} />
                  <Input label="State" value={form.dest_state} onChange={(e) => handleFormChange('dest_state', e.target.value)} />
                  <Input label="Postal Code" value={form.dest_postal} onChange={(e) => handleFormChange('dest_postal', e.target.value)} />
                  <Input label="Country" value={form.dest_country} onChange={(e) => handleFormChange('dest_country', e.target.value)} />
                </div>
              </Card>

              <Card padding="md">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={form.insurance}
                      onChange={(e) => handleFormChange('insurance', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:bg-surface-600" />
                  </label>
                  <div>
                    <span className="text-sm font-medium text-surface-900 dark:text-white">Add Shipping Insurance</span>
                    <p className="text-xs text-surface-400">Protect your package against loss or damage</p>
                  </div>
                  <Shield className="h-5 w-5 text-primary-500 ms-auto" />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" size="lg"><Plus className="h-4 w-4" /> Create Shipment</Button>
              </div>
            </div>
          </form>
        </TabPanel>

        <TabPanel value="track">
          <Card padding="lg">
            <div className="max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Track Your Shipment</h3>
              <p className="text-sm text-surface-500 mb-4">Enter your tracking number to get real-time updates.</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter tracking number..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <Button onClick={handleTrack}>Track</Button>
              </div>

              {trackingResult && (
                <div className="mt-6 p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono font-semibold text-surface-900 dark:text-white">{trackingResult.tracking_number}</p>
                      <p className="text-xs text-surface-500">{trackingResult.carrier}</p>
                    </div>
                    <Badge variant={statusConfig[trackingResult.status].variant}>{statusConfig[trackingResult.status].label}</Badge>
                  </div>
                  <StatusTimeline events={trackingResult.tracking_events} />
                  <div className="mt-4 space-y-3">
                    {trackingResult.tracking_events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{event.description}</p>
                          <p className="text-xs text-surface-400">{event.location} · {new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
