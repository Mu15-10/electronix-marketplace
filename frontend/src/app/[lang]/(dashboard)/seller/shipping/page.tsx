'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { Shipment, ShippingAnalytics, ShippingSettings } from '@/types';
import { Package, Truck, MapPin, Printer, Check, X, BarChart3, Settings, Clock, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  picked_up: { variant: 'info', label: 'Picked Up' },
  in_transit: { variant: 'primary', label: 'In Transit' },
  out_for_delivery: { variant: 'info', label: 'Out for Delivery' },
  delivered: { variant: 'success', label: 'Delivered' },
  failed: { variant: 'danger', label: 'Failed' },
};

interface OrderItem {
  id: string;
  order_id: string;
  buyer: string;
  item: string;
  amount: number;
  currency: string;
  shipping_address: string;
  status: 'pending' | 'shipped';
}

const mockQueue: OrderItem[] = [
  { id: '1', order_id: 'ORD-004', buyer: 'Alice W.', item: 'Sony WH-1000XM5', amount: 349, currency: 'USD', shipping_address: '123 Main St, NY 10001', status: 'pending' },
  { id: '2', order_id: 'ORD-005', buyer: 'Bob T.', item: 'iPad Air M2', amount: 599, currency: 'USD', shipping_address: '456 Oak Ave, LA 90001', status: 'pending' },
  { id: '3', order_id: 'ORD-006', buyer: 'Carol S.', item: 'Logitech MX Master 3S', amount: 99, currency: 'USD', shipping_address: '789 Pine Rd, SF 94105', status: 'shipped' },
];

const mockAnalytics: ShippingAnalytics = {
  total_shipments: 156,
  by_status: [
    { status: 'pending', count: 12 },
    { status: 'in_transit', count: 34 },
    { status: 'delivered', count: 98 },
    { status: 'failed', count: 12 },
  ],
  average_delivery_time: 3.2,
  carrier_usage: [
    { carrier: 'UPS', count: 67 },
    { carrier: 'FedEx', count: 52 },
    { carrier: 'USPS', count: 37 },
  ],
};

const mockSettings: ShippingSettings = {
  default_carrier: 'ups',
  default_package_type: 'box',
  return_address: { street: '500 Seller Blvd', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' },
};

const carriers = [
  { value: 'ups', label: 'UPS' },
  { value: 'usps', label: 'USPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'dhl', label: 'DHL' },
];

const packageTypes = [
  { value: 'box', label: 'Box' },
  { value: 'envelope', label: 'Envelope' },
  { value: 'tube', label: 'Tube' },
  { value: 'pallet', label: 'Pallet' },
];

export default function SellerShippingPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [queue] = useState<OrderItem[]>(mockQueue);
  const [analytics] = useState<ShippingAnalytics>(mockAnalytics);
  const [settings, setSettings] = useState<ShippingSettings>(mockSettings);
  const [markModal, setMarkModal] = useState<OrderItem | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleMarkShipped = () => {
    if (!trackingInput || !selectedCarrier) {
      toast.error('Please fill in carrier and tracking number');
      return;
    }
    toast.success(`Order ${markModal?.order_id} marked as shipped`);
    setMarkModal(null);
    setTrackingInput('');
    setSelectedCarrier('');
  };

  const handleGenerateLabel = () => {
    toast.success('Label generation started');
  };

  const handleSaveSettings = () => {
    toast.success('Shipping settings saved');
    setShowSettings(false);
  };

  const totalByStatus = (status: string) => {
    const found = analytics.by_status.find((s) => s.status === status);
    return found?.count || 0;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Seller Shipping</h1>
          <p className="text-sm text-surface-500">Manage your shipments and shipping settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}><Settings className="h-4 w-4" /> Settings</Button>
          <Button onClick={handleGenerateLabel}><Printer className="h-4 w-4" /> Generate Labels</Button>
        </div>
      </div>

      <Tabs defaultValue="queue">
        <TabList>
          <Tab value="queue"><ShoppingCart className="h-4 w-4" /> Shipping Queue ({queue.filter((o) => o.status === 'pending').length})</Tab>
          <Tab value="analytics"><BarChart3 className="h-4 w-4" /> Analytics</Tab>
          <Tab value="all"><Package className="h-4 w-4" /> All Shipments</Tab>
        </TabList>

        <TabPanel value="queue">
          {queue.filter((o) => o.status === 'pending').length === 0 ? (
            <EmptyState title="All orders shipped" description="No pending orders to ship." icon={<Package className="h-12 w-12" />} />
          ) : (
            <div className="space-y-3">
              {queue.filter((o) => o.status === 'pending').map((order) => (
                <Card key={order.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{order.item}</p>
                        <p className="text-xs text-surface-500">Order {order.order_id} · {order.buyer}</p>
                        <p className="text-xs text-surface-400 mt-1">{order.shipping_address}</p>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white mt-1">{formatPrice(order.amount, order.currency)}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setMarkModal(order)}>
                      <Truck className="h-4 w-4" /> Mark Shipped
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="analytics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card padding="md">
              <p className="text-sm text-surface-500">Total Shipments</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{analytics.total_shipments}</p>
            </Card>
            <Card padding="md">
              <p className="text-sm text-surface-500">In Transit</p>
              <p className="text-2xl font-bold text-primary-600">{totalByStatus('in_transit')}</p>
            </Card>
            <Card padding="md">
              <p className="text-sm text-surface-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{totalByStatus('delivered')}</p>
            </Card>
            <Card padding="md">
              <p className="text-sm text-surface-500">Avg Delivery</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{analytics.average_delivery_time} days</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card padding="md">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Shipments by Status</h3>
              <div className="space-y-3">
                {analytics.by_status.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[item.status]?.variant || 'default'} size="sm">{statusConfig[item.status]?.label || item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface-200 dark:bg-surface-700 rounded-full">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(item.count / analytics.total_shipments) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-surface-900 dark:text-white w-8 text-end">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Carrier Usage</h3>
              <div className="space-y-3">
                {analytics.carrier_usage.map((item) => (
                  <div key={item.carrier} className="flex items-center justify-between">
                    <span className="text-sm text-surface-600 dark:text-surface-300">{item.carrier}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface-200 dark:bg-surface-700 rounded-full">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(item.count / analytics.total_shipments) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-surface-900 dark:text-white w-8 text-end">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel value="all">
          <Card padding="none">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 uppercase tracking-wider">
                <span className="col-span-2">Order / Item</span>
                <span>Buyer</span>
                <span>Carrier</span>
                <span>Status</span>
                <span className="text-end">Actions</span>
              </div>
              {queue.map((order) => (
                <div key={order.id} className="grid grid-cols-6 gap-4 px-4 py-3 text-sm items-center hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <div className="col-span-2">
                    <p className="font-medium text-surface-900 dark:text-white">{order.item}</p>
                    <p className="text-xs text-surface-400">{order.order_id}</p>
                  </div>
                  <span className="text-surface-600 dark:text-surface-300">{order.buyer}</span>
                  <span className="text-surface-500">{order.status === 'shipped' ? 'UPS' : '-'}</span>
                  <div>
                    <Badge variant={order.status === 'shipped' ? 'success' : 'warning'} size="sm">{order.status}</Badge>
                  </div>
                  <div className="text-end">
                    {order.status === 'pending' ? (
                      <Button size="sm" variant="outline" onClick={() => setMarkModal(order)}><Truck className="h-3.5 w-3.5" /> Ship</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => toast.success('Label ready')}><Printer className="h-3.5 w-3.5" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>
      </Tabs>

      <Modal isOpen={!!markModal} onClose={() => setMarkModal(null)} title={`Mark as Shipped - ${markModal?.order_id}`} size="md">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">
            Mark <strong>{markModal?.item}</strong> as shipped to <strong>{markModal?.buyer}</strong>
          </p>
          <Select
            label="Carrier"
            options={carriers}
            placeholder="Select carrier"
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
          />
          <Input
            label="Tracking Number"
            placeholder="Enter tracking number"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setMarkModal(null)}>Cancel</Button>
            <Button onClick={handleMarkShipped}><Check className="h-4 w-4" /> Confirm Shipped</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Shipping Settings" size="lg">
        <div className="space-y-4">
          <Select
            label="Default Carrier"
            options={carriers}
            value={settings.default_carrier}
            onChange={(e) => setSettings({ ...settings, default_carrier: e.target.value })}
          />
          <Select
            label="Default Package Type"
            options={packageTypes}
            value={settings.default_package_type}
            onChange={(e) => setSettings({ ...settings, default_package_type: e.target.value as 'box' | 'envelope' | 'tube' | 'pallet' })}
          />
          <Card padding="sm">
            <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Return Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Street" className="sm:col-span-2" value={settings.return_address.street} onChange={(e) => setSettings({ ...settings, return_address: { ...settings.return_address, street: e.target.value } })} />
              <Input label="City" value={settings.return_address.city} onChange={(e) => setSettings({ ...settings, return_address: { ...settings.return_address, city: e.target.value } })} />
              <Input label="State" value={settings.return_address.state} onChange={(e) => setSettings({ ...settings, return_address: { ...settings.return_address, state: e.target.value } })} />
              <Input label="Postal Code" value={settings.return_address.postal_code} onChange={(e) => setSettings({ ...settings, return_address: { ...settings.return_address, postal_code: e.target.value } })} />
              <Input label="Country" value={settings.return_address.country} onChange={(e) => setSettings({ ...settings, return_address: { ...settings.return_address, country: e.target.value } })} />
            </div>
          </Card>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
