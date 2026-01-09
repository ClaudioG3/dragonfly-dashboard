"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Eye, AlertCircle } from "lucide-react";
import { withAuth, useDragonflySession } from "@/lib/dragonfly/auth";
import {
  mockListInvoices,
  mockApproveInvoice,
  mockRejectInvoice,
} from "@/lib/dragonfly/mockApi";
import { InvoiceListItem, InvoiceStatus, UserRole } from "@/lib/dragonfly/contracts";
import { DragonflyApiError } from "@/lib/dragonfly/errors";
import { RejectModal, InvoiceStatusBadge } from "@/components/dragonfly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOfficeContext } from "@/lib/dragonfly/context/OfficeContext";

function ApprovalsPage() {
  const router = useRouter();
  const { isApprover, user } = useDragonflySession();
  const { selectedOfficeId } = useOfficeContext();

  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-approvers
  useEffect(() => {
    if (!isApprover) {
      router.replace("/dragonfly/invoices");
    }
  }, [isApprover, router]);

  // Fetch pending invoices only
  useEffect(() => {
    if (isApprover) {
      loadPendingInvoices();
    }
  }, [isApprover, selectedOfficeId]);

  const loadPendingInvoices = async () => {
    setLoading(true);
    try {
      const result = await mockListInvoices({
        status: InvoiceStatus.PENDING_APPROVAL,
        limit: 100,
        office_id: selectedOfficeId || undefined, // NEW: filter by office
      });
      setInvoices(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const pendingCount = invoices.length;
  const totalPending = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Quick approve
  const handleApprove = async (id: string, version: number) => {
    setActionLoading(id);
    setError(null);
    try {
      await mockApproveInvoice(id, version, {});
      // Refresh list
      await loadPendingInvoices();
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing list...");
        setTimeout(() => {
          loadPendingInvoices();
          setError(null);
        }, 1000);
      } else {
        setError(err instanceof Error ? err.message : "Approval failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Quick reject (opens modal first)
  const handleRejectClick = (id: string) => {
    setRejectingId(id);
  };

  const handleReject = async (comment: string) => {
    if (!rejectingId) return;
    const invoice = invoices.find((inv) => inv.id === rejectingId);
    if (!invoice) return;

    setActionLoading(rejectingId);
    setError(null);
    try {
      await mockRejectInvoice(rejectingId, invoice.version, { comment });
      // Refresh list
      await loadPendingInvoices();
      setRejectingId(null);
    } catch (err) {
      if (err instanceof DragonflyApiError && err.code === "VERSION_CONFLICT") {
        setError("Invoice was updated elsewhere. Refreshing list...");
        setRejectingId(null);
        setTimeout(() => {
          loadPendingInvoices();
          setError(null);
        }, 1000);
      } else {
        setError(err instanceof Error ? err.message : "Rejection failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/dragonfly/invoices/${id}`);
  };

  // Don't render if not an approver
  if (!isApprover) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Approval Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending invoices
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting your approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total value of pending invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No invoices pending approval at this time.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const isProcessing = actionLoading === invoice.id;
                      return (
                        <TableRow
                          key={invoice.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewDetails(invoice.id)}
                        >
                          <TableCell className="font-medium">
                            {invoice.vendor_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {invoice.invoice_number || "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {invoice.currency}{" "}
                            {invoice.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            {invoice.due_date
                              ? new Date(invoice.due_date).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {invoice.submitted_at
                              ? new Date(invoice.submitted_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(invoice.id)}
                                disabled={isProcessing}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(invoice.id, invoice.version);
                                }}
                                disabled={isProcessing}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectClick(invoice.id);
                                }}
                                disabled={isProcessing}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Modal */}
      <RejectModal
        open={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onSubmit={handleReject}
        loading={!!actionLoading}
      />
    </div>
  );
}

export default withAuth(ApprovalsPage, { requiredRole: UserRole.APPROVER });
