"use client";

import { useState } from "react";
import { useListings, useAgents } from "@/hooks/useRealEstateApi";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ListingImage } from "@/components/common/ListingImage";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileCheck2,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function OfflineListingsPage() {
  const { data: listings = [], isLoading: isLoadingListings } = useListings();
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "sold" | "withdrawn">("all");

  const isLoading = isLoadingListings || isLoadingAgents;

  // Filter only closed (sold) and withdrawn/expired listings
  const offlineListings = listings.filter(
    (l) => l.status === "sold" || l.status === "withdrawn"
  );

  const soldCount = offlineListings.filter((l) => l.status === "sold").length;
  const withdrawnCount = offlineListings.filter((l) => l.status === "withdrawn").length;
  const activeCount = listings.filter((l) => l.status !== "sold" && l.status !== "withdrawn").length;

  const filteredListings = offlineListings.filter((listing) => {
    // Status filter
    if (statusFilter !== "all" && listing.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const agent = agents.find((a) => a.id === listing.listingAgentId);
      const coAgent = listing.coListingAgentId ? agents.find((a) => a.id === listing.coListingAgentId) : null;
      const matchesAddress =
        listing.address.street.toLowerCase().includes(q) ||
        listing.address.city.toLowerCase().includes(q) ||
        listing.address.zip.toLowerCase().includes(q);
      const matchesMls = listing.mlsNumber.toLowerCase().includes(q);
      const matchesAgent =
        agent?.name.toLowerCase().includes(q) ||
        (coAgent?.name ? coAgent.name.toLowerCase().includes(q) : false);

      if (!matchesAddress && !matchesMls && !matchesAgent) return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        showBackButton
        backHref="/listings"
        title="Offline Listings Archive"
        description="Closed, Expired, and Withdrawn listings. These records are archived for historical reference and excluded from automated portal syndication audits."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/listings">
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
                <ArrowLeft className="size-3.5" />
                Back to Active Listings ({activeCount})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Info & Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Total Offline Listings
              </span>
              <span className="text-2xl font-bold text-foreground">{offlineListings.length}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Excluded from syndication audit</p>
            </div>
            <div className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <Archive className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Closed / Sold
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {soldCount}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Completed real estate transactions</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Withdrawn / Expired
              </span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {withdrawnCount}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">Off-market or expired listings</p>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <XCircle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="size-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              type="text"
              placeholder="Search offline listings by address, city, MLS #, agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-muted rounded-lg border border-border">
            <Button
              variant={statusFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-xs h-7 px-3"
            >
              All Offline ({offlineListings.length})
            </Button>
            <Button
              variant={statusFilter === "sold" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("sold")}
              className="text-xs h-7 px-3"
            >
              Closed / Sold ({soldCount})
            </Button>
            <Button
              variant={statusFilter === "withdrawn" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter("withdrawn")}
              className="text-xs h-7 px-3"
            >
              Withdrawn / Expired ({withdrawnCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Listings Table */}
      <Card className="border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property &amp; Location</TableHead>
              <TableHead>MLS #</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Listing Agent(s)</TableHead>
              <TableHead>Archive Status</TableHead>
              <TableHead>Audit Eligibility</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No offline properties matched your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredListings.map((listing) => {
                const agent = agents.find((a) => a.id === listing.listingAgentId);
                const coAgent = listing.coListingAgentId
                  ? agents.find((a) => a.id === listing.coListingAgentId)
                  : null;

                const isSold = listing.status === "sold";

                return (
                  <TableRow key={listing.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                          {listing.photos && listing.photos.length > 0 ? (
                            <ListingImage
                              src={listing.photos[0].url}
                              alt={listing.address.street}
                              className="object-cover size-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
                              No Photo
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="font-semibold text-sm hover:underline text-foreground block"
                          >
                            {listing.address.street}
                          </Link>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3" />
                            {listing.address.city}, {listing.address.state} {listing.address.zip}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs font-semibold">
                        {listing.mlsNumber}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-semibold text-xs">
                      ${listing.price.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <User className="size-3 text-muted-foreground" />
                          {agent ? agent.name : "Unassigned"}
                        </div>
                        {coAgent && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span className="text-[9px] uppercase font-mono px-1 rounded bg-muted">Co</span>
                            {coAgent.name}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {isSold ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          Closed / Sold
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold"
                        >
                          Withdrawn / Expired
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-muted-foreground/80" />
                        <span className="text-[11px]">Excluded from Audit</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/listings/${listing.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                          <Eye className="size-3.5" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
