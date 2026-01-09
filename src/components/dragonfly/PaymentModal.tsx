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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod } from "@/lib/dragonfly/contracts";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    payment_method: PaymentMethod;
    payment_reference?: string;
    payment_date: string;
  }) => void;
  loading?: boolean;
}

export function PaymentModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: PaymentModalProps) {
  // Default payment date to today
  const today = new Date().toISOString().split("T")[0];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CHECK
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!paymentMethod) {
      newErrors.payment_method = "Payment method is required";
    }
    if (!paymentDate) {
      newErrors.payment_date = "Payment date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      payment_method: paymentMethod,
      payment_reference: paymentReference.trim() || undefined,
      payment_date: paymentDate,
    });

    // Reset form
    setPaymentMethod(PaymentMethod.CHECK);
    setPaymentReference("");
    setPaymentDate(today);
  };

  const handleClose = () => {
    setPaymentMethod(PaymentMethod.CHECK);
    setPaymentReference("");
    setPaymentDate(today);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Mark this invoice as paid by providing payment details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Payment Method */}
          <div className="grid gap-3">
            <Label>
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => {
                setPaymentMethod(value as PaymentMethod);
                setErrors((prev) => ({ ...prev, payment_method: "" }));
              }}
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={PaymentMethod.CHECK} id="check" />
                <Label htmlFor="check" className="font-normal cursor-pointer">
                  Check
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={PaymentMethod.ZELLE} id="zelle" />
                <Label htmlFor="zelle" className="font-normal cursor-pointer">
                  Zelle
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={PaymentMethod.BANK_TRANSFER}
                  id="bank-transfer"
                />
                <Label
                  htmlFor="bank-transfer"
                  className="font-normal cursor-pointer"
                >
                  Bank Transfer
                </Label>
              </div>
            </RadioGroup>
            {errors.payment_method && (
              <p className="text-sm text-red-500">{errors.payment_method}</p>
            )}
          </div>

          {/* Payment Reference */}
          <div className="grid gap-2">
            <Label htmlFor="payment-reference">
              Payment Reference
              {paymentMethod === PaymentMethod.CHECK && (
                <span className="text-muted-foreground text-xs ml-2">
                  (Check number recommended)
                </span>
              )}
            </Label>
            <Input
              id="payment-reference"
              placeholder={
                paymentMethod === PaymentMethod.CHECK
                  ? "Check #1234"
                  : paymentMethod === PaymentMethod.ZELLE
                  ? "Transaction ID (optional)"
                  : "Reference number (optional)"
              }
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Payment Date */}
          <div className="grid gap-2">
            <Label htmlFor="payment-date">
              Payment Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                setErrors((prev) => ({ ...prev, payment_date: "" }));
              }}
              disabled={loading}
              className={errors.payment_date ? "border-red-500" : ""}
            />
            {errors.payment_date && (
              <p className="text-sm text-red-500">{errors.payment_date}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
