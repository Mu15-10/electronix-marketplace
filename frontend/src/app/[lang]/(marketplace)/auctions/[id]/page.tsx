'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { auctionsApi, usersApi } from '@/lib/api';
import { Auction, Bid } from '@/types';
import { formatPrice, formatRelativeTime, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Gavel, Timer, Eye, Heart, TrendingUp, Clock, CheckCircle, XCircle,
  AlertTriangle, Info, DollarSign, User, Shield, History,
} from 'lucide-react';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [autoBid, setAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidHistoryOpen, setBidHistoryOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('access_token'));
  }, []);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await auctionsApi.getById(params.id as string);
        setAuction(res.data);
        setBidAmount(String(res.data.current_bid + res.data.min_bid_increment));
      } catch {
        router.push(`/${lang}/auctions`);
      }
      setLoading(false);
    };
    fetchAuction();
  }, [params.id]);

  useEffect(() => {
    if (auction) {
      auctionsApi.getBids(auction.id).then(res => setBids(res.data.results || res.data || [])).catch(() => {});
      if (loggedIn) {
        auctionsApi.checkWatching(auction.id).then(res => setIsWatching(res.data.is_watching)).catch(() => {});
      }
    }
  }, [auction]);

  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const diff = new Date(auction.end_date).getTime() - Date.now();
      if (diff <= 0) { setTimeDisplay('Auction ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeDisplay(`${d > 0 ? `${d}d ` : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const handlePlaceBid = async () => {
    if (!loggedIn) { toast.error('Please login to place a bid'); return; }
    setSubmitting(true);
    try {
      await auctionsApi.placeBid(auction!.id, {
        amount: Number(bidAmount),
        auto_bid: autoBid,
        max_auto_bid: autoBid ? Number(maxAutoBid) : undefined,
      });
      toast.success('Bid placed successfully!');
      const res = await auctionsApi.getById(params.id as string);
      setAuction(res.data);
      setBidAmount(String(res.data.current_bid + res.data.min_bid_increment));
      const bidsRes = await auctionsApi.getBids(auction!.id);
      setBids(bidsRes.data.results || bidsRes.data || []);
    } catch {
      toast.error('Failed to place bid. Your bid may be too low.');
    }
    setSubmitting(false);
  };

  const handleToggleWatch = async () => {
    if (!loggedIn) { toast.error('Please login to watch'); return; }
    try {
      if (isWatching) {
        await auctionsApi.unwatch(auction!.id);
        setIsWatching(false);
        toast.success('Removed from watchlist');
      } else {
        await auctionsApi.watch(auction!.id);
        setIsWatching(true);
        toast.success('Added to watchlist');
      }
    } catch { toast.error('Failed to update watchlist'); }
  };

  const minimumBid = auction ? auction.current_bid + auction.min_bid_increment : 0;
  const isActive = auction?.status === 'active' && new Date(auction.end_date).getTime() > Date.now();

  if (loading) {
    return <div className="min-h-screen"><Header /><div className="flex justify-center py-20"><Spinner size="lg" /></div><Footer /></div>;
  }
  if (!auction) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-3">
            <Card padding="none" className="overflow-hidden mb-4">
              <div className="aspect-[4/3] bg-surface-100 dark:bg-surface-700 relative">
                {auction.listing?.images?.[selectedImage] ? (
                  <img src={auction.listing.images[selectedImage].url}
                    alt={auction.listing.title} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex items-center justify-center h-full text-surface-400"><Gavel className="h-20 w-20" /></div>
                )}
                {auction.status === 'ended' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="default" size="lg">Auction Ended</Badge>
                  </div>
                )}
              </div>
            </Card>
            {auction.listing?.images && auction.listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {auction.listing.images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)}
                    className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}>
                    <img src={img.thumbnail} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
                {auction.listing?.title || 'Auction Item'}
              </h1>
              <p className="text-surface-500 mb-4">
                {auction.listing?.brand} {auction.listing?.model}{auction.listing?.variant ? ` - ${auction.listing.variant}` : ''}
              </p>
              <p className="text-surface-600 dark:text-surface-300 leading-relaxed mb-6">{auction.listing?.description}</p>

              {auction.listing && (
                <Tabs defaultValue="details">
                  <TabList>
                    <Tab value="details">Details</Tab>
                    <Tab value="specs">Specifications</Tab>
                    <Tab value="seller">Seller</Tab>
                  </TabList>
                  <TabPanel value="details">
                    <p className="text-surface-600 dark:text-surface-300">{auction.listing.description}</p>
                  </TabPanel>
                  <TabPanel value="specs">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Brand', value: auction.listing.brand },
                        { label: 'Model', value: auction.listing.model },
                        { label: 'Condition', value: auction.listing.condition },
                        { label: 'Storage', value: auction.listing.storage || '-' },
                        { label: 'Color', value: auction.listing.color || '-' },
                        { label: 'Year', value: auction.listing.year?.toString() || '-' },
                      ].map((spec) => (
                        <div key={spec.label} className="flex justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                          <span className="text-sm text-surface-500">{spec.label}</span>
                          <span className="text-sm font-medium text-surface-900 dark:text-white">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </TabPanel>
                  <TabPanel value="seller">
                    <Card padding="md" className="flex items-center gap-4">
                      <Avatar src={auction.seller?.avatar} name={auction.seller?.full_name} size="lg" online />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-surface-900 dark:text-white">{auction.seller?.full_name}</p>
                          {auction.seller?.is_verified && <CheckCircle className="h-4 w-4 text-primary-500" />}
                        </div>
                        <p className="text-sm text-surface-500">{auction.seller?.total_sales || 0} sales</p>
                      </div>
                      <Button variant="outline" size="sm">View Seller</Button>
                    </Card>
                  </TabPanel>
                </Tabs>
              )}
            </div>
          </div>

          {/* Right: Bidding Info */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              {/* Countdown */}
              <Card padding="md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-surface-500">Time Remaining</span>
                  <Badge variant={isActive ? 'success' : 'default'} dot={isActive}>
                    {isActive ? 'Active' : auction.status}
                  </Badge>
                </div>
                <p className={`text-2xl font-mono font-bold ${isActive ? 'text-surface-900 dark:text-white' : 'text-danger-500'}`}>
                  {timeDisplay || '--'}
                </p>
              </Card>

              {/* Current Bid */}
              <Card padding="md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-surface-500">Current Bid</span>
                  <div className="flex items-center gap-1 text-sm text-surface-500">
                    <Gavel className="h-4 w-4" /> {auction.bid_count} bids
                  </div>
                </div>
                <p className="text-3xl font-bold text-primary-600">{formatPrice(auction.current_bid)}</p>
                <p className="text-sm text-surface-500 mt-1">
                  Starting price: {formatPrice(auction.start_price)}
                </p>
                {auction.reserve_price && (
                  <div className="mt-2">
                    <Badge variant={auction.reserve_met ? 'success' : 'warning'} size="sm">
                      {auction.reserve_met ? 'Reserve met' : 'Reserve not yet met'}
                    </Badge>
                  </div>
                )}
              </Card>

              {/* Place Bid */}
              {isActive ? (
                <Card padding="md">
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Place Your Bid</h3>
                  {!loggedIn ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-surface-500 mb-3">Login to place a bid</p>
                      <Button onClick={() => router.push(`/${lang}/login`)} className="w-full">Login</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input label={`Your Bid (min: ${formatPrice(minimumBid)})`} type="number"
                        value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={String(minimumBid)} />
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="autoBid" checked={autoBid}
                          onChange={(e) => setAutoBid(e.target.checked)}
                          className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                        <label htmlFor="autoBid" className="text-sm text-surface-700 dark:text-surface-300 cursor-pointer">
                          Auto-bid up to maximum
                        </label>
                      </div>
                      {autoBid && (
                        <Input label="Max Auto-bid Amount" type="number" value={maxAutoBid}
                          onChange={(e) => setMaxAutoBid(e.target.value)}
                          placeholder="Enter max amount" />
                      )}
                      <Button onClick={handlePlaceBid} loading={submitting}
                        disabled={!bidAmount || Number(bidAmount) < minimumBid} className="w-full">
                        <Gavel className="h-4 w-4" /> Place Bid
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card padding="md">
                  <div className="text-center py-4">
                    <XCircle className="h-10 w-10 mx-auto mb-2 text-surface-400" />
                    <h3 className="font-semibold text-surface-900 dark:text-white mb-1">Auction Ended</h3>
                    <p className="text-sm text-surface-500">This auction has ended.</p>
                  </div>
                </Card>
              )}

              {/* Watch button */}
              {loggedIn && (
                <Button variant="outline" onClick={handleToggleWatch} className="w-full">
                  <Heart className={`h-4 w-4 ${isWatching ? 'fill-danger-500 text-danger-500' : ''}`} />
                  {isWatching ? 'Watching' : 'Watch'}
                </Button>
              )}

              {/* Bid History Preview */}
              <Card padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-surface-900 dark:text-white">Bid History</h3>
                  <button onClick={() => setBidHistoryOpen(true)} className="text-sm text-primary-600 hover:underline">
                    View all
                  </button>
                </div>
                {bids.length === 0 ? (
                  <p className="text-sm text-surface-500">No bids yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {bids.slice(0, 5).map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between py-1.5 border-b border-surface-100 dark:border-surface-700 last:border-0">
                        <div className="flex items-center gap-2">
                          <Avatar src={bid.bidder?.avatar} name={bid.bidder?.full_name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white">
                              {bid.bidder?.full_name}
                              {bid.is_auto_bid && <Badge variant="info" size="sm" className="ms-1">Auto</Badge>}
                            </p>
                            <p className="text-xs text-surface-500">{formatRelativeTime(bid.created_at)}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold ${bid.is_winning ? 'text-green-600' : 'text-surface-900 dark:text-white'}`}>
                          {formatPrice(bid.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Auction Info */}
              <Card padding="md">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Start Date</span>
                    <span className="text-surface-900 dark:text-white">{formatDate(auction.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">End Date</span>
                    <span className="text-surface-900 dark:text-white">{formatDate(auction.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Auto-extend</span>
                    <span className="text-surface-900 dark:text-white">{auction.auto_extend ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Min Increment</span>
                    <span className="text-surface-900 dark:text-white">{formatPrice(auction.min_bid_increment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Watchers</span>
                    <span className="text-surface-900 dark:text-white">{auction.watcher_count}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Bid History Modal */}
      <Modal isOpen={bidHistoryOpen} onClose={() => setBidHistoryOpen(false)} title="Bid History" size="lg">
        {bids.length === 0 ? (
          <p className="text-surface-500 text-center py-8">No bids yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-start pb-3 text-xs font-semibold text-surface-500 uppercase">Bidder</th>
                  <th className="text-start pb-3 text-xs font-semibold text-surface-500 uppercase">Amount</th>
                  <th className="text-start pb-3 text-xs font-semibold text-surface-500 uppercase">Time</th>
                  <th className="text-start pb-3 text-xs font-semibold text-surface-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid.id} className="border-b border-surface-100 dark:border-surface-700">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={bid.bidder?.avatar} name={bid.bidder?.full_name} size="sm" />
                        <span className="text-sm font-medium text-surface-900 dark:text-white">{bid.bidder?.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-semibold text-surface-900 dark:text-white">{formatPrice(bid.amount)}</td>
                    <td className="py-3 text-sm text-surface-500">{formatRelativeTime(bid.created_at)}</td>
                    <td className="py-3">
                      {bid.is_auto_bid ? <Badge variant="info" size="sm">Auto</Badge> : <Badge variant="default" size="sm">Manual</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
