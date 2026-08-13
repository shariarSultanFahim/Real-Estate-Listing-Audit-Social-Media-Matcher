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
  const openDiscrepancies = discrepancies.filter((d) => d.status === "open");

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
        <Card className={openDiscrepancies.length > 0 ? "border-destructive/30 bg-destructive/5" : "border-emerald-500/30 bg-emerald-500/5"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Audit Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openDiscrepancies.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                  <ShieldAlert className="size-6 text-destructive" />
                  {openDiscrepancies.length} Open Mismatches
                </div>
                <p className="text-xs text-destructive/80">
                  Action required: verify external syndication site data against Brokerage Engine.
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="size-6 text-emerald-500" />
                  100% Synced
                </div>
                <p className="text-xs text-emerald-500/80">
                  All external sites match Brokerage Engine specifications.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discrepancies Action List (If any exist) */}
      {openDiscrepancies.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-card-foreground">Pending Actionable Discrepancies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openDiscrepancies.map((disc) => (
              <div
                key={disc.id}
                className="p-4 rounded-lg bg-card border border-border flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="uppercase font-mono text-[10px]">
                      {disc.site}
                    </Badge>
                    <span className="font-semibold text-sm text-card-foreground capitalize">
                      Field: {disc.field}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-4 font-mono">
                    <span>Source: <strong className="text-primary">{disc.sourceValue}</strong></span>
                    <span>Site: <strong className="text-destructive">{disc.siteValue}</strong></span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveModalDiscrepancy(disc)}
                  className="text-xs shrink-0"
                >
                  Resolve / Action
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
