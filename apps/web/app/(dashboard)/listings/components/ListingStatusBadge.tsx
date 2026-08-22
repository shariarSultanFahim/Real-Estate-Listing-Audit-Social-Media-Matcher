"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface ListingStatusBadgeProps {
  openCount?: number;
  inProgressCount?: number;
  discrepancyCount?: number;
}

export function ListingStatusBadge({
  openCount = 0,
  inProgressCount = 0,
  discrepancyCount = 0,
}: ListingStatusBadgeProps) {
  const totalActive = discrepancyCount > 0 ? discrepancyCount : openCount + inProgressCount;

  if (openCount > 0 && inProgressCount > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-[10px] font-semibold">
          <AlertCircle className="size-3" />
          {openCount} Open
        </Badge>
        <Badge variant="outline" className="gap-1 px-2 py-0.5 text-[10px] font-semibold border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="size-3" />
          {inProgressCount} In Progress
        </Badge>
      </div>
    );
  }

  if (inProgressCount > 0 && openCount === 0) {
    return (
      <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 text-xs font-semibold border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Clock className="size-3.5" />
        {inProgressCount} In Progress
      </Badge>
    );
  }

  if (totalActive > 0) {
    return (
      <Badge variant="destructive" className="gap-1.5 px-2.5 py-0.5 text-xs font-semibold">
        <AlertCircle className="size-3.5" />
        {totalActive} {totalActive === 1 ? "Discrepancy" : "Discrepancies"}
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

