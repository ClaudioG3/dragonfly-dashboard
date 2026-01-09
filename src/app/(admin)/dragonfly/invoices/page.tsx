"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { withAuth } from "@/lib/dragonfly/auth";
import { mockListInvoices } from "@/lib/dragonfly/mockApi";
import {
  InvoiceListItem,
  InvoiceStatus,
  PaginationMeta,
  InvoiceListParams,
} from "@/lib/dragonfly/contracts";
import {
  InvoiceFiltersBar,
  InvoiceTable,
  Pagination,
} from "@/components/dragonfly";

function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Read filters from URL
  const status = searchParams.get("status") as InvoiceStatus | null;
  const vendorName = searchParams.get("vendor_name") || "";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: InvoiceListParams = {
        page,
        limit,
      };
      if (status) params.status = status;
      if (vendorName) params.vendor_name = vendorName;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const result = await mockListInvoices(params);
      setInvoices(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [status, vendorName, dateFrom, dateTo, page, limit]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // URL update helper
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change (except for page itself)
    if (!("page" in updates)) {
      params.set("page", "1");
    }

    router.push(`/dragonfly/invoices?${params.toString()}`);
  };

  // Event handlers
  const handleStatusChange = (newStatus: InvoiceStatus | "ALL") => {
    updateFilters({ status: newStatus === "ALL" ? null : newStatus });
  };

  const handleVendorSearchChange = (value: string) => {
    updateFilters({ vendor_name: value || null });
  };

  const handleDateFromChange = (value: string) => {
    updateFilters({ date_from: value || null });
  };

  const handleDateToChange = (value: string) => {
    updateFilters({ date_to: value || null });
  };

  const handleClearFilters = () => {
    router.push("/dragonfly/invoices");
  };

  const handleRowClick = (id: string) => {
    router.push(`/dragonfly/invoices/${id}`);
  };

  const handleNewInvoice = () => {
    router.push("/dragonfly/invoices/upload");
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Invoices
        </h1>
        <button
          onClick={handleNewInvoice}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Invoice
        </button>
      </div>

      {/* Filters */}
      <InvoiceFiltersBar
        status={status || "ALL"}
        vendorSearch={vendorName}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStatusChange={handleStatusChange}
        onVendorSearchChange={handleVendorSearchChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <InvoiceTable
        invoices={invoices}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default withAuth(InvoicesPage);
