"use client";

import { use, useState } from "react";
import { useListing, useDiscrepancies, useAgents } from "@/hooks/useRealEstateApi";
import { FieldComparisonMatrix } from "../components/FieldComparisonMatrix";
import { PhotoComparisonGrid } from "../components/PhotoComparisonGrid";
import { DiscrepancyActionModal } from "../components/DiscrepancyActionModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Discrepancy } from "@real-estate/types";
import { ArrowLeft, Edit3, ShieldAlert, CheckCircle2, User, MapPin, Building } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function ListingDetailAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: listing, isLoading: isLoadingListing } = useListing(id);
  const { data: discrepancies = [], isLoading: isLoadingDiscrepancies } = useDiscrepancies(id);
  const { data: agents = [] } = useAgents();

  const [activeModalDiscrepancy, setActiveModalDiscrepancy] = useState<Discrepancy | null>(null);
  const [selectedDiscrepancyTab, setSelectedDiscrepancyTab] = useState<"active" | "history">("active");

  if (isLoadingListing || isLoadingDiscrepancies) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (!listing) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">Listing Not Found</h2>
        <Link href="/listings">
          <Button variant="outline">Return to Listings Audit</Button>
        </Link>
      </div>
    );
  }

  const agent = agents.find((a) => a.id === listing.listingAgentId);
  const activeDiscrepancies = discrepancies.filter((d) => d.status === "open" || d.status === "in_progress");
  const resolvedDiscrepancies = discrepancies.filter((d) => d.status === "resolved" || d.status === "ignored");

  return (
    <div className="space-y-8">
      {/* Top Header & Navigation */}
      <PageHeader
        showBackButton
        backHref="/listings"
        title={
          <div className="flex items-center gap-3">
            <span>{listing.address.street}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {listing.mlsNumber}
            </Badge>
          </div>
        }
        description={
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5 text-muted-foreground" />
            {listing.address.city}, {listing.address.state} {listing.address.zip}
          </span>
        }
        actions={
          <Link href={`/listings/${id}/edit`}>
            <Button variant="outline" className="text-xs gap-1.5">
              <Edit3 className="size-3.5" /> Edit Listing Essentials
            </Button>
          </Link>
        }
      />

      {/* Property Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Source Price & Specs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              List Price &amp; Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              ${listing.price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <span>{listing.beds} Beds</span>
              <span>•</span>
              <span>{listing.fullBaths} Baths</span>
              <span>•</span>
              <span>{listing.buildingAreaSqft?.toLocaleString() || "N/A"} Sq Ft</span>
            </div>
          </CardContent>
        </Card>

        {/* Listing Agent Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Listing Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <User className="size-4 text-primary" />
              {agent ? agent.name : "Unassigned"}
            </div>
            <p className="text-xs text-muted-foreground">{agent?.email}</p>
            <p className="text-xs text-muted-foreground/80 font-mono">Office: {agent?.officeState}</p>
          </CardContent>
        </Card>

        {/* Discrepancy Status Summary Card */}
        <Card className={activeDiscrepancies.length > 0 ? "border-destructive/30 bg-destructive/5" : "border-emerald-500/30 bg-emerald-500/5"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Audit Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeDiscrepancies.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                  <ShieldAlert className="size-6 text-destructive" />
                  {activeDiscrepancies.length} Active {activeDiscrepancies.length === 1 ? "Issue" : "Issues"}
                </div>
                <p className="text-xs text-destructive/80">
                  {discrepancies.filter(d => d.status === "open").length} open, {discrepancies.filter(d => d.status === "in_progress").length} in progress.
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="size-6 text-emerald-500" />
                  All Active Issues Clean
                </div>
                <p className="text-xs text-emerald-500/80">
                  {resolvedDiscrepancies.length > 0
                    ? `${resolvedDiscrepancies.length} historical discrepancies resolved.`
                    : "All external sites match Brokerage Engine specifications."}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Action List with Active vs Resolved/History Switcher */}
      <Card className="border-border">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-card-foreground">Audit Discrepancies &amp; Resolution History</CardTitle>
              <p className="text-xs text-muted-foreground">
                Track active syndication issues and inspect historical resolution actions
              </p>
            </div>

            {/* Tab Pill Selector */}
            <div className="p-1 rounded-lg bg-muted border border-border flex items-center gap-1">
              <Button
                variant={selectedDiscrepancyTab === "active" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedDiscrepancyTab("active")}
                className="text-xs h-7 px-3 gap-1.5"
              >
                <span>Active Discrepancies</span>
                <Badge variant={activeDiscrepancies.length > 0 ? "destructive" : "secondary"} className="text-[10px] px-1 py-0 h-4">
                  {activeDiscrepancies.length}
                </Badge>
              </Button>
              <Button
                variant={selectedDiscrepancyTab === "history" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedDiscrepancyTab("history")}
                className="text-xs h-7 px-3 gap-1.5"
              >
                <span>Resolved History</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-background">
                  {resolvedDiscrepancies.length}
                </Badge>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          {selectedDiscrepancyTab === "active" ? (
            activeDiscrepancies.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-medium text-foreground">No active discrepancies</p>
                <p className="text-xs text-muted-foreground">
                  All syndication portals currently match Brokerage Engine. Resolved items can be viewed in the History tab.
                </p>
              </div>
            ) : (
              activeDiscrepancies.map((disc) => {
                const isInProgress = disc.status === "in_progress";
                return (
                  <div
                    key={disc.id}
                    className="p-4 rounded-lg bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isInProgress ? "outline" : "destructive"}
                          className={isInProgress ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-mono" : "uppercase font-mono text-[10px]"}
                        >
                          {disc.site}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={isInProgress ? "border-amber-500/50 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px]" : "border-destructive/30 bg-destructive/10 text-destructive text-[10px]"}
                        >
                          {isInProgress ? "In Progress" : "Open"}
                        </Badge>
                        <span className="font-semibold text-sm text-card-foreground capitalize">
                          Field: {disc.field}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-4 font-mono">
                        <span>Source: <strong className="text-primary">{disc.sourceValue}</strong></span>
                        <span>Site: <strong className={isInProgress ? "text-amber-600 dark:text-amber-400" : "text-destructive"}>{disc.siteValue}</strong></span>
                      </div>
                      {disc.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Latest Note: &ldquo;{disc.note}&rdquo;
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveModalDiscrepancy(disc)}
                      className="text-xs shrink-0"
                    >
                      Action / Update Note
                    </Button>
                  </div>
                );
              })
            )
          ) : (
            /* Resolved / Discrepancy History Tab */
            resolvedDiscrepancies.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <p className="text-sm font-medium">No historical discrepancies recorded yet.</p>
                <p className="text-xs">Resolved issues and notes will appear here for audit trail compliance.</p>
              </div>
            ) : (
              resolvedDiscrepancies.map((disc) => (
                <div
                  key={disc.id}
                  className="p-4 rounded-lg bg-card/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-accent transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {disc.site}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Resolved
                      </Badge>
                      <span className="font-medium text-sm text-card-foreground capitalize">
                        Field: {disc.field}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-4 font-mono">
                      <span>Source: <strong className="text-foreground">{disc.sourceValue}</strong></span>
                      <span>Resolved Site Value: <strong className="text-emerald-600 dark:text-emerald-400">{disc.siteValue}</strong></span>
                    </div>
                    {disc.note && (
                      <p className="text-xs text-muted-foreground italic">
                        Resolution Note: &ldquo;{disc.note}&rdquo;
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModalDiscrepancy(disc)}
                    className="text-xs shrink-0 gap-1.5"
                  >
                    View History &amp; Notes
                  </Button>
                </div>
              ))
            )
          )}
        </CardContent>
      </Card>

      {/* Main Field Matrix Comparison */}
      <FieldComparisonMatrix listing={listing} discrepancies={discrepancies} />

      {/* Photo Order & Sequence Audit */}
      <PhotoComparisonGrid listing={listing} discrepancies={discrepancies} />

      {/* Action Modal */}
      {activeModalDiscrepancy && (
        <DiscrepancyActionModal
          discrepancy={activeModalDiscrepancy}
          onClose={() => setActiveModalDiscrepancy(null)}
        />
      )}
    </div>
  );
}
