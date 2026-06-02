import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const lang = localStorage.getItem('language') || 'en';
      config.headers['Accept-Language'] = lang;

      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh: refreshToken }
        );
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 429) {
      console.error('Rate limited. Please try again later.');
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default api;

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refresh: string) =>
    api.post('/auth/refresh', { refresh }),
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
  twoFactor: (data: { code: string; tempToken: string }) =>
    api.post('/auth/two-factor', data),
  googleLogin: (token: string) =>
    api.post('/auth/google', { token }),
  appleLogin: (token: string) =>
    api.post('/auth/apple', { token }),
};

export const listingsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/listings', { params }),
  getById: (id: string) => api.get(`/listings/${id}`),
  create: (data: FormData) =>
    api.post('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/listings/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/listings/${id}`),
  getMyListings: (params?: Record<string, string>) =>
    api.get('/listings/my', { params }),
  getCategories: () => api.get('/categories'),
  getCategoryListings: (id: string, params?: Record<string, string>) =>
    api.get(`/categories/${id}/listings`, { params }),
  search: (query: string, params?: Record<string, string>) =>
    api.get('/listings/search', { params: { q: query, ...params } }),
  getSimilar: (id: string) => api.get(`/listings/${id}/similar`),
  uploadImages: (id: string, data: FormData) =>
    api.post(`/listings/${id}/images`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  detectDevice: (data: FormData) =>
    api.post('/listings/detect-device', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, data: FormData) =>
    api.post(`/chat/conversations/${conversationId}/messages`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createConversation: (data: { participantId: string; listingId?: string }) =>
    api.post('/chat/conversations', data),
  markAsRead: (conversationId: string) =>
    api.post(`/chat/conversations/${conversationId}/read`),
  getUnreadCount: () => api.get('/chat/unread-count'),
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: FormData) =>
    api.put('/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUser: (id: string) => api.get(`/users/${id}`),
  getSellerInfo: (id: string) => api.get(`/users/${id}/seller`),
  getReviews: (userId: string) => api.get(`/users/${userId}/reviews`),
  addReview: (userId: string, data: Record<string, unknown>) =>
    api.post(`/users/${userId}/reviews`, data),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (listingId: string) =>
    api.post('/users/wishlist', { listing_id: listingId }),
  removeFromWishlist: (listingId: string) =>
    api.delete(`/users/wishlist/${listingId}`),
  getOrders: () => api.get('/users/orders'),
  getDisputes: () => api.get('/users/disputes'),
};

export const adminApi = {
  getUsers: (params?: Record<string, string>) =>
    api.get('/admin/users', { params }),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),
  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  banUser: (id: string) => api.post(`/admin/users/${id}/ban`),
  verifyUser: (id: string) => api.post(`/admin/users/${id}/verify`),
  getListings: (params?: Record<string, string>) =>
    api.get('/admin/listings', { params }),
  approveListing: (id: string) => api.post(`/admin/listings/${id}/approve`),
  rejectListing: (id: string, reason: string) =>
    api.post(`/admin/listings/${id}/reject`, { reason }),
  flagListing: (id: string) => api.post(`/admin/listings/${id}/flag`),
  getDisputes: (params?: Record<string, string>) =>
    api.get('/admin/disputes', { params }),
  resolveDispute: (id: string, data: Record<string, unknown>) =>
    api.post(`/admin/disputes/${id}/resolve`, data),
  getVerifications: (params?: Record<string, string>) =>
    api.get('/admin/verifications', { params }),
  approveVerification: (id: string) =>
    api.post(`/admin/verifications/${id}/approve`),
  rejectVerification: (id: string, reason: string) =>
    api.post(`/admin/verifications/${id}/reject`, { reason }),
  getFraudAlerts: (params?: Record<string, string>) =>
    api.get('/admin/fraud', { params }),
  resolveFraudAlert: (id: string) =>
    api.post(`/admin/fraud/${id}/resolve`),
  getAuditLogs: (params?: Record<string, string>) =>
    api.get('/admin/audit', { params }),
  getAnalytics: (params?: Record<string, string>) =>
    api.get('/admin/analytics', { params }),
  getSystemHealth: () => api.get('/admin/system-health'),
};

export const advertisingApi = {
  getCampaigns: (params?: Record<string, string>) =>
    api.get('/advertising/campaigns', { params }),
  getCampaign: (id: string) => api.get(`/advertising/campaigns/${id}`),
  createCampaign: (data: Record<string, unknown>) =>
    api.post('/advertising/campaigns', data),
  updateCampaign: (id: string, data: Record<string, unknown>) =>
    api.put(`/advertising/campaigns/${id}`, data),
  pauseCampaign: (id: string) =>
    api.post(`/advertising/campaigns/${id}/pause`),
  resumeCampaign: (id: string) =>
    api.post(`/advertising/campaigns/${id}/resume`),
  endCampaign: (id: string) =>
    api.post(`/advertising/campaigns/${id}/end`),
  getCampaignAds: (campaignId: string) =>
    api.get(`/advertising/campaigns/${campaignId}/ads`),
  createAd: (data: FormData) =>
    api.post('/advertising/ads', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateAd: (id: string, data: FormData) =>
    api.put(`/advertising/ads/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAd: (id: string) => api.delete(`/advertising/ads/${id}`),
  getAnalytics: (params?: Record<string, string>) =>
    api.get('/advertising/analytics', { params }),
};

export const auctionsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/auctions', { params }),
  getById: (id: string) => api.get(`/auctions/${id}`),
  getBids: (auctionId: string) =>
    api.get(`/auctions/${auctionId}/bids`),
  placeBid: (auctionId: string, data: { amount: number; auto_bid?: boolean; max_auto_bid?: number }) =>
    api.post(`/auctions/${auctionId}/bids`, data),
  watch: (auctionId: string) =>
    api.post(`/auctions/${auctionId}/watch`),
  unwatch: (auctionId: string) =>
    api.delete(`/auctions/${auctionId}/watch`),
  getMyBids: (params?: Record<string, string>) =>
    api.get('/auctions/my-bids', { params }),
  getMyAuctions: (params?: Record<string, string>) =>
    api.get('/auctions/my-auctions', { params }),
  getWonAuctions: (params?: Record<string, string>) =>
    api.get('/auctions/won', { params }),
  getWatching: (params?: Record<string, string>) =>
    api.get('/auctions/watching', { params }),
  getBidHistory: (auctionId: string) =>
    api.get(`/auctions/${auctionId}/bid-history`),
  createFromListing: (listingId: string, data: Record<string, unknown>) =>
    api.post(`/listings/${listingId}/create-auction`, data),
  checkWatching: (auctionId: string) =>
    api.get(`/auctions/${auctionId}/watching`),
};

export const supportApi = {
  getTickets: (params?: Record<string, string>) =>
    api.get('/support/tickets', { params }),
  getTicket: (id: string) => api.get(`/support/tickets/${id}`),
  createTicket: (data: Record<string, unknown>) =>
    api.post('/support/tickets', data),
  updateTicket: (id: string, data: Record<string, unknown>) =>
    api.patch(`/support/tickets/${id}`, data),
  addMessage: (ticketId: string, data: Record<string, unknown>) =>
    api.post(`/support/tickets/${ticketId}/messages`, data),
  resolveTicket: (id: string) =>
    api.post(`/support/tickets/${id}/resolve`),
  closeTicket: (id: string) =>
    api.post(`/support/tickets/${id}/close`),
  rateTicket: (id: string, rating: number) =>
    api.post(`/support/tickets/${id}/rate`, { rating }),
};

export const subscriptionApi = {
  getCurrent: () => api.get('/subscription/current'),
  getPlans: () => api.get('/subscription/plans'),
  subscribe: (planId: string, period: string) =>
    api.post('/subscription/subscribe', { plan_id: planId, period }),
  cancel: () => api.post('/subscription/cancel'),
  toggleAutoRenew: () => api.post('/subscription/toggle-auto-renew'),
  getHistory: (params?: Record<string, string>) =>
    api.get('/subscription/history', { params }),
};

export const commissionApi = {
  getSellerSummary: () => api.get('/commission/seller/summary'),
  getSellerHistory: (params?: Record<string, string>) =>
    api.get('/commission/seller/history', { params }),
  getConfigs: () => api.get('/commission/admin/configs'),
  createConfig: (data: Record<string, unknown>) =>
    api.post('/commission/admin/configs', data),
  updateConfig: (id: string, data: Record<string, unknown>) =>
    api.patch(`/commission/admin/configs/${id}`, data),
  deleteConfig: (id: string) =>
    api.delete(`/commission/admin/configs/${id}`),
  getRevenueSummary: (params?: Record<string, string>) =>
    api.get('/commission/admin/revenue', { params }),
};

export const faqApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/faq', { params }),
  getCategories: () => api.get('/faq/categories'),
};

export const loyaltyApi = {
  getPoints: () => api.get('/loyalty/points'),
  getHistory: (params?: Record<string, string>) =>
    api.get('/loyalty/history', { params }),
  getTiers: () => api.get('/loyalty/tiers'),
  getRewards: () => api.get('/loyalty/rewards'),
  redeemReward: (rewardId: string) =>
    api.post(`/loyalty/rewards/${rewardId}/redeem`),
};

export const adminLoyaltyApi = {
  getRewards: (params?: Record<string, string>) =>
    api.get('/admin/loyalty/rewards', { params }),
  createReward: (data: Record<string, unknown>) =>
    api.post('/admin/loyalty/rewards', data),
  updateReward: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/loyalty/rewards/${id}`, data),
  deleteReward: (id: string) =>
    api.delete(`/admin/loyalty/rewards/${id}`),
  getStats: () => api.get('/admin/loyalty/stats'),
};

export const referralApi = {
  getStats: () => api.get('/referrals/stats'),
  getReferrals: (params?: Record<string, string>) =>
    api.get('/referrals', { params }),
  getCode: () => api.get('/referrals/code'),
  getLeaderboard: () => api.get('/referrals/leaderboard'),
};

export const pricingApi = {
  analyze: (data: Record<string, string>) =>
    api.post('/pricing/analyze', data),
  getListingPrice: (listingId: string) =>
    api.get(`/pricing/listings/${listingId}`),
};

export const marketIntelligenceApi = {
  getData: (params?: Record<string, string>) =>
    api.get('/seller/intelligence', { params }),
};

export const shippingApi = {
  getMyShipments: (params?: Record<string, string>) =>
    api.get('/shipping/my', { params }),
  getShipment: (id: string) => api.get(`/shipping/${id}`),
  createShipment: (data: Record<string, unknown>) =>
    api.post('/shipping', data),
  trackShipment: (trackingNumber: string) =>
    api.get(`/shipping/track/${trackingNumber}`),
  getSellerShipments: (params?: Record<string, string>) =>
    api.get('/shipping/seller', { params }),
  markAsShipped: (id: string, data: Record<string, unknown>) =>
    api.post(`/shipping/${id}/mark-shipped`, data),
  getAnalytics: () => api.get('/shipping/analytics'),
  getSettings: () => api.get('/shipping/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    api.put('/shipping/settings', data),
  generateLabel: (id: string) =>
    api.post(`/shipping/${id}/label`),
  getCarriers: () => api.get('/shipping/carriers'),
};

export const warrantyApi = {
  getMyWarranties: (params?: Record<string, string>) =>
    api.get('/warranty/my', { params }),
  getWarranty: (id: string) => api.get(`/warranty/${id}`),
  getClaims: (params?: Record<string, string>) =>
    api.get('/warranty/claims', { params }),
  getClaim: (id: string) => api.get(`/warranty/claims/${id}`),
  createClaim: (data: Record<string, unknown>) =>
    api.post('/warranty/claims', data),
  getAdminClaims: (params?: Record<string, string>) =>
    api.get('/warranty/admin/claims', { params }),
  approveClaim: (id: string, notes?: string) =>
    api.post(`/warranty/admin/claims/${id}/approve`, { notes }),
  rejectClaim: (id: string, reason: string) =>
    api.post(`/warranty/admin/claims/${id}/reject`, { reason }),
  getConfigs: () => api.get('/warranty/admin/configs'),
  createConfig: (data: Record<string, unknown>) =>
    api.post('/warranty/admin/configs', data),
  updateConfig: (id: string, data: Record<string, unknown>) =>
    api.patch(`/warranty/admin/configs/${id}`, data),
  getStats: () => api.get('/warranty/admin/stats'),
};

export const inspectionApi = {
  getMyInspections: (params?: Record<string, string>) =>
    api.get('/inspections/my', { params }),
  getInspection: (id: string) => api.get(`/inspections/${id}`),
  createInspection: (data: Record<string, unknown>) =>
    api.post('/inspections', data),
  rescheduleInspection: (id: string, data: Record<string, unknown>) =>
    api.post(`/inspections/${id}/reschedule`, data),
  getAdminInspections: (params?: Record<string, string>) =>
    api.get('/inspections/admin', { params }),
  assignInspector: (id: string, inspectorId: string) =>
    api.post(`/inspections/${id}/assign`, { inspector_id: inspectorId }),
  updateStatus: (id: string, status: string) =>
    api.post(`/inspections/${id}/status`, { status }),
  submitResult: (id: string, data: Record<string, unknown>) =>
    api.post(`/inspections/${id}/result`, data),
  getInspectors: (params?: Record<string, string>) =>
    api.get('/inspections/inspectors', { params }),
  createInspector: (data: Record<string, unknown>) =>
    api.post('/inspections/inspectors', data),
  updateInspector: (id: string, data: Record<string, unknown>) =>
    api.put(`/inspections/inspectors/${id}`, data),
  getStats: () => api.get('/inspections/admin/stats'),
  getSellerInspections: (params?: Record<string, string>) =>
    api.get('/inspections/seller', { params }),
  getRequirements: () => api.get('/inspections/requirements'),
};

export const liveCommerceApi = {
  getStreams: (params?: Record<string, string>) =>
    api.get('/live/streams', { params }),
  getStream: (id: string) => api.get(`/live/streams/${id}`),
  createStream: (data: FormData) =>
    api.post('/live/streams', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStream: (id: string, data: FormData) =>
    api.put(`/live/streams/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  startStream: (id: string) =>
    api.post(`/live/streams/${id}/start`),
  endStream: (id: string) =>
    api.post(`/live/streams/${id}/end`),
  getStreamProducts: (id: string) =>
    api.get(`/live/streams/${id}/products`),
  pinProduct: (streamId: string, listingId: string) =>
    api.post(`/live/streams/${streamId}/products`, { listing_id: listingId }),
  unpinProduct: (streamId: string, productId: string) =>
    api.delete(`/live/streams/${streamId}/products/${productId}`),
  getStreamStats: (id: string) =>
    api.get(`/live/streams/${id}/stats`),
  getCategories: () => api.get('/live/categories'),
};
