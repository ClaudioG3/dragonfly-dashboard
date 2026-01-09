"use client";

import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { SimpleTooltip } from "@/components/ui/tooltip";

interface ConfidenceIndicatorProps {
  confidence: number | undefined;
  threshold?: number;
}

export function ConfidenceIndicator({
  confidence,
  threshold = 0.8,
}: ConfidenceIndicatorProps) {
  // No confidence data
  if (confidence === undefined || confidence === null) {
    return (
      <SimpleTooltip content="No confidence data">
        <HelpCircle className="h-4 w-4 text-muted-foreground inline-block ml-1" />
      </SimpleTooltip>
    );
  }

  // High confidence - show green checkmark or nothing (optional to show)
  if (confidence >= threshold) {
    return (
      <SimpleTooltip
        content={`High confidence extraction (${(confidence * 100).toFixed(0)}%)`}
      >
        <CheckCircle2 className="h-4 w-4 text-green-600 inline-block ml-1" />
      </SimpleTooltip>
    );
  }

  // Low confidence - show yellow/orange warning
  return (
    <SimpleTooltip
      content={
        <div>
          <p>Low confidence extraction - please verify</p>
          <p className="text-xs text-muted-foreground">
            Confidence: {(confidence * 100).toFixed(0)}%
          </p>
        </div>
      }
    >
      <AlertCircle className="h-4 w-4 text-yellow-600 inline-block ml-1" />
    </SimpleTooltip>
  );
}
