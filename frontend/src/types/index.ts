//  API Types

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_id: string;
  is_active: boolean;
  email_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface Store {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  store_type: string;
  language: string;
  config: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StoreListResponse {
  stores: Store[];
  total: number;
}

export interface Job {
  id: string;
  tenant_id: string;
  store_id: string | null;
  type: string;
  status: string;
  progress: number;
  result: Record<string, unknown> | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface JobCreateResponse {
  job_id: string;
  status: string;
  message: string;
  estimated_seconds: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export interface StoreGenerateRequest {
  name: string;
  store_type: string;
  language?: string;
  branding?: {
    primary_color?: string;
    style?: string;
  };
  payment?: {
    gateway?: string;
    methods?: string[];
  };
  shipping?: {
    provider?: string;
    zones?: string[];
  };
  features?: string[];
}

//  Product Types

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  image_url: string | null;
  images: string[];
  meta_title: string | null;
  meta_description: string | null;
  attributes: Record<string, unknown> | null;
  weight: number | null;
  weight_unit: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

//  Category Types

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
}

//  Order Types

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  attributes: Record<string, unknown> | null;
}

export interface Order {
  id: string;
  store_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, unknown> | null;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_status: string;
  tracking_number: string | null;
  shipping_method: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
}

export interface OrderSummary {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
}

// ═══════════════════════════════════════
//  Storefront (Public) Types
// ═══════════════════════════════════════

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  image_url: string | null;
  images: string[];
  is_featured: boolean;
  in_stock: boolean;
  category_name: string | null;
  attributes?: Record<string, unknown> | null;
  weight?: number | null;
  weight_unit?: string | null;
  related_products?: PublicProduct[];
}

export interface PublicProductListResponse {
  products: PublicProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
}

export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  store_type: string;
  language: string;
  logo_url: string | null;
  primary_color: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string | null;
  about: Record<string, unknown>;
  features: Array<Record<string, unknown>>;
  categories: PublicCategory[];
  featured_products: PublicProduct[];
  category_count: number;
  product_count: number;
}

export interface CartItem {
  product: PublicProduct;
  quantity: number;
}

export interface PublicOrderTracking {
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  currency: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    image_url: string | null;
  }>;
  tracking_number: string | null;
  shipping_method: string | null;
  created_at: string | null;
}

// ── Customer ──
export interface Customer {
  id: string;
  store_id: string;
  name: string;
  email: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  addresses: Array<Record<string, string>> | null;
  tags: string[] | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CustomerStats {
  total_customers: number;
  new_customers_this_month: number;
  returning_customers: number;
  average_order_value: number;
}

// ── Coupon ──
export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  max_uses: number | null;
  used_count: number;
  max_uses_per_customer: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponListResponse {
  coupons: Coupon[];
  total: number;
}

// ── Review ──
export interface Review {
  id: string;
  store_id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  per_page: number;
}

// ── Analytics ──
export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  product_image: string | null;
  total_sold: number;
  total_revenue: number;
}

export interface OrderStatusBreakdown {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface AnalyticsOverview {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  avg_order_value: number;
  conversion_rate: number;
  revenue_change: number;
  orders_change: number;
}

export interface FullAnalytics {
  overview: AnalyticsOverview;
  revenue_chart: RevenuePoint[];
  top_products: TopProduct[];
  order_status: OrderStatusBreakdown;
  recent_orders_count: number;
}
