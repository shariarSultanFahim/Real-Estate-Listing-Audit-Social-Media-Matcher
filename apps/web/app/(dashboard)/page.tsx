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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Listing Audit &amp; Cross-Post Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Read-only discrepancy detection across Realtor.com, Zillow, Homes.com &amp; Sotheby&apos;s portals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/listings/new">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-600/20">
              <Plus className="size-4" />
              Add Listing
            </Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline" className="border-slate-800 text-slate-300 gap-2">
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
      <Card className="glass-panel border-rose-500/20 bg-rose-950/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Properties Requiring Immediate Audit</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Staff must review these flagged listings on syndication sites
              </CardDescription>
            </div>
          </div>
          <Link href="/listings">
            <Button variant="ghost" className="text-xs text-rose-300 hover:text-rose-200">
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
                className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">
                      {listing ? `${listing.address.street}, ${listing.address.city}` : "Unknown Address"}
                    </span>
                    <Badge variant="outline" className="text-[10px] border-slate-700 font-mono">
                      {listing?.mlsNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-rose-400 font-medium capitalize">Field: {disc.field}</span>
                    <span>•</span>
                    <span className="uppercase text-slate-500 font-mono">{disc.site}</span>
                  </p>
                </div>

                <Link href={`/listings/${disc.listingId}`}>
                  <Button size="sm" variant="glass" className="text-xs">
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
