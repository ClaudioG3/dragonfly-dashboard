"use client";

import { InvoiceStatus } from "@/lib/dragonfly/contracts";

interface InvoiceFiltersBarProps {
  status: InvoiceStatus | "ALL";
  vendorSearch: string;
  dateFrom: string;
  dateTo: string;
  onStatusChange: (status: InvoiceStatus | "ALL") => void;
  onVendorSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

export function InvoiceFiltersBar({
  status,
  vendorSearch,
  dateFrom,
  dateTo,
  onStatusChange,
  onVendorSearchChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: InvoiceFiltersBarProps) {
  const hasFilters =
    status !== "ALL" || vendorSearch || dateFrom || dateTo;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4">
        {/* Top row: Status and Vendor Search */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value as InvoiceStatus | "ALL")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          {/* Vendor Search */}
          <div>
            <label
              htmlFor="vendor-search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Vendor
            </label>
            <div className="relative">
              <input
                id="vendor-search"
                type="text"
                value={vendorSearch}
                onChange={(e) => onVendorSearchChange(e.target.value)}
                placeholder="Search vendor..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Date From */}
          <div>
            <label
              htmlFor="date-from"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              From Date
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>

          {/* Date To */}
          <div>
            <label
              htmlFor="date-to"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              To Date
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <div className="flex justify-end">
            <button
              onClick={onClearFilters}
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
