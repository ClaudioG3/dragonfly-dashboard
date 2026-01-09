// ============================================
// ENUMS
// ============================================

export const InvoiceStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PAID: "PAID",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const UserRole = {
  SUBMITTER: "SUBMITTER",
  APPROVER: "APPROVER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const PaymentMethod = {
  CHECK: "CHECK",
  ZELLE: "ZELLE",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ApprovalAction = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type ApprovalAction = (typeof ApprovalAction)[keyof typeof ApprovalAction];

// ============================================
// CORE TYPES
// ============================================

export interface OfficeDTO {
  id: string;
  name: string;
  code?: string;
  is_active: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Office assignment fields
  office_id?: string; // For SUBMITTER/APPROVER: their assigned office; For ADMIN: home office
  office_name?: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
}

// ============================================
// INVOICE TYPES
// ============================================

export interface InvoiceListItem {
  id: string;
  vendor_name: string;
  invoice_number?: string;
  amount: number;
  currency: string;
  due_date?: string;
  status: InvoiceStatus;
  submitted_at?: string;
  created_at: string;
  version: number;
  office: { id: string; name: string };
}

export interface InvoiceDetail {
  id: string;
  vendor_id?: string;
  vendor_name: string;
  invoice_number?: string;
  amount: number;
  currency: string;
  invoice_date?: string;
  due_date?: string;
  category_id?: string;
  category?: Category;
  description?: string;
  status: InvoiceStatus;
  file_url: string;
  extraction_confidence?: number;
  version: number;
  submitted_by: UserSummary;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  // Office scoping
  office: { id: string; name: string };
  department?: { id: string; name: string }; // Optional for future use
  // Rejection details (populated when status is REJECTED)
  rejection_comment?: string;
  rejected_by?: UserSummary;
  rejected_at?: string;
  // Payment details (populated when status is PAID)
  payment_method?: PaymentMethod;
  payment_reference?: string;
  payment_date?: string;
  paid_by?: UserSummary;
  paid_at?: string;
}

export interface InvoiceApproval {
  id: string;
  invoice_id: string;
  approver: UserSummary;
  action: ApprovalAction;
  comment?: string;
  created_at: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_date: string;
  paid_by: UserSummary;
  created_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface InvoiceListParams {
  status?: InvoiceStatus;
  office_id?: string; // NEW: filter by office
  vendor_name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface UpdateInvoiceDraftPayload {
  vendor_name?: string;
  invoice_number?: string;
  amount?: number;
  currency?: string;
  invoice_date?: string;
  due_date?: string;
  category_id?: string;
  description?: string;
  version: number; // Required for optimistic locking
}

export interface ApproveInvoicePayload {
  comment?: string;
}

export interface RejectInvoicePayload {
  comment: string; // Required
}

export interface MarkPaidPayload {
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_date: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserSummary;
  accessToken: string;
}

export interface SessionResponse {
  user: UserSummary;
}
