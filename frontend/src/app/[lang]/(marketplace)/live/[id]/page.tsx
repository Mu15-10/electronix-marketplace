'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { liveCommerceApi } from '@/lib/api';
import { LiveStream, Listing } from '@/types';
import { formatPrice, formatRelativeTime, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Play, ShoppingCart, Eye, Users, MessageSquare, Clock, Send, Tv,
  X, Heart, Radio,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
}

export default function LiveStreamPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Listing[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [chatEnabled, setChatEnabled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await liveCommerceApi.getStream(params.id as string);
        setStream(res.data);
        setViewerCount(res.data.viewer_count || 0);
        setChatEnabled(res.data.chat_enabled || false);
      } catch {
        router.push(`/${lang}/live`);
      }
      setLoading(false);
    };
    fetchStream();

    // Fetch products
    liveCommerceApi.getStreamProducts(params.id as string)
      .then(res => setProducts(res.data.results || res.data || []))
      .catch(() => {});

    // Mock chat messages for demo
    if (chatEnabled) {
      setChatMessages([
        { id: '1', user: 'Host', message: 'Welcome to the stream!', time: '0:00' },
        { id: '2', user: 'Seller', message: 'We have amazing deals today!', time: '0:05' },
      ]);
    }
  }, [params.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: String(Date.now()),
      user: 'You',
      message: chatInput,
      time: new Date().toLocaleTimeString(),
    }]);
    setChatInput('');
  };

  const handleBuyProduct = (listing: Listing) => {
    router.push(`/${lang}/listings/${listing.id}`);
  };

  if (loading) {
    return <div className="min-h-screen"><Header /><div className="flex justify-center py-20"><Spinner size="lg" /></div><Footer /></div>;
  }
  if (!stream) return null;

  const isLive = stream.status === 'live';
  const isEnded = stream.status === 'ended';

  return (
    <div className="min-h-screen bg-surface-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content: Player + Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
              {isLive ? (
                <div className="text-center">
                  <Radio className="h-20 w-20 text-surface-600 mx-auto mb-4" />
                  <p className="text-surface-400 text-lg font-medium">Live Stream Playing</p>
                  <p className="text-surface-600 text-sm mt-1">Stream content would appear here</p>
                </div>
              ) : isEnded ? (
                <div className="text-center">
                  <Tv className="h-20 w-20 text-surface-600 mx-auto mb-4" />
                  <p className="text-surface-400 text-lg font-medium">Stream Ended</p>
                  <p className="text-surface-600 text-sm mt-1">This stream has finished</p>
                </div>
              ) : (
                <div className="text-center">
                  <Clock className="h-20 w-20 text-surface-600 mx-auto mb-4" />
                  <p className="text-surface-400 text-lg font-medium">Stream Not Started</p>
                  <p className="text-surface-600 text-sm mt-1">
                    Scheduled for {stream.scheduled_start ? formatDate(stream.scheduled_start) : 'TBD'}
                  </p>
                </div>
              )}

              {/* Overlay Status Badge */}
              <div className="absolute top-4 start-4 flex items-center gap-2">
                {isLive && (
                  <Badge variant="danger" size="md" dot>
                    <span className="animate-pulse">LIVE</span>
                  </Badge>
                )}
                <Badge variant="default" size="md" className="bg-black/60 text-white border-0">
                  <Eye className="h-3.5 w-3.5" /> {viewerCount} watching
                </Badge>
              </div>

              {stream.ended_at && (
                <div className="absolute top-4 end-4">
                  <Badge variant="default" size="md" className="bg-black/60 text-white border-0">
                    Duration: {stream.started_at && stream.ended_at
                      ? Math.round((new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()) / 60000)
                      : '?'} min
                  </Badge>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="bg-white dark:bg-surface-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stream.title}</h1>
                  {stream.description && (
                    <p className="text-surface-500 mt-1">{stream.description}</p>
                  )}
                </div>
                {!isEnded && (
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" /> Follow
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <Link href={`/${lang}/sellers/${stream.seller?.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <Avatar src={stream.seller?.avatar} name={stream.seller?.full_name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{stream.seller?.full_name}</p>
                    <p className="text-xs text-surface-500">Seller</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 text-sm text-surface-500 ms-auto">
                  <Users className="h-4 w-4" /> {viewerCount} viewers
                </div>
              </div>

              {stream.tags && stream.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {stream.tags.map(tag => (
                    <Badge key={tag} variant="primary" size="sm">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Pinned Products */}
            {products.length > 0 && (
              <div className="bg-white dark:bg-surface-800 rounded-xl p-4 sm:p-6">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary-600" />
                  Featured Products ({products.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((product) => (
                    <Card key={product.id} padding="sm" hover className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0].thumbnail} alt={product.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-surface-400"><ShoppingCart className="h-6 w-6" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{product.title}</p>
                        <p className="text-sm font-semibold text-primary-600 mt-0.5">{formatPrice(product.price, product.currency)}</p>
                      </div>
                      <Button size="sm" onClick={() => handleBuyProduct(product)}>
                        Buy Now
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty products state */}
            {products.length === 0 && isLive && (
              <Card padding="md">
                <p className="text-surface-500 text-center">No products pinned yet</p>
              </Card>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-800 rounded-xl flex flex-col h-[calc(100vh-12rem)] sticky top-20">
              <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat
                  {chatEnabled ? (
                    <Badge variant="success" size="sm" dot>Active</Badge>
                  ) : (
                    <Badge variant="default" size="sm">Disabled</Badge>
                  )}
                </h3>
              </div>

              {chatEnabled ? (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {chatMessages.length === 0 ? (
                      <p className="text-sm text-surface-500 text-center py-8">No messages yet</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start gap-2">
                          <Avatar name={msg.user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-surface-900 dark:text-white">{msg.user}</span>
                              <span className="text-[10px] text-surface-400">{msg.time}</span>
                            </div>
                            <p className="text-sm text-surface-600 dark:text-surface-300 break-words">{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {isLive && (
                    <div className="p-3 border-t border-surface-200 dark:border-surface-700">
                      <div className="flex gap-2">
                        <Input placeholder="Type a message..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} />
                        <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center">
                    <MessageSquare className="h-10 w-10 text-surface-400 mx-auto mb-3" />
                    <p className="text-sm text-surface-500">Chat is not available for this stream</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ended Stream Summary */}
        {isEnded && (
          <Card padding="md" className="mt-4">
            <div className="text-center py-4">
              <Tv className="h-12 w-12 text-surface-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">Stream Ended</h3>
              <p className="text-sm text-surface-500">
                {stream.started_at && stream.ended_at
                  ? `Stream ran for ${Math.round((new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()) / 60000)} minutes`
                  : 'This stream has ended'}
              </p>
              <p className="text-sm text-surface-400 mt-1">Total viewers: {viewerCount}</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Link href={`/${lang}/live`}>
                  <Button variant="outline">Browse More Streams</Button>
                </Link>
                {products.length > 0 && (
                  <Button onClick={() => handleBuyProduct(products[0])}>
                    View Products
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
