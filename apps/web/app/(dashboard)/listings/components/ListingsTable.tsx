"use client";

import Link from "next/link";
import { Listing, Discrepancy, Agent } from "@real-estate/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingStatusBadge } from "./ListingStatusBadge";
import { ExternalLink, Eye, Image as ImageIcon } from "lucide-react";

interface ListingsTableProps {
  listings: Listing[];
  discrepancies: Discrepancy[];
  agents: Agent[];
}

export function ListingsTable({
  listings,
  discrepancies,
  agents,
}: ListingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property &amp; Location</TableHead>
          <TableHead>MLS #</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Listing Agent</TableHead>
          <TableHead>Audit Status</TableHead>
          <TableHead>Affected Sites</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
              No properties matched your current filter criteria.
            </TableCell>
          </TableRow>
        ) : (
          listings.map((listing) => {
            const activeDiscrepancies = discrepancies.filter(
              (d) => d.listingId === listing.id && (d.status === "open" || d.status === "in_progress")
            );
            const openDiscrepancies = discrepancies.filter(
              (d) => d.listingId === listing.id && d.status === "open"
            );
            const inProgressDiscrepancies = discrepancies.filter(
              (d) => d.listingId === listing.id && d.status === "in_progress"
            );
            const agent = agents.find((a) => a.id === listing.listingAgentId);
            const affectedSites = Array.from(
              new Set(activeDiscrepancies.map((d) => d.site))
            );

            return (
              <TableRow key={listing.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-card overflow-hidden border border-border shrink-0 relative">
                      {listing.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.photos[0].url}
                          alt={listing.address.street}
                          className="object-cover size-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="size-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-card-foreground">
                        {listing.address.street}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {listing.address.city}, {listing.address.state} {listing.address.zip}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {listing.mlsNumber}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  ${listing.price.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {agent ? agent.name : "Unassigned"}
                </TableCell>
                <TableCell>
                  <ListingStatusBadge
                    openCount={openDiscrepancies.length}
                    inProgressCount={inProgressDiscrepancies.length}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {affectedSites.length > 0 ? (
                      affectedSites.map((site) => {
                        const siteDiscs = activeDiscrepancies.filter((d) => d.site === site);
                        const allInProgress = siteDiscs.every((d) => d.status === "in_progress");
                        return (
                          <Badge
                            key={site}
                            variant={allInProgress ? "outline" : "destructive"}
                            className={
                              allInProgress
                                ? "text-[10px] uppercase font-mono border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "text-[10px] uppercase font-mono"
                            }
                          >
                            {site}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <Eye className="size-3.5" />
                      Inspect
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
