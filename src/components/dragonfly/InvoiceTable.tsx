"use client";

import { InvoiceListItem } from "@/lib/dragonfly/contracts";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  loading: boolean;
  onRowClick: (id: string) => void;
}

export function InvoiceTable({
  invoices,
  loading,
  onRowClick,
}: InvoiceTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700"></div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading invoices...
          </p>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            No invoices found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or upload a new invoice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Vendor
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Invoice #
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Due Date
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() => onRowClick(invoice.id)}
              >
                <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {invoice.vendor_name}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {invoice.invoice_number || "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-6 py-4">
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(invoice.id);
                    }}
                    className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
