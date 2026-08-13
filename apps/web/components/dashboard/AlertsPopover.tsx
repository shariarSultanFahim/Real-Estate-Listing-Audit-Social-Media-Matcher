"use client";

import Link from "next/link";
import { useDiscrepancies, useListings } from "@/hooks/useRealEstateApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

export function AlertsPopover() {
  const { data: discrepancies = [] } = useDiscrepancies();
  const { data: listings = [] } = useListings();

  const openAlerts = discrepancies.filter((d) => d.status === "open");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="glass" size="sm" className="text-xs relative">
          <Bell className="size-3.5 mr-1" />
          Alerts ({openAlerts.length})
          {openAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            <h4 className="text-xs font-semibold text-foreground">Detected Discrepancies</h4>
          </div>
          <Badge variant="destructive" className="text-[10px]">
            {openAlerts.length} Active
          </Badge>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {openAlerts.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <span>All listings are 100% synced across portals!</span>
            </div>
          ) : (
            openAlerts.map((alert) => {
              const listing = listings.find((l) => l.id === alert.listingId);
              const address = listing?.address.street || "Listing Property";

              return (
                <Link
                  key={alert.id}
                  href={`/listings/${alert.listingId}`}
                  className="p-3 block hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="destructive" className="uppercase font-mono text-[9px] px-1 py-0">
                          {alert.site}
                        </Badge>
                        <span className="font-semibold text-xs text-foreground group-hover:text-primary capitalize">
                          {alert.field} Mismatch
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {address}
                      </p>
                      <div className="text-[10px] text-muted-foreground/80 font-mono mt-1 flex gap-2">
                        <span>Source: <strong className="text-foreground">{alert.sourceValue}</strong></span>
                        <span>Site: <strong className="text-destructive">{alert.siteValue}</strong></span>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="p-2 border-t border-border text-center bg-muted/20">
          <Link
            href="/listings?view=issues"
            className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            View All Audit Mismatches <ArrowRight className="size-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
