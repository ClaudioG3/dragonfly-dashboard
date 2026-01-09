"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  loading?: boolean;
}

export function RejectModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: RejectModalProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validate: required and min 10 characters
    if (!comment.trim()) {
      setError("Rejection reason is required");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Rejection reason must be at least 10 characters");
      return;
    }

    setError("");
    onSubmit(comment.trim());
    setComment(""); // Reset on submit
  };

  const handleClose = () => {
    setComment("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Invoice</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this invoice. This will be
            visible to the submitter.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection (minimum 10 characters)..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError(""); // Clear error on type
              }}
              rows={4}
              disabled={loading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Rejecting..." : "Reject Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
