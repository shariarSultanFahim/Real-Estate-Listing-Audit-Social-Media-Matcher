"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface ListingStatusBadgeProps {
  discrepancyCount: number;
}

export function ListingStatusBadge({ discrepancyCount }: ListingStatusBadgeProps) {
  if (discrepancyCount > 0) {
    return (
      <Badge variant="destructive" className="gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
        <AlertCircle className="size-3.5" />
        {discrepancyCount} {discrepancyCount === 1 ? "Discrepancy" : "Discrepancies"}
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
      <CheckCircle2 className="size-3.5" />
      Synced &amp; Clean
    </Badge>
  );
}
