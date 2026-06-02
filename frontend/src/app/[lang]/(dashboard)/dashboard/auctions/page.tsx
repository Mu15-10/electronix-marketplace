'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { auctionsApi } from '@/lib/api';
import { Auction, Bid } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { Gavel, Eye, Heart, Clock, Trophy, TrendingUp, Timer } from 'lucide-react';

interface AuctionWithBid extends Auction {
  my_bid?: number;
}

export default function MyAuctionsPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [myBids, setMyBids] = useState<AuctionWithBid[]>([]);
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [watching, setWatching] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bidsRes, auctionsRes, wonRes, watchRes] = await Promise.all([
          auctionsApi.getMyBids(),
          auctionsApi.getMyAuctions(),
          auctionsApi.getWonAuctions(),
          auctionsApi.getWatching(),
        ]);
        setMyBids(bidsRes.data.results || bidsRes.data || []);
        setMyAuctions(auctionsRes.data.results || auctionsRes.data || []);
        setWonAuctions(wonRes.data.results || wonRes.data || []);
        setWatching(watchRes.data.results || watchRes.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        const all = [...myBids, ...myAuctions, ...watching];
        const updated: Record<string, string> = {};
        all.forEach((a) => {
          const diff = new Date(a.end_date).getTime() - Date.now();
          if (diff <= 0) { updated[a.id] = 'Ended'; return; }
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          updated[a.id] = d > 0 ? `${d}d ${h}h` : `${h}h ${m}m ${s}s`;
        });
        setTimeRemaining(updated);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading, myBids, myAuctions, watching]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Auctions</h1>
        <p className="text-sm text-surface-500">Manage your auction activity</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Bids', value: myBids.length, icon: Gavel, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
          { label: 'My Auctions', value: myAuctions.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Won', value: wonAuctions.length, icon: Trophy, color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
          { label: 'Watching', value: watching.length, icon: Eye, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
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

      <Tabs defaultValue="my-bids">
        <TabList>
          <Tab value="my-bids">My Active Bids ({myBids.length})</Tab>
          <Tab value="my-auctions">My Auctions ({myAuctions.length})</Tab>
          <Tab value="won">Won ({wonAuctions.length})</Tab>
          <Tab value="watching">Watching ({watching.length})</Tab>
        </TabList>

        <TabPanel value="my-bids">
          {myBids.length === 0 ? (
            <EmptyState icon={<Gavel className="h-16 w-16" />} title="No active bids"
              description="Browse auctions and place your first bid." action={
                <Link href={`/${lang}/auctions`}><Button>Browse Auctions</Button></Link>
              } />
          ) : (
            <div className="grid gap-4">
              {myBids.map((auction) => (
                <Link key={auction.id} href={`/${lang}/auctions/${auction.id}`}>
                  <Card hover padding="md">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {auction.listing?.images?.[0] ? (
                          <img src={auction.listing.images[0].thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-surface-900 dark:text-white truncate">
                          {auction.listing?.title || 'Auction'}
                        </h3>
                        <p className="text-xs text-surface-500">{auction.listing?.brand} {auction.listing?.model}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-primary-600 font-semibold">{formatPrice(auction.current_bid)}</span>
                          {auction.my_bid && <span className="text-surface-500">My bid: {formatPrice(auction.my_bid)}</span>}
                          <Badge variant={auction.status === 'active' ? 'success' : 'default'} size="sm">{auction.status}</Badge>
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-xs text-surface-500">Time Left</p>
                        <p className="text-sm font-mono font-medium text-surface-900 dark:text-white">
                          {timeRemaining[auction.id] || '--'}
                        </p>
                        <p className="text-xs text-surface-400 mt-1">{auction.bid_count} bids</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="my-auctions">
          {myAuctions.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-16 w-16" />} title="No auctions as seller"
              description="Create an auction from one of your listings." action={
                <Link href={`/${lang}/dashboard/listings`}><Button>View Listings</Button></Link>
              } />
          ) : (
            <div className="grid gap-4">
              {myAuctions.map((auction) => (
                <Link key={auction.id} href={`/${lang}/auctions/${auction.id}`}>
                  <Card hover padding="md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                          {auction.listing?.images?.[0] ? (
                            <img src={auction.listing.images[0].thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-6 w-6" /></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-surface-900 dark:text-white">{auction.listing?.title || 'Auction'}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={auction.status === 'active' ? 'success' : auction.status === 'ended' ? 'default' : 'warning'} size="sm">
                              {auction.status}
                            </Badge>
                            <span className="text-xs text-surface-500">{auction.bid_count} bids</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-sm text-surface-500">Current Bid</p>
                        <p className="text-lg font-bold text-primary-600">{formatPrice(auction.current_bid)}</p>
                        <p className="text-xs text-surface-400 mt-1">
                          {timeRemaining[auction.id] || formatRelativeTime(auction.end_date)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="won">
          {wonAuctions.length === 0 ? (
            <EmptyState icon={<Trophy className="h-16 w-16" />} title="No won auctions yet"
              description="Place competitive bids to win auctions." action={
                <Link href={`/${lang}/auctions`}><Button>Browse Auctions</Button></Link>
              } />
          ) : (
            <div className="grid gap-4">
              {wonAuctions.map((auction) => (
                <Card key={auction.id} padding="md">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                      {auction.listing?.images?.[0] ? (
                        <img src={auction.listing.images[0].thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-surface-900 dark:text-white">{auction.listing?.title || 'Auction'}</h3>
                      <p className="text-xs text-surface-500">Won for {formatPrice(auction.current_bid)}</p>
                    </div>
                    <Badge variant="success">Won</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="watching">
          {watching.length === 0 ? (
            <EmptyState icon={<Heart className="h-16 w-16" />} title="No watched auctions"
              description="Watch auctions to keep track of them." action={
                <Link href={`/${lang}/auctions`}><Button>Browse Auctions</Button></Link>
              } />
          ) : (
            <div className="grid gap-4">
              {watching.map((auction) => (
                <Link key={auction.id} href={`/${lang}/auctions/${auction.id}`}>
                  <Card hover padding="md">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {auction.listing?.images?.[0] ? (
                          <img src={auction.listing.images[0].thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-surface-900 dark:text-white truncate">{auction.listing?.title || 'Auction'}</h3>
                        <p className="text-xs text-surface-500">{auction.bid_count} bids · {auction.watcher_count} watching</p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-semibold text-primary-600">{formatPrice(auction.current_bid)}</p>
                        <p className="text-xs text-surface-400">{timeRemaining[auction.id] || '--'}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
