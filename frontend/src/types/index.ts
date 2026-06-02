export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'seller' | 'admin';
  is_verified: boolean;
  is_two_factor_enabled: boolean;
  seller_level?: number;
  seller_rating?: number;
  total_sales?: number;
  trust_score?: number;
  is_online?: boolean;
  last_seen?: string;
  created_at: string;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  currency: string;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'damaged';
  brand: string;
  model: string;
  variant?: string;
  year?: number;
  storage?: string;
  color?: string;
  imei?: string;
  imei_verified?: boolean;
  images: ListingImage[];
  seller: User;
  category: Category;
  location: string;
  is_featured: boolean;
  is_promoted: boolean;
  status: 'active' | 'pending' | 'sold' | 'inactive' | 'rejected';
  ai_confidence?: number;
  ai_detected_model?: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  url: string;
  thumbnail: string;
  is_primary: boolean;
  alt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parent_id?: string;
  children?: Category[];
  listings_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'offer' | 'system';
  metadata?: Record<string, unknown>;
  is_read: boolean;
  is_translated?: boolean;
  original_content?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  listing?: Listing;
  last_message?: Message;
  unread_count: number;
  is_online?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer: User;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  is_helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  listing: Listing;
  buyer: User;
  seller: User;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  escrow_status?: 'held' | 'released' | 'refunded';
  shipping_address?: Address;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Dispute {
  id: string;
  order: Order;
  initiator: User;
  respondent: User;
  reason: string;
  description: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'order' | 'listing' | 'review' | 'dispute' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface FraudAlert {
  id: string;
  listing?: Listing;
  user?: User;
  risk_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  user: User;
  document_type: 'id_card' | 'passport' | 'license' | 'business_registration';
  document_images: string[];
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user: User;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  model?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  location?: string;
  seller_type?: string;
  sort_by?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  page_size?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  daily_budget?: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  status: 'active' | 'paused' | 'ended' | 'scheduled';
  start_date: string;
  end_date?: string;
  targeting?: CampaignTargeting;
  created_at: string;
}

export interface CampaignTargeting {
  locations?: string[];
  devices?: string[];
  categories?: string[];
}

export interface Ad {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  title: string;
  description: string;
  image_url?: string;
  type: 'banner' | 'video' | 'native';
  placement: 'home_top' | 'home_bottom' | 'sidebar' | 'search_results' | 'listing_detail';
  bid_amount: number;
  status: 'active' | 'paused' | 'ended' | 'pending';
  impressions: number;
  clicks: number;
  ctr: number;
  created_at: string;
}

export interface Auction {
  id: string;
  listing: Listing;
  seller: User;
  current_bid: number;
  reserve_price?: number;
  reserve_met: boolean;
  min_bid_increment: number;
  start_price: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'ended' | 'cancelled';
  bid_count: number;
  watcher_count: number;
  auto_extend: boolean;
  created_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder: User;
  amount: number;
  is_winning: boolean;
  is_auto_bid: boolean;
  created_at: string;
}

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  seller: User;
  thumbnail?: string;
  status: 'live' | 'scheduled' | 'ended';
  viewer_count: number;
  max_viewers?: number;
  chat_enabled: boolean;
  scheduled_start?: string;
  started_at?: string;
  ended_at?: string;
  tags?: string[];
  pinned_products?: Listing[];
  created_at: string;
}

export interface DashboardStats {
  total_listings: number;
  active_listings: number;
  total_orders: number;
  total_revenue: number;
  total_earnings: number;
  average_rating: number;
  pending_orders: number;
  unread_messages: number;
}

export interface AnalyticsData {
  views_over_time: { date: string; count: number }[];
  revenue_over_time: { date: string; amount: number }[];
  listings_by_category: { category: string; count: number }[];
  orders_by_status: { status: string; count: number }[];
  top_sellers: { user: User; revenue: number }[];
  conversion_rate: number;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'awaiting_reply' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'payment' | 'verification' | 'shipping' | 'fraud' | 'account' | 'other';
  messages: TicketMessage[];
  attachments: string[];
  rating?: number;
  user: User;
  assigned_to?: User;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender: User;
  content: string;
  is_internal: boolean;
  attachments: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  plan_name: string;
  price: number;
  currency: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  period: 'monthly' | 'yearly';
  auto_renew: boolean;
  features: string[];
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancelled_at?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  key: 'free' | 'basic' | 'professional' | 'enterprise';
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
  is_featured: boolean;
}

export interface CommissionEntry {
  id: string;
  sale_amount: number;
  commission_percentage: number;
  commission_amount: number;
  platform_fee: number;
  tax: number;
  net: number;
  status: 'pending' | 'paid';
  sale: { id: string; listing_title: string };
  created_at: string;
}

export interface CommissionSummary {
  total_commission_paid: number;
  pending_commission: number;
  net_earnings: number;
  platform_fees: number;
  current_rate: number;
}

export interface CommissionConfig {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_fee?: number;
  max_fee?: number;
  category_override?: string;
  seller_level_override?: number;
  priority: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface PlatformRevenueSummary {
  total_revenue: number;
  by_month: { month: string; revenue: number }[];
  by_category: { category: string; revenue: number }[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_published: boolean;
}

// --- Loyalty Types ---
export interface LoyaltyPoints {
  balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
  points_to_next_tier: number;
  points_expiring: { points: number; expires_at: string }[];
}

export interface PointsHistoryEntry {
  id: string;
  description: string;
  points: number;
  type: 'earned' | 'spent' | 'expired';
  balance_after: number;
  created_at: string;
}

export interface Tier {
  name: string;
  key: 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
  min_points: number;
  benefits: string[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: 'discount' | 'free_shipping' | 'voucher' | 'gift_card' | 'product';
  value: number;
  currency: string;
  stock: number;
  image?: string;
  is_active: boolean;
  created_at: string;
}

// --- Referral Types ---
export interface ReferralStats {
  total_referrals: number;
  converted: number;
  pending: number;
  earnings: number;
}

export interface ReferralEntry {
  id: string;
  referred_user_name: string;
  date: string;
  status: 'pending' | 'converted' | 'rewarded';
  reward_amount: number;
}

export interface ReferralLeaderboardEntry {
  user: { id: string; full_name: string; avatar?: string };
  referral_count: number;
  conversion_rate: number;
}

// --- Pricing Types ---
export interface PriceAnalysis {
  recommended_price: number;
  min_price: number;
  max_price: number;
  market_average: number;
  confidence_score: number;
  demand_score: number;
  supply_score: number;
  price_history: { date: string; price: number }[];
}

export interface ListingPriceComparison {
  listing_id: string;
  listing_title: string;
  listing_price: number;
  market_average: number;
  price_ranking: number;
  demand_info: string;
  similar_listings: { title: string; price: number; condition: string }[];
}

// --- Market Intelligence Types ---
export interface DemandTrend {
  brand: string;
  model: string;
  demand_score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PriceTrend {
  date: string;
  average_price: number;
  median_price: number;
}

export interface TrendingBrand {
  brand: string;
  growth_rate: number;
  listing_count: number;
}

export interface RegionalTrend {
  region: string;
  demand_score: number;
  listing_count: number;
}

export interface TopSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CategoryPerformance {
  category: string;
  listings_count: number;
  avg_price: number;
  total_views: number;
}

export interface SellerInsight {
  type: 'tip' | 'alert' | 'recommendation';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MarketIntelligence {
  demand_trends: DemandTrend[];
  price_trends: PriceTrend[];
  trending_brands: TrendingBrand[];
  regional_trends: RegionalTrend[];
  top_searches: TopSearch[];
  category_performance: CategoryPerformance[];
  seller_insights: SellerInsight[];
}

export interface LoyaltyAdminStats {
  total_points_issued: number;
  total_points_redeemed: number;
  active_users_by_tier: { tier: string; count: number }[];
}

// --- Shipping Types ---
export type ShippingStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
export type ShippingMethod = 'standard' | 'express' | 'overnight';
export type PackageType = 'box' | 'envelope' | 'tube' | 'pallet';

export interface PackageDetails {
  weight: number;
  length: number;
  width: number;
  height: number;
  package_type: PackageType;
}

export interface TrackingEvent {
  id: string;
  status: ShippingStatus;
  location: string;
  description: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  carrier: string;
  status: ShippingStatus;
  package_details: PackageDetails;
  origin: Address;
  destination: Address;
  shipping_method: ShippingMethod;
  insurance: boolean;
  estimated_delivery: string;
  actual_delivery?: string;
  tracking_events: TrackingEvent[];
  order_id?: string;
  buyer_name?: string;
  listing_title?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingAnalytics {
  total_shipments: number;
  by_status: { status: string; count: number }[];
  average_delivery_time: number;
  carrier_usage: { carrier: string; count: number }[];
}

export interface ShippingSettings {
  default_carrier: string;
  default_package_type: PackageType;
  return_address: Address;
}

// --- Warranty Types ---
export type WarrantyType = 'seller' | 'manufacturer' | 'extended';
export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'claimed';
export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'resolved';

export interface Warranty {
  id: string;
  device: string;
  model: string;
  brand: string;
  warranty_type: WarrantyType;
  start_date: string;
  end_date: string;
  days_remaining: number;
  status: WarrantyStatus;
  order_id?: string;
  created_at: string;
}

export interface WarrantyClaim {
  id: string;
  warranty: Warranty;
  issue_description: string;
  evidence: string[];
  status: ClaimStatus;
  admin_notes?: string;
  claim_timeline: ClaimTimelineEntry[];
  created_at: string;
  updated_at: string;
}

export interface ClaimTimelineEntry {
  id: string;
  status: ClaimStatus;
  note: string;
  timestamp: string;
}

export interface WarrantyStats {
  total_active: number;
  claims_by_status: { status: string; count: number }[];
  average_processing_time: number;
  approval_rate: number;
}

export interface WarrantyConfig {
  id: string;
  category: string;
  default_duration_months: number;
  warranty_type: WarrantyType;
  is_active: boolean;
}

// --- Inspection Types ---
export type InspectionType = 'basic' | 'standard' | 'premium';
export type InspectionStatus = 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'failed';
export type ConditionGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CategoryScore {
  screen: number;
  body: number;
  camera: number;
  battery: number;
  ports: number;
  software: number;
}

export interface InspectionResult {
  overall_score: number;
  condition_grade: ConditionGrade;
  category_scores: CategoryScore;
  inspector_notes: string;
  photos: string[];
  verified: boolean;
}

export interface Inspector {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_available: boolean;
  specializations: string[];
  total_inspections: number;
  average_score: number;
  created_at: string;
}

export interface Inspection {
  id: string;
  device: string;
  listing_id?: string;
  inspection_type: InspectionType;
  status: InspectionStatus;
  preferred_date: string;
  scheduled_date?: string;
  result?: InspectionResult;
  inspector?: Inspector;
  user: User;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionStats {
  total: number;
  completed_today: number;
  average_score: number;
  pass_rate: number;
  by_status: { status: string; count: number }[];
}

export interface InspectionRequirement {
  category: string;
  checks: string[];
}
