"use client";

import {
  InvoiceDetail,
  InvoiceListItem,
  InvoiceListParams,
  InvoiceStatus,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  SessionResponse,
  UpdateInvoiceDraftPayload,
  ApproveInvoicePayload,
  RejectInvoicePayload,
  MarkPaidPayload,
  Category,
  UserRole,
} from "./contracts";
import { MOCK_USERS, MOCK_INVOICES, MOCK_CATEGORIES } from "./mockData";
import { DragonflyApiError } from "./errors";

// ============================================
// MUTABLE STATE
// ============================================

let invoices: InvoiceDetail[] = [...MOCK_INVOICES];

// ============================================
// HELPER FUNCTIONS
// ============================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const simulatedLatency = () => delay(200 + Math.random() * 200); // 200-400ms

const SESSION_KEY = "dragonfly_session";

// ============================================
// RBAC HELPER FUNCTIONS
// ============================================

function requireSession(): SessionResponse {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) {
    throw new DragonflyApiError({
      status: 401,
      code: "NOT_AUTHENTICATED",
      message: "You must be logged in.",
    });
  }

  try {
    const session = JSON.parse(sessionData);
    return { user: session.user };
  } catch {
    throw new DragonflyApiError({
      status: 401,
      code: "NOT_AUTHENTICATED",
      message: "Invalid session.",
    });
  }
}

function requireApprover(session: SessionResponse): void {
  if (
    session.user.role !== UserRole.APPROVER &&
    session.user.role !== UserRole.ADMIN
  ) {
    throw new DragonflyApiError({
      status: 403,
      code: "FORBIDDEN",
      message: "Approver or Admin role required.",
    });
  }
}

function requireOwner(session: SessionResponse, invoice: InvoiceDetail): void {
  if (invoice.submitted_by.id !== session.user.id) {
    throw new DragonflyApiError({
      status: 403,
      code: "FORBIDDEN",
      message: "You can only modify your own invoices.",
    });
  }
}

// ============================================
// AUTH FUNCTIONS
// ============================================

export async function mockLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  await simulatedLatency();

  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const { password: _, ...userWithoutPassword } = user;
  const accessToken = `mock-token-${user.id}-${Date.now()}`;

  const session = {
    user: userWithoutPassword,
    accessToken,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

export async function mockLogout(): Promise<void> {
  await simulatedLatency();
  localStorage.removeItem(SESSION_KEY);
}

export function mockGetSession(): SessionResponse | null {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) {
    return null;
  }

  try {
    const session = JSON.parse(sessionData);
    return { user: session.user };
  } catch {
    return null;
  }
}

// ============================================
// INVOICE FUNCTIONS
// ============================================

export async function mockListInvoices(
  params: InvoiceListParams = {}
): Promise<PaginatedResponse<InvoiceListItem>> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  const {
    status,
    vendor_name,
    date_from,
    date_to,
    page = 1,
    limit = 20,
    office_id, // NEW: office filter
  } = params;

  let filtered = [...invoices];

  // Apply office scoping (all roles)
  // Filter by office_id if provided (typically from selected office)
  if (office_id) {
    filtered = filtered.filter((inv) => inv.office.id === office_id);
  }

  // Apply data scoping: SUBMITTER sees only own invoices
  if (session.user.role === UserRole.SUBMITTER) {
    filtered = filtered.filter((inv) => inv.submitted_by.id === session.user.id);
  }
  // APPROVER and ADMIN see all invoices (within selected office)

  // Filter by status
  if (status) {
    filtered = filtered.filter((inv) => inv.status === status);
  }

  // Filter by vendor_name (partial match, case-insensitive)
  if (vendor_name) {
    const search = vendor_name.toLowerCase();
    filtered = filtered.filter((inv) =>
      inv.vendor_name.toLowerCase().includes(search)
    );
  }

  // Filter by date_from
  if (date_from) {
    filtered = filtered.filter((inv) => {
      const invoiceDate = inv.invoice_date || inv.created_at;
      return invoiceDate >= date_from;
    });
  }

  // Filter by date_to
  if (date_to) {
    filtered = filtered.filter((inv) => {
      const invoiceDate = inv.invoice_date || inv.created_at;
      return invoiceDate <= date_to;
    });
  }

  // Pagination
  const total = filtered.length;
  const total_pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  // Convert to list items
  const data: InvoiceListItem[] = paginated.map((inv) => ({
    id: inv.id,
    vendor_name: inv.vendor_name,
    invoice_number: inv.invoice_number,
    amount: inv.amount,
    currency: inv.currency,
    due_date: inv.due_date,
    status: inv.status,
    submitted_at: inv.submitted_at,
    created_at: inv.created_at,
    version: inv.version,
    office: inv.office,
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages,
    },
  };
}

export async function mockGetInvoice(id: string): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  const invoice = invoices.find((inv) => inv.id === id);
  if (!invoice) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  // SUBMITTER can only view own invoices, APPROVER/ADMIN can view all
  if (session.user.role === UserRole.SUBMITTER) {
    if (invoice.submitted_by.id !== session.user.id) {
      throw new DragonflyApiError({
        status: 403,
        code: "FORBIDDEN",
        message: "You can only view your own invoices.",
      });
    }
  }

  return invoice;
}

export async function mockUpdateInvoiceDraft(
  id: string,
  payload: UpdateInvoiceDraftPayload
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Only owner can update
  requireOwner(session, invoice);

  // Only allow updates to DRAFT or REJECTED
  if (
    invoice.status !== InvoiceStatus.DRAFT &&
    invoice.status !== InvoiceStatus.REJECTED
  ) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: `Cannot update invoice with status ${invoice.status}. Only DRAFT or REJECTED invoices can be updated.`,
    });
  }

  // Version check
  if (payload.version !== invoice.version) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Update invoice
  const updated: InvoiceDetail = {
    ...invoice,
    vendor_name: payload.vendor_name ?? invoice.vendor_name,
    invoice_number: payload.invoice_number ?? invoice.invoice_number,
    amount: payload.amount ?? invoice.amount,
    currency: payload.currency ?? invoice.currency,
    invoice_date: payload.invoice_date ?? invoice.invoice_date,
    due_date: payload.due_date ?? invoice.due_date,
    category_id: payload.category_id ?? invoice.category_id,
    description: payload.description ?? invoice.description,
    version: invoice.version + 1,
    updated_at: new Date().toISOString(),
  };

  // Update category object if category_id changed
  if (payload.category_id) {
    updated.category = MOCK_CATEGORIES.find(
      (cat) => cat.id === payload.category_id
    );
  }

  invoices[index] = updated;
  return updated;
}

export async function mockDeleteInvoice(
  id: string,
  expectedVersion: number
): Promise<void> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Only owner can delete
  requireOwner(session, invoice);

  // Version check
  if (invoice.version !== expectedVersion) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Only allow deletion of DRAFT or REJECTED
  if (
    invoice.status !== InvoiceStatus.DRAFT &&
    invoice.status !== InvoiceStatus.REJECTED
  ) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: `Cannot delete invoice with status ${invoice.status}. Only DRAFT or REJECTED invoices can be deleted.`,
    });
  }

  invoices.splice(index, 1);
}

// ============================================
// WORKFLOW FUNCTIONS
// ============================================

export async function mockSubmitInvoice(
  id: string,
  expectedVersion: number
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Only owner can submit
  requireOwner(session, invoice);

  // Version check
  if (invoice.version !== expectedVersion) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Only allow submission of DRAFT
  if (invoice.status !== InvoiceStatus.DRAFT) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Only DRAFT invoices can be submitted.",
    });
  }

  // Validate required fields
  if (!invoice.vendor_name?.trim()) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Vendor name is required.",
    });
  }

  if (invoice.amount == null || invoice.amount <= 0) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Amount must be greater than zero.",
    });
  }

  // Default currency if missing
  const currency = invoice.currency || "USD";

  // Update invoice
  const updated: InvoiceDetail = {
    ...invoice,
    currency,
    status: InvoiceStatus.PENDING_APPROVAL,
    submitted_at: new Date().toISOString(),
    version: invoice.version + 1,
    updated_at: new Date().toISOString(),
  };

  invoices[index] = updated;
  return updated;
}

export async function mockApproveInvoice(
  id: string,
  expectedVersion: number,
  payload?: ApproveInvoicePayload
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication and approver role
  const session = requireSession();
  requireApprover(session);

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Version check
  if (invoice.version !== expectedVersion) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Only allow approval of PENDING_APPROVAL
  if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Only PENDING_APPROVAL invoices can be approved.",
    });
  }

  // Update invoice
  const updated: InvoiceDetail = {
    ...invoice,
    status: InvoiceStatus.APPROVED,
    version: invoice.version + 1,
    updated_at: new Date().toISOString(),
  };

  invoices[index] = updated;
  return updated;
}

export async function mockRejectInvoice(
  id: string,
  expectedVersion: number,
  payload: RejectInvoicePayload
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication and approver role
  const session = requireSession();
  requireApprover(session);

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Version check
  if (invoice.version !== expectedVersion) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Only allow rejection of PENDING_APPROVAL
  if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Only PENDING_APPROVAL invoices can be rejected.",
    });
  }

  // Require comment
  if (!payload.comment?.trim()) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Rejection comment is required.",
    });
  }

  // Update invoice
  const updated: InvoiceDetail = {
    ...invoice,
    status: InvoiceStatus.REJECTED,
    rejection_comment: payload.comment,
    rejected_by: session.user,
    rejected_at: new Date().toISOString(),
    version: invoice.version + 1,
    updated_at: new Date().toISOString(),
  };

  invoices[index] = updated;
  return updated;
}

export async function mockMarkPaid(
  id: string,
  expectedVersion: number,
  payload: MarkPaidPayload
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication and approver role
  const session = requireSession();
  requireApprover(session);

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Version check
  if (invoice.version !== expectedVersion) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Only allow marking as paid if APPROVED
  if (invoice.status !== InvoiceStatus.APPROVED) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Only APPROVED invoices can be marked as paid.",
    });
  }

  // Validate required fields
  if (!payload.payment_method) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Payment method is required.",
    });
  }

  if (!payload.payment_date) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Payment date is required.",
    });
  }

  // Update invoice
  const updated: InvoiceDetail = {
    ...invoice,
    status: InvoiceStatus.PAID,
    payment_method: payload.payment_method,
    payment_reference: payload.payment_reference,
    payment_date: payload.payment_date,
    paid_by: session.user,
    paid_at: new Date().toISOString(),
    version: invoice.version + 1,
    updated_at: new Date().toISOString(),
  };

  invoices[index] = updated;
  return updated;
}

export async function mockEditRejectedToDraft(
  id: string,
  expectedVersion: number
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  const index = invoices.findIndex((inv) => inv.id === id);
  if (index === -1) {
    throw new DragonflyApiError({
      status: 404,
      code: "NOT_FOUND",
      message: `Invoice with id ${id} not found`,
    });
  }

  const invoice = invoices[index];

  // Only owner can edit rejected invoice
  requireOwner(session, invoice);

  // Version check
  if (invoice.version !== expectedVersion) {
    throw new DragonflyApiError({
      status: 409,
      code: "VERSION_CONFLICT",
      message: "Invoice was modified. Please refresh and try again.",
    });
  }

  // Only allow editing of REJECTED invoices
  if (invoice.status !== InvoiceStatus.REJECTED) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Only REJECTED invoices can be moved back to DRAFT.",
    });
  }

  // Update invoice - transition to DRAFT and clear rejection metadata
  const updated: InvoiceDetail = {
    ...invoice,
    status: InvoiceStatus.DRAFT,
    submitted_at: undefined,
    rejection_comment: undefined,
    rejected_by: undefined,
    rejected_at: undefined,
    version: invoice.version + 1,
    updated_at: new Date().toISOString(),
  };

  invoices[index] = updated;
  return updated;
}

// ============================================
// HELPERS
// ============================================

export async function mockGetCategories(): Promise<Category[]> {
  await simulatedLatency();
  return MOCK_CATEGORIES;
}

export async function mockCreateInvoiceFromUpload(
  fileName: string,
  officeId?: string
): Promise<InvoiceDetail> {
  await simulatedLatency();

  // Require authentication
  const session = requireSession();

  // Determine office for new invoice
  // Use provided officeId, or fall back to user's office_id
  const selectedOfficeId = officeId || session.user.office_id;
  if (!selectedOfficeId) {
    throw new DragonflyApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Office must be specified for invoice creation.",
    });
  }

  // Get office name (in real app this would be a lookup)
  // For now, we'll extract from user's office_name or use a simple mapping
  let officeName = session.user.office_name || "Unknown Office";
  if (selectedOfficeId === "miami-001") officeName = "Miami";
  if (selectedOfficeId === "orlando-001") officeName = "Orlando";
  if (selectedOfficeId === "georgia-001") officeName = "Georgia";

  // Generate random extraction confidence
  const extractionConfidence = 0.6 + Math.random() * 0.38; // 0.60-0.98

  // Create new invoice ID
  const newId = `inv-${String(invoices.length + 1).padStart(3, "0")}`;

  const newInvoice: InvoiceDetail = {
    id: newId,
    vendor_name: "Unknown Vendor",
    amount: 0,
    currency: "USD",
    status: InvoiceStatus.DRAFT,
    file_url: `https://s3.example.com/invoices/${newId}.pdf`,
    extraction_confidence: extractionConfidence,
    version: 1,
    submitted_by: session.user,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    office: { id: selectedOfficeId, name: officeName },
  };

  invoices.push(newInvoice);
  return newInvoice;
}
