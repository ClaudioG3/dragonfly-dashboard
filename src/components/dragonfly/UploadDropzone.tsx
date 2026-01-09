"use client";

import { useState, useRef, DragEvent } from "react";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function UploadDropzone({
  onFileSelect,
  acceptedTypes = [".pdf", ".png", ".jpg", ".jpeg"],
  disabled = false,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateFileType = (file: File): boolean => {
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return acceptedTypes.includes(fileExtension);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFileType(file)) {
        setSelectedFileName(file.name);
        onFileSelect(file);
      } else {
        alert(
          `Invalid file type. Please upload one of: ${acceptedTypes.join(", ")}`
        );
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFileType(file)) {
        setSelectedFileName(file.name);
        onFileSelect(file);
      } else {
        alert(
          `Invalid file type. Please upload one of: ${acceptedTypes.join(", ")}`
        );
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20"
            : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <svg
          className={`h-16 w-16 ${
            isDragOver
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-400"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          {selectedFileName || "Drag & drop your file"}
        </h3>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          or click to browse
        </p>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          Accepted formats: {acceptedTypes.join(", ")}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
