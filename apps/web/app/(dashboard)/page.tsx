"use client";

import { useListings, useDiscrepancies, useAgents } from "@/hooks/useRealEstateApi";
import { StatCards } from "@/components/dashboard/StatCards";
import { DiscrepancyBreakdown } from "@/components/dashboard/DiscrepancyBreakdown";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: listings = [], isLoading: isLoadingListings } = useListings();
  const { data: discrepancies = [], isLoading: isLoadingDiscrepancies } = useDiscrepancies();
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();

  const isLoading = isLoadingListings || isLoadingDiscrepancies || isLoadingAgents;

  const openDiscrepancies = discrepancies.filter((d) => d.status === "open");
  const openCount = openDiscrepancies.length;

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Listing Audit &amp; Cross-Post Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read-only discrepancy detection across Realtor.com, Zillow, Homes.com &amp; Sotheby&apos;s portals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/listings/new">
            <Button className="gap-2 shadow-md">
              <Plus className="size-4" />
              Add Listing
            </Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline" className="gap-2">
              View Audit Table ({openCount} Issues)
            </Button>
          </Link>
        </div>
      </div>

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
          {openDiscrepancies.slice(0, 3).map((disc) => {
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
