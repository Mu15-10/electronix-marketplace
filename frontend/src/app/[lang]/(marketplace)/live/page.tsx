'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { liveCommerceApi } from '@/lib/api';
import { LiveStream } from '@/types';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import { Play, Calendar, Eye, Users, Clock, Tv, Radio } from 'lucide-react';

export default function LivePage() {
  const params = useParams();
  const lang = params.lang as string;
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = {};
      if (filterStatus !== 'all') p.status = filterStatus;
      const res = await liveCommerceApi.getStreams(p);
      setStreams(res.data.results || res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchStreams(); }, [filterStatus]);

  const liveStreams = streams.filter(s => s.status === 'live');
  const upcomingStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  const statusFilterOptions = [
    { value: 'all', label: 'All Streams' },
    { value: 'live', label: 'Live Now' },
    { value: 'scheduled', label: 'Upcoming' },
    { value: 'ended', label: 'Ended' },
  ];

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <Link href={`/${lang}/live/${stream.id}`}>
      <Card hover padding="none" className="overflow-hidden h-full">
        <div className="aspect-video bg-surface-100 dark:bg-surface-700 relative overflow-hidden">
          {stream.thumbnail ? (
            <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-surface-400">
              <Tv className="h-16 w-16" />
            </div>
          )}
          <div className="absolute top-3 start-3">
            {stream.status === 'live' ? (
              <Badge variant="danger" size="sm" dot>
                <span className="animate-pulse">LIVE</span>
              </Badge>
            ) : stream.status === 'scheduled' ? (
              <Badge variant="info" size="sm">
                <Calendar className="h-3 w-3" /> Scheduled
              </Badge>
            ) : (
              <Badge variant="default" size="sm">Ended</Badge>
            )}
          </div>
          {stream.status === 'live' && (
            <div className="absolute top-3 end-3">
              <Badge variant="default" size="sm" className="bg-black/60 text-white border-0">
                <Eye className="h-3 w-3" /> {stream.viewer_count}
              </Badge>
            </div>
          )}
          {stream.status !== 'live' && stream.scheduled_start && (
            <div className="absolute bottom-3 start-3">
              <Badge variant="default" size="sm" className="bg-black/60 text-white border-0">
                <Clock className="h-3 w-3" /> {formatDate(stream.scheduled_start)}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-surface-900 dark:text-white truncate">{stream.title}</h3>
          {stream.description && (
            <p className="text-sm text-surface-500 mt-1 line-clamp-2">{stream.description}</p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Users className="h-4 w-4" />
              {stream.seller?.full_name || 'Unknown Seller'}
            </div>
            <div className="flex items-center gap-1 text-xs text-surface-400">
              <Eye className="h-3.5 w-3.5" /> {stream.viewer_count}
            </div>
          </div>
          {stream.tags && stream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stream.tags.map(tag => (
                <Badge key={tag} variant="primary" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Live Commerce</h1>
            <p className="text-sm text-surface-500">Browse live streams and upcoming events</p>
          </div>
          <Select options={statusFilterOptions} value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)} className="w-40" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : streams.length === 0 ? (
          <EmptyState
            icon={<Radio className="h-16 w-16" />}
            title="No streams available"
            description="There are no live streams at the moment. Check back later!"
          />
        ) : (
          <div className="space-y-10">
            {/* Live Now */}
            {liveStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="danger" dot size="lg">LIVE</Badge>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Live Now</h2>
                  <span className="text-sm text-surface-500">({liveStreams.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {liveStreams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcomingStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Upcoming</h2>
                  <span className="text-sm text-surface-500">({upcomingStreams.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {upcomingStreams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
                </div>
              </section>
            )}

            {/* Ended */}
            {endedStreams.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-surface-400" />
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Ended</h2>
                  <span className="text-sm text-surface-500">({endedStreams.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {endedStreams.map(stream => <StreamCard key={stream.id} stream={stream} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
