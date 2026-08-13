"use client";

import { useState } from "react";
import { useListings, useDiscrepancies, useAgents } from "@/hooks/useRealEstateApi";
import { ListingsTable } from "./components/ListingsTable";
import { FilterBar } from "./components/FilterBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";
import { RequirePermission } from "@/components/auth/RequirePermission";

export default function ListingsAuditPage() {
  const { data: listings = [], isLoading: isLoadingListings } = useListings();
  const { data: discrepancies = [], isLoading: isLoadingDiscrepancies } = useDiscrepancies();
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();

  // State default: "onlyWithIssues" per explicit client spec requirement
  const [viewMode, setViewMode] = useState<"onlyWithIssues" | "all">("onlyWithIssues");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");

  const isLoading = isLoadingListings || isLoadingDiscrepancies || isLoadingAgents;

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const listingDiscrepancies = discrepancies.filter(
      (d) => d.listingId === listing.id && d.status === "open"
    );

    // View Mode Filter
    if (viewMode === "onlyWithIssues" && listingDiscrepancies.length === 0) {
      return false;
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const agent = agents.find((a) => a.id === listing.listingAgentId);
      const matchesAddress = listing.address.street.toLowerCase().includes(q) || listing.address.city.toLowerCase().includes(q);
      const matchesMls = listing.mlsNumber.toLowerCase().includes(q);
      const matchesAgent = agent?.name.toLowerCase().includes(q);

      if (!matchesAddress && !matchesMls && !matchesAgent) return false;
    }

    // Field Filter
    if (selectedField !== "all") {
      const hasFieldIssue = listingDiscrepancies.some((d) => d.field === selectedField);
      if (!hasFieldIssue) return false;
    }

    // Site Filter
    if (selectedSite !== "all") {
      const hasSiteIssue = listingDiscrepancies.some((d) => d.site === selectedSite);
      if (!hasSiteIssue) return false;
    }

    return true;
  });

  const issuesCount = listings.filter((l) =>
    discrepancies.some((d) => d.listingId === l.id && d.status === "open")
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Primary Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Listing Audit Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Detecting mismatches between Brokerage Engine &amp; external syndication portals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main View Mode Toggle (Client requirement: Default to Issues Only) */}
          <div className="p-1 rounded-lg bg-card border border-border flex items-center gap-1">
            <Button
              variant={viewMode === "onlyWithIssues" ? "destructive" : "ghost"}
              size="sm"
              onClick={() => setViewMode("onlyWithIssues")}
              className="text-xs gap-1.5 h-8"
            >
              <AlertCircle className="size-3.5" />
              Only Issues ({issuesCount})
            </Button>
            <Button
              variant={viewMode === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="text-xs gap-1.5 h-8"
            >
              <CheckCircle className="size-3.5" />
              All Listings ({listings.length})
            </Button>
          </div>

          <RequirePermission permission="listings:create" fallback={null}>
            <Link href="/listings/new">
              <Button size="sm" className="gap-1.5 h-9">
                <Plus className="size-3.5" />
                Add Listing
              </Button>
            </Link>
          </RequirePermission>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedField={selectedField}
        onFieldChange={setSelectedField}
        selectedSite={selectedSite}
        onSiteChange={setSelectedSite}
        onReset={() => {
          setSearchQuery("");
          setSelectedField("all");
          setSelectedSite("all");
        }}
      />

      {/* Listings Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ListingsTable
          listings={filteredListings}
          discrepancies={discrepancies}
          agents={agents}
        />
      )}
    </div>
  );
}
