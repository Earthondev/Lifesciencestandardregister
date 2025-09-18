// Database Schema Types
export interface IDMaster {
  id_no: string;
  name: string;
  storage: string;
  material: string;
  cas: string;
  manufacturer: string;
  supplier: string;
  pack_unit: string;
  test_group: string;
  created_at: string;
  updated_at: string;
}

export interface StandardsRegister {
  id_no: string;
  name: string;
  storage: string;
  material: string;
  cas: string;
  manufacturer: string;
  supplier: string;
  concentration: number;
  concentration_unit: string;
  packing_size: number;
  packing_unit: string;
  lot: string;
  date_received: string;
  certificate_expiry: string;
  lab_expiry_date: string;
  test_group: string;
  status: 'Unopened' | 'In-Use' | 'Disposed';
  available_qty: number;
  date_opened?: string;
  date_disposed?: string;
  deeplink_in: string;
  deeplink_out: string;
  qr_in: string;
  qr_out: string;
}

export interface StatusLog {
  log_id: number;
  timestamp: string;
  id_no: string;
  from_status: string;
  to_status: string;
  by: string;
  note: string;
}

export interface Config {
  key: string;
  value: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'company' | 'lab';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Statistics {
  total_standards: number;
  unopened: number;
  in_use: number;
  disposed: number;
  expired: number;
  expiring_soon: number;
}

export interface RecentActivity {
  timestamp: string;
  id_no: string;
  action: string;
  details: string;
  user: string;
}

// Form Types
export interface RegisterStandardForm {
  name: string;
  storage: string;
  material: string;
  cas?: string;
  manufacturer: string;
  supplier: string;
  concentration: number;
  concentration_unit: string;
  packing_size: number;
  packing_unit: string;
  lot: string;
  date_received: string;
  certificate_expiry?: string;
  lab_expiry_date?: string;
  test_group: string;
  status: 'Unopened' | 'In-Use' | 'Disposed';
}

export interface ChangeStatusForm {
  id_no: string;
  new_status: 'Unopened' | 'In-Use' | 'Disposed';
  note?: string;
}

// UI Types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Notification Types
export interface LineNotification {
  type: 'expiry_warning' | 'low_stock' | 'status_change' | 'new_standard';
  message: string;
  data?: any;
}

// User Types
export interface User {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string;
  phone?: string;
  created_at?: string;
  is_active?: boolean;
  provider?: 'email' | 'google';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
