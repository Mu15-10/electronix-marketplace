'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { liveCommerceApi } from '@/lib/api';
import { LiveStream, Listing } from '@/types';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Plus, Play, StopCircle, Tv, Eye, Users, Clock, ShoppingCart, Tag, Radio, BarChart3, Trash2,
} from 'lucide-react';

export default function SellerStreamsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [streamStats, setStreamStats] = useState<Record<string, any>>({});

  // Create stream form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [pinProductId, setPinProductId] = useState('');

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await liveCommerceApi.getStreams({ seller: 'me' });
      setStreams(res.data.results || res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchStreams(); }, []);

  const handleCreateStream = async () => {
    if (!title.trim() || !scheduledStart) {
      toast.error('Title and scheduled start are required');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('scheduled_start', scheduledStart);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      if (tags.trim()) {
        tags.split(',').forEach(t => formData.append('tags', t.trim()));
      }
      await liveCommerceApi.createStream(formData);
      toast.success('Stream created');
      setCreateModal(false);
      resetForm();
      fetchStreams();
    } catch { toast.error('Failed to create stream'); }
    setSubmitting(false);
  };

  const handleStartStream = async (id: string) => {
    try { await liveCommerceApi.startStream(id); toast.success('Stream started!'); fetchStreams(); }
    catch { toast.error('Failed to start stream'); }
  };

  const handleEndStream = async (id: string) => {
    try { await liveCommerceApi.endStream(id); toast.success('Stream ended'); fetchStreams(); }
    catch { toast.error('Failed to end stream'); }
  };

  const handlePinProduct = async () => {
    if (!selectedStream || !pinProductId) return;
    try {
      await liveCommerceApi.pinProduct(selectedStream.id, pinProductId);
      toast.success('Product pinned');
      setPinModal(false);
      setPinProductId('');
    } catch { toast.error('Failed to pin product'); }
  };

  const loadStats = async (streamId: string) => {
    try {
      const res = await liveCommerceApi.getStreamStats(streamId);
      setStreamStats(prev => ({ ...prev, [streamId]: res.data }));
    } catch { /* ignore */ }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledStart('');
    setThumbnail(null);
    setTags('');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  const liveStreams = streams.filter(s => s.status === 'live');
  const scheduledStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Streams</h1>
          <p className="text-sm text-surface-500">{streams.length} total streams</p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus className="h-4 w-4" /> Create Stream
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Live Now', value: liveStreams.length, icon: Radio, color: 'text-danger-600', bg: 'bg-danger-100 dark:bg-danger-900/30' },
          { label: 'Scheduled', value: scheduledStreams.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Ended', value: endedStreams.length, icon: Tv, color: 'text-surface-600', bg: 'bg-surface-100 dark:bg-surface-700' },
          { label: 'Total Viewers', value: streams.reduce((a, s) => a + s.viewer_count, 0), icon: Eye, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        ].map((stat, i) => (
          <Card key={i} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-surface-500">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="live">
        <TabList>
          <Tab value="live">Live Now ({liveStreams.length})</Tab>
          <Tab value="scheduled">Scheduled ({scheduledStreams.length})</Tab>
          <Tab value="ended">Ended ({endedStreams.length})</Tab>
        </TabList>

        <TabPanel value="live">
          {liveStreams.length === 0 ? (
            <EmptyState icon={<Radio className="h-16 w-16" />} title="No live streams"
              description="Start a scheduled stream to go live." />
          ) : (
            <div className="grid gap-4">
              {liveStreams.map(stream => (
                <Card key={stream.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-xl bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {stream.thumbnail ? (
                          <img src={stream.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-surface-400"><Tv className="h-8 w-8" /></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-surface-900 dark:text-white">{stream.title}</h3>
                          <Badge variant="danger" dot size="sm"><span className="animate-pulse">LIVE</span></Badge>
                        </div>
                        {stream.description && <p className="text-sm text-surface-500 mt-1">{stream.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
                          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {stream.viewer_count} viewers</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {stream.started_at ? formatRelativeTime(stream.started_at) : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="danger" onClick={() => handleEndStream(stream.id)}>
                        <StopCircle className="h-4 w-4" /> End Stream
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="scheduled">
          {scheduledStreams.length === 0 ? (
            <EmptyState icon={<Clock className="h-16 w-16" />} title="No scheduled streams"
              description="Create a stream to schedule it." action={
                <Button onClick={() => setCreateModal(true)}><Plus className="h-4 w-4" /> Create Stream</Button>
              } />
          ) : (
            <div className="grid gap-4">
              {scheduledStreams.map(stream => (
                <Card key={stream.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-xl bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {stream.thumbnail ? (
                          <img src={stream.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-surface-400"><Tv className="h-8 w-8" /></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-surface-900 dark:text-white">{stream.title}</h3>
                          <Badge variant="info" size="sm">Scheduled</Badge>
                        </div>
                        {stream.description && <p className="text-sm text-surface-500 mt-1">{stream.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {stream.scheduled_start ? formatDate(stream.scheduled_start) : 'TBD'}
                          </span>
                        </div>
                        {stream.tags && stream.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {stream.tags.map(tag => <Badge key={tag} variant="primary" size="sm">{tag}</Badge>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" onClick={() => handleStartStream(stream.id)}>
                        <Play className="h-4 w-4" /> Start
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedStream(stream);
                        setPinModal(true);
                      }}>
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="ended">
          {endedStreams.length === 0 ? (
            <EmptyState icon={<Tv className="h-16 w-16" />} title="No ended streams"
              description="Completed streams will appear here." />
          ) : (
            <div className="grid gap-4">
              {endedStreams.map(stream => (
                <Card key={stream.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-xl bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {stream.thumbnail ? (
                          <img src={stream.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-surface-400"><Tv className="h-8 w-8" /></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-surface-900 dark:text-white">{stream.title}</h3>
                          <Badge variant="default" size="sm">Ended</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
                          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {stream.viewer_count} total viewers</span>
                          {stream.started_at && stream.ended_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {Math.round((new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()) / 60000)} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => loadStats(stream.id)}>
                        <BarChart3 className="h-4 w-4" /> Stats
                      </Button>
                    </div>
                  </div>

                  {/* Stream Analytics */}
                  {streamStats[stream.id] && (
                    <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-surface-500">Peak Viewers</p>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{streamStats[stream.id].peak_viewers || stream.viewer_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-500">Avg Watch Time</p>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{streamStats[stream.id].avg_watch_time || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-500">Products Sold</p>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{streamStats[stream.id].products_sold || 0}</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>

      {/* Create Stream Modal */}
      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); resetForm(); }} title="Create Stream" size="xl">
        <div className="space-y-4">
          <Input label="Stream Title" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. iPhone 15 Pro Max Live Unboxing" />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this stream will cover..." />
          <Input label="Scheduled Start" type="datetime-local" value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)} />
          <Input label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. smartphones, apple, iphone" helperText="Helps viewers find your stream" />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Thumbnail</label>
            <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
              {thumbnail ? (
                <p className="text-sm text-surface-600">{thumbnail.name}</p>
              ) : (
                <p className="text-sm text-surface-400">Click to upload thumbnail image</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateStream} loading={submitting}
              disabled={!title || !scheduledStart}>
              Create Stream
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pin Product Modal */}
      <Modal isOpen={pinModal} onClose={() => { setPinModal(false); setPinProductId(''); }}
        title={`Pin Product to ${selectedStream?.title || 'Stream'}`} size="md">
        <div className="space-y-4">
          <Input label="Listing ID" value={pinProductId} onChange={(e) => setPinProductId(e.target.value)}
            placeholder="Enter the listing ID to pin" helperText="Find listing IDs in your listings page" />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setPinModal(false); setPinProductId(''); }}>Cancel</Button>
            <Button className="flex-1" onClick={handlePinProduct} disabled={!pinProductId}>Pin Product</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
