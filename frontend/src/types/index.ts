//  API Types 

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  tenant_id: string;
  is_active: boolean;
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
