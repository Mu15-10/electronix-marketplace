'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils';
import { shippingApi } from '@/lib/api';
import { Shipment } from '@/types';
import { Truck, MapPin, Package, Weight, Ruler, Clock, Copy, Check, CalendarDays, Phone, ArrowLeft, Shield } from 'lucide-react';
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

const mockShipment: Shipment = {
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
};

function getDaysRemaining(estimatedDelivery: string): number {
  const diff = new Date(estimatedDelivery).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const id = params.id as string;
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    shippingApi.getShipment(id)
      .then((res) => setShipment(res.data))
      .catch(() => setShipment(mockShipment))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!shipment) return <div className="text-center py-12 text-surface-500">Shipment not found.</div>;

  const st = statusConfig[shipment.status];
  const daysLeft = getDaysRemaining(shipment.estimated_delivery);
  const currentStepIndex = statusSteps.indexOf(shipment.status);

  const handleCopy = () => {
    navigator.clipboard.writeText(shipment.tracking_number);
    setCopied(true);
    toast.success('Tracking number copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        onClick={() => router.push(`/${lang}/dashboard/shipping`)}
        className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shipping
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-5 w-5 text-primary-500" />
                  <span className="text-xl font-mono font-bold text-surface-900 dark:text-white">{shipment.tracking_number}</span>
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-surface-400" />}
                  </button>
                </div>
                <p className="text-sm text-surface-500">{shipment.carrier} · {shipment.shipping_method}</p>
              </div>
              <Badge variant={st.variant} size="lg">{st.label}</Badge>
            </div>

            {daysLeft > 0 && shipment.status !== 'delivered' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 mb-6">
                <CalendarDays className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-semibold text-primary-700 dark:text-primary-300">Estimated {daysLeft} day{daysLeft > 1 ? 's' : ''} remaining</p>
                  <p className="text-xs text-primary-500">Expected delivery by {formatDate(shipment.estimated_delivery)}</p>
                </div>
              </div>
            )}

            {shipment.status === 'delivered' && shipment.actual_delivery && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 mb-6">
                <Package className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">Delivered on {formatDate(shipment.actual_delivery)}</p>
                  <p className="text-xs text-green-500">Your package has been delivered successfully</p>
                </div>
              </div>
            )}

            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Tracking Timeline</h3>
            <div className="relative">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-surface-200 dark:bg-surface-700" />
              <div className="space-y-6">
                {shipment.tracking_events.map((event, idx) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className={`relative z-10 h-4 w-4 rounded-full border-2 shrink-0 mt-0.5 ${
                      idx === 0 ? 'bg-primary-500 border-primary-500 ring-2 ring-primary-200' : 'bg-white dark:bg-surface-800 border-primary-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{event.description}</p>
                      <p className="text-xs text-surface-400">{event.location}</p>
                      <p className="text-xs text-surface-400">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant={idx === 0 ? 'primary' : 'default'} size="sm">{statusConfig[event.status]?.label || event.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="md">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> Package Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Weight className="h-4 w-4" /> Weight
                </div>
                <span className="text-sm font-medium text-surface-900 dark:text-white">{shipment.package_details.weight} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <Ruler className="h-4 w-4" /> Dimensions
                </div>
                <span className="text-sm font-medium text-surface-900 dark:text-white">
                  {shipment.package_details.length}×{shipment.package_details.width}×{shipment.package_details.height} cm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Type</span>
                <Badge variant="default" size="sm">{shipment.package_details.package_type}</Badge>
              </div>
              {shipment.insurance && (
                <div className="flex items-center gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
                  <Shield className="h-4 w-4 text-primary-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-300">Insured</span>
                </div>
              )}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Origin
            </h3>
            <div className="text-sm text-surface-600 dark:text-surface-300">
              <p>{shipment.origin.street}</p>
              <p>{shipment.origin.city}, {shipment.origin.state} {shipment.origin.postal_code}</p>
              <p>{shipment.origin.country}</p>
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Destination
            </h3>
            <div className="text-sm text-surface-600 dark:text-surface-300">
              <p>{shipment.destination.street}</p>
              <p>{shipment.destination.city}, {shipment.destination.state} {shipment.destination.postal_code}</p>
              <p>{shipment.destination.country}</p>
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Delivery Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Estimated</span>
                <span className="font-medium text-surface-900 dark:text-white">{formatDate(shipment.estimated_delivery)}</span>
              </div>
              {shipment.actual_delivery && (
                <div className="flex justify-between">
                  <span className="text-surface-500">Actual</span>
                  <span className="font-medium text-green-600">{formatDate(shipment.actual_delivery)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-surface-100 dark:border-surface-700">
                <span className="text-surface-500">Method</span>
                <Badge variant="info" size="sm">{shipment.shipping_method}</Badge>
              </div>
            </div>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => toast.success('Contact carrier feature coming soon')}>
            <Phone className="h-4 w-4" /> Contact Carrier
          </Button>
        </div>
      </div>
    </div>
  );
}
