'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { usersApi } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Camera, Lock, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { full_name: user?.full_name || '', username: user?.username || '', phone: user?.phone || '', bio: '' },
  });

  const saveProfile = async (data: any) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v as string));
      const res = await usersApi.updateProfile(formData);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabList>
          <Tab value="profile"><User className="h-4 w-4" /> Profile</Tab>
          <Tab value="security"><Lock className="h-4 w-4" /> Security</Tab>
          <Tab value="notifications"><Bell className="h-4 w-4" /> Notifications</Tab>
        </TabList>

        <TabPanel value="profile">
          <Card padding="lg">
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar src={user?.avatar} name={user?.full_name} size="xl" />
                <div>
                  <Button variant="outline" size="sm"><Camera className="h-4 w-4" /> Change Photo</Button>
                  <p className="text-xs text-surface-500 mt-1">JPG or PNG. Max 2MB.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
                <Input label="Full Name" icon={<User className="h-4 w-4" />} {...register('full_name')} />
                <Input label="Username" icon={<Mail className="h-4 w-4" />} {...register('username')} />
                <Input label="Phone" type="tel" icon={<Phone className="h-4 w-4" />} {...register('phone')} />
                <Button type="submit" loading={saving}>Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value="security">
          <Card padding="lg">
            <div className="space-y-4">
              <Input label="Current Password" type="password" icon={<Lock className="h-4 w-4" />} />
              <Input label="New Password" type="password" icon={<Lock className="h-4 w-4" />} />
              <Input label="Confirm Password" type="password" icon={<Lock className="h-4 w-4" />} />
              <Button>Update Password</Button>
              <hr className="border-surface-200 dark:border-surface-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-surface-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel value="notifications">
          <Card padding="lg">
            <p className="text-surface-500">Notification preferences coming soon.</p>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
