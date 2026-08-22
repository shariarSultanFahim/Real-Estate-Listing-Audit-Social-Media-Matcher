"use client";

import { useListings, useDiscrepancies, useAgents } from "@/hooks/useRealEstateApi";
import { StatCards } from "@/components/dashboard/StatCards";
import { DiscrepancyBreakdown } from "@/components/dashboard/DiscrepancyBreakdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, Clock, Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";

export default function DashboardPage() {
  const { data: listings = [], isLoading: isLoadingListings } = useListings();
  const { data: discrepancies = [], isLoading: isLoadingDiscrepancies } = useDiscrepancies();
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();

  const isLoading = isLoadingListings || isLoadingDiscrepancies || isLoadingAgents;

  const activeDiscrepancies = discrepancies.filter((d) => d.status === "open" || d.status === "in_progress");
  const openCount = activeDiscrepancies.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <PageHeader
        title="Listing Audit & Cross-Post Control Center"
        description="Read-only discrepancy detection across Realtor.com, Zillow, Homes.com, Sotheby's & LACDB portals."
        actions={
          <>
            <Link href="/listings/new">
              <Button className="gap-2 shadow-md">
                <Plus className="size-4" />
                Add Listing
              </Button>
            </Link>
            <Link href="/listings">
              <Button variant="outline" className="gap-2">
                View Audit Table ({openCount} Active Issues)
              </Button>
            </Link>
          </>
        }
      />

      {/* Audit Schedule / Frequency Info Card */}
      <Card className="border-border bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Automated Syndication Audit Schedule</span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Active • On Schedule
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Continuous reconciliation comparing Brokerage Engine records against all monitored syndication platforms.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Audit Frequency</span>
              <span className="font-semibold text-foreground text-sm">Every 6 Hours</span>
            </div>
            <div className="h-7 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Audit</span>
              <span className="font-mono text-foreground">Aug 22, 2026 10:00 AM</span>
            </div>
            <div className="h-7 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Next Audit</span>
              <span className="font-mono text-primary font-semibold">Aug 22, 2026 4:00 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <StatCards
        totalListings={listings.length}
        openDiscrepancies={openCount}
        totalAgents={agents.length}
      />

      {/* Discrepancy Breakdown Section */}
      <DiscrepancyBreakdown discrepancies={discrepancies} />

      {/* Critical Action Required Widget */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Properties Requiring Immediate Audit</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Staff must review these flagged listings on syndication sites
              </CardDescription>
            </div>
          </div>
          <Link href="/listings">
            <Button variant="ghost" className="text-xs text-destructive hover:text-destructive/80">
              See All Flagged Properties <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDiscrepancies.slice(0, 3).map((disc) => {
            const listing = listings.find((l) => l.id === disc.listingId);
            return (
              <div
                key={disc.id}
                className="p-3.5 rounded-lg bg-card border border-border flex items-center justify-between gap-4 hover:border-accent transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-card-foreground">
                      {listing ? `${listing.address.street}, ${listing.address.city}` : "Unknown Address"}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {listing?.mlsNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="text-destructive font-medium capitalize">Field: {disc.field}</span>
                    <span>•</span>
                    <span className="uppercase font-mono">{disc.site}</span>
                  </p>
                </div>

                <Link href={`/listings/${disc.listingId}`}>
                  <Button size="sm" className="text-xs">
                    Inspect Discrepancy
                  </Button>
                </Link>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
