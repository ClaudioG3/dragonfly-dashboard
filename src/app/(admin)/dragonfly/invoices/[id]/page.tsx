"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { withAuth, useDragonflySession } from "@/lib/dragonfly/auth";
import {
  mockGetInvoice,
  mockUpdateInvoiceDraft,
  mockDeleteInvoice,
  mockSubmitInvoice,
  mockApproveInvoice,
  mockRejectInvoice,
  mockMarkPaid,
  mockGetCategories,
  mockEditRejectedToDraft,
} from "@/lib/dragonfly/mockApi";
import { DragonflyApiError } from "@/lib/dragonfly/errors";
import {
  InvoiceDetail,
  InvoiceStatus,
  Category,
  PaymentMethod,
} from "@/lib/dragonfly/contracts";
import {
  InvoiceStatusBadge,
  ConfidenceIndicator,
  RejectModal,
  PaymentModal,
  ConfirmModal,
} from "@/components/dragonfly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isApprover } = useDragonflySession();

  // State management
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    vendor_name: "",
    invoice_number: "",
    amount: "",
    currency: "USD",
    invoice_date: "",
    due_date: "",
    category_id: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load invoice and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [inv, cats] = await Promise.all([
          mockGetInvoice(id),
          mockGetCategories(),
        ]);
        setInvoice(inv);
        setCategories(cats);
        // Populate form from invoice
        setFormData({
          vendor_name: inv.vendor_name || "",
          invoice_number: inv.invoice_number || "",
          amount: inv.amount?.toString() || "",
          currency: inv.currency || "USD",
          invoice_date: inv.invoice_date || "",
          due_date: inv.due_date || "",
          category_id: inv.category_id || "",
          description: inv.description || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Derived state
  const isEditable =
    invoice?.status === InvoiceStatus.DRAFT ||
    invoice?.status === InvoiceStatus.REJECTED;
  const canApprove =
    isApprover && invoice?.status === InvoiceStatus.PENDING_APPROVAL;
  const canPay = isApprover && invoice?.status === InvoiceStatus.APPROVED;
  const canDelete =
    invoice?.status === InvoiceStatus.DRAFT ||
    invoice?.status === InvoiceStatus.REJECTED;
  const isPaid = invoice?.status === InvoiceStatus.PAID;
  const isSubmitter = !isApprover;

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.vendor_name.trim()) {
      errors.vendor_name = "Vendor name is required";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Valid amount is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Action handlers
  const handleSave = async () => {
    if (!invoice || !validateForm()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await mockUpdateInvoiceDraft(id, {
        vendor_name: formData.vendor_name,
        invoice_number: formData.invoice_number || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        invoice_date: formData.invoice_date || undefined,
        due_date: formData.due_date || undefined,
        category_id: formData.category_id || undefined,
        description: formData.description || undefined,
        version: invoice.version,
      });
      setInvoice(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoice || !validateForm()) return;
    await handleSave(); // Save first
    setSaving(true);
    setError(null);
    try {
      const updated = await mockSubmitInvoice(id, invoice.version);
      setInvoice(updated);
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing...");
        setTimeout(async () => {
          try {
            const refreshed = await mockGetInvoice(id);
            setInvoice(refreshed);
            setError(null);
          } catch {
            setError("Failed to refresh invoice");
          }
        }, 500);
      } else {
        setError(err instanceof Error ? err.message : "Submit failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!invoice) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await mockApproveInvoice(id, invoice.version, {});
      setInvoice(updated);
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing...");
        setTimeout(async () => {
          try {
            const refreshed = await mockGetInvoice(id);
            setInvoice(refreshed);
            setError(null);
          } catch {
            setError("Failed to refresh invoice");
          }
        }, 500);
      } else {
        setError(err instanceof Error ? err.message : "Approval failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (comment: string) => {
    if (!invoice) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await mockRejectInvoice(id, invoice.version, { comment });
      setInvoice(updated);
      setShowRejectModal(false);
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing...");
        setShowRejectModal(false);
        setTimeout(async () => {
          try {
            const refreshed = await mockGetInvoice(id);
            setInvoice(refreshed);
            setError(null);
          } catch {
            setError("Failed to refresh invoice");
          }
        }, 500);
      } else {
        setError(err instanceof Error ? err.message : "Rejection failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (data: {
    payment_method: PaymentMethod;
    payment_reference?: string;
    payment_date: string;
  }) => {
    if (!invoice) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await mockMarkPaid(id, invoice.version, data);
      setInvoice(updated);
      setShowPaymentModal(false);
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing...");
        setShowPaymentModal(false);
        setTimeout(async () => {
          try {
            const refreshed = await mockGetInvoice(id);
            setInvoice(refreshed);
            setError(null);
          } catch {
            setError("Failed to refresh invoice");
          }
        }, 500);
      } else {
        setError(err instanceof Error ? err.message : "Payment failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    try {
      await mockDeleteInvoice(id, invoice.version);
      router.push("/dragonfly/invoices");
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing...");
        setTimeout(async () => {
          try {
            const refreshed = await mockGetInvoice(id);
            setInvoice(refreshed);
            setError(null);
          } catch {
            setError("Failed to refresh invoice");
          }
        }, 500);
      } else {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    }
  };

  const handleEditRejected = async () => {
    if (!invoice) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await mockEditRejectedToDraft(id, invoice.version);
      setInvoice(updated);
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing...");
        setTimeout(async () => {
          try {
            const refreshed = await mockGetInvoice(id);
            setInvoice(refreshed);
            setError(null);
          } catch {
            setError("Failed to refresh invoice");
          }
        }, 500);
      } else {
        setError(err instanceof Error ? err.message : "Failed to edit invoice");
      }
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invoice not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dragonfly/invoices")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Error Banner */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Rejection Banner */}
        {invoice.status === InvoiceStatus.REJECTED && invoice.rejection_comment && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Invoice Rejected</div>
              <p className="text-sm">{invoice.rejection_comment}</p>
              {invoice.rejected_by && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Rejected by {invoice.rejected_by.name} on{" "}
                  {invoice.rejected_at &&
                    new Date(invoice.rejected_at).toLocaleDateString()}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Approval Notice for Submitters */}
        {invoice.status === InvoiceStatus.PENDING_APPROVAL && isSubmitter && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This invoice is awaiting approval. You cannot make changes until it is
              approved or rejected.
            </AlertDescription>
          </Alert>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: PDF Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[600px]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-muted-foreground">
                      PDF Preview Placeholder
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {invoice.file_url}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Invoice Details Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vendor Name */}
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">
                    Vendor Name <span className="text-red-500">*</span>
                    <ConfidenceIndicator
                      confidence={invoice.extraction_confidence}
                    />
                  </Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor_name: e.target.value })
                    }
                    disabled={!isEditable}
                    className={formErrors.vendor_name ? "border-red-500" : ""}
                  />
                  {formErrors.vendor_name && (
                    <p className="text-sm text-red-500">{formErrors.vendor_name}</p>
                  )}
                </div>

                {/* Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_number: e.target.value })
                    }
                    disabled={!isEditable}
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                    <ConfidenceIndicator
                      confidence={invoice.extraction_confidence}
                    />
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    disabled={!isEditable}
                    className={formErrors.amount ? "border-red-500" : ""}
                  />
                  {formErrors.amount && (
                    <p className="text-sm text-red-500">{formErrors.amount}</p>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                    disabled={!isEditable}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Invoice Date */}
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Invoice Date</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_date: e.target.value })
                    }
                    disabled={!isEditable}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    disabled={!isEditable}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                    disabled={!isEditable}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat.is_active)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={!isEditable}
                  />
                </div>

                {/* Payment Info (if PAID) */}
                {isPaid && invoice.payment_method && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Payment Information
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Payment Method:</dt>
                        <dd className="font-medium">
                          {invoice.payment_method.replace(/_/g, " ")}
                        </dd>
                      </div>
                      {invoice.payment_reference && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Reference:</dt>
                          <dd className="font-medium">{invoice.payment_reference}</dd>
                        </div>
                      )}
                      {invoice.payment_date && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Payment Date:</dt>
                          <dd className="font-medium">
                            {new Date(invoice.payment_date).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                      {invoice.paid_by && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Paid By:</dt>
                          <dd className="font-medium">{invoice.paid_by.name}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t flex gap-3 flex-wrap">
                  {/* Delete (only DRAFT/REJECTED) */}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={saving}
                    >
                      Delete
                    </Button>
                  )}

                  {/* Edit & Resubmit (only REJECTED for submitter) */}
                  {invoice?.status === InvoiceStatus.REJECTED && isSubmitter && (
                    <Button
                      variant="default"
                      onClick={handleEditRejected}
                      disabled={saving}
                    >
                      {saving ? "Processing..." : "Edit & Resubmit"}
                    </Button>
                  )}

                  {/* Save (only editable states) */}
                  {isEditable && (
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  )}

                  {/* Submit (only DRAFT) */}
                  {invoice?.status === InvoiceStatus.DRAFT && (
                    <Button onClick={handleSubmit} disabled={saving}>
                      {saving ? "Submitting..." : "Submit for Approval"}
                    </Button>
                  )}

                  {/* Approve (only approvers on PENDING) */}
                  {canApprove && (
                    <>
                      <Button onClick={handleApprove} disabled={saving}>
                        {saving ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowRejectModal(true)}
                        disabled={saving}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* Mark as Paid (only approvers on APPROVED) */}
                  {canPay && (
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      disabled={saving}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RejectModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
        loading={saving}
      />

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleMarkPaid}
        loading={saving}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

export default withAuth(InvoiceDetailPage);
