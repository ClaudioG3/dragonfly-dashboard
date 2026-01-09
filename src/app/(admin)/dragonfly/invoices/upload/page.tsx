"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/lib/dragonfly/auth";
import { mockCreateInvoiceFromUpload } from "@/lib/dragonfly/mockApi";
import { UploadDropzone } from "@/components/dragonfly";
import { useOfficeContext } from "@/lib/dragonfly/context/OfficeContext";

function UploadPage() {
  const router = useRouter();
  const { selectedOfficeId } = useOfficeContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create invoice via mock API (with current office)
      const invoice = await mockCreateInvoiceFromUpload(
        selectedFile.name,
        selectedOfficeId || undefined
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Brief delay to show 100%, then redirect
      setTimeout(() => {
        router.push(`/dragonfly/invoices/${invoice.id}`);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    router.push("/dragonfly/invoices");
  };

  return (
    <div className="p-6 mx-auto max-w-2xl">
      {/* Back link */}
      <button
        onClick={handleCancel}
        className="mb-4 flex items-center gap-1 text-brand-500 transition-colors hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
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
        Back to Invoices
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Upload Invoice
      </h1>

      {/* Dropzone */}
      <UploadDropzone onFileSelect={handleFileSelect} disabled={uploading} />

      {/* Selected file */}
      {selectedFile && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Selected:{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {selectedFile.name}
          </span>
        </p>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-brand-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {progress}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleCancel}
          disabled={uploading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default withAuth(UploadPage);
