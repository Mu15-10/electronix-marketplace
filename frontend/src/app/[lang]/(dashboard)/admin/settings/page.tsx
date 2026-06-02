'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Settings, Shield, Bell, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">System Settings</h1>

      <Tabs defaultValue="general">
        <TabList>
          <Tab value="general"><Settings className="h-4 w-4" /> General</Tab>
          <Tab value="security"><Shield className="h-4 w-4" /> Security</Tab>
          <Tab value="payment"><CreditCard className="h-4 w-4" /> Payment</Tab>
          <Tab value="notifications"><Bell className="h-4 w-4" /> Notifications</Tab>
        </TabList>

        <TabPanel value="general">
          <Card padding="lg" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Site Name" defaultValue="Electronix" />
              <Input label="Support Email" defaultValue="support@electronix.com" />
            </div>
            <Select label="Default Language" options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'Arabic' }, { value: 'tr', label: 'Turkish' }]} />
            <Select label="Default Currency" options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'TRY', label: 'TRY' }]} />
            <Button>Save Settings</Button>
          </Card>
        </TabPanel>

        <TabPanel value="security">
          <Card padding="lg">
            <p className="text-surface-500">Security settings coming soon.</p>
          </Card>
        </TabPanel>

        <TabPanel value="payment">
          <Card padding="lg">
            <p className="text-surface-500">Payment settings coming soon.</p>
          </Card>
        </TabPanel>

        <TabPanel value="notifications">
          <Card padding="lg">
            <p className="text-surface-500">Notification settings coming soon.</p>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
