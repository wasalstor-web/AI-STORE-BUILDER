// ══════ API Types ══════

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
