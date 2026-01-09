"use client";

import { InvoiceStatus } from "@/lib/dragonfly/contracts";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  PENDING_APPROVAL: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  PAID: {
    label: "Paid",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
};

export function InvoiceStatusBadge({
  status,
  className = "",
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
