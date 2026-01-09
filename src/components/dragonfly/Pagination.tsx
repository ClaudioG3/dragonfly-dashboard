"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        end = 5;
      }
      if (page >= totalPages - 2) {
        start = totalPages - 4;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={!canGoPrevious}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Info - Mobile */}
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
        Page {page} of {totalPages}
      </span>

      {/* Page Numbers - Desktop */}
      <div className="hidden items-center gap-1 sm:flex">
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          const isActive = pageNum === page;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum as number)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={!canGoNext}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        <span className="hidden sm:inline">Next</span>
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
