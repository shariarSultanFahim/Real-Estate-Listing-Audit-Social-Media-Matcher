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
            <TableCell colSpan={7} className="h-32 text-center text-slate-500">
              No properties matched your current filter criteria.
            </TableCell>
          </TableRow>
        ) : (
          listings.map((listing) => {
            const listingDiscrepancies = discrepancies.filter(
              (d) => d.listingId === listing.id && d.status === "open"
            );
            const agent = agents.find((a) => a.id === listing.listingAgentId);
            const affectedSites = Array.from(
              new Set(listingDiscrepancies.map((d) => d.site))
            );

            return (
              <TableRow key={listing.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-800 shrink-0 relative">
                      {listing.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.photos[0].url}
                          alt={listing.address.street}
                          className="object-cover size-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="size-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        {listing.address.street}
                      </div>
                      <div className="text-xs text-slate-400">
                        {listing.address.city}, {listing.address.state} {listing.address.zip}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-300">
                  {listing.mlsNumber}
                </TableCell>
                <TableCell className="font-semibold text-slate-100">
                  ${listing.price.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-slate-300">
                  {agent ? agent.name : "Unassigned"}
                </TableCell>
                <TableCell>
                  <ListingStatusBadge discrepancyCount={listingDiscrepancies.length} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {affectedSites.length > 0 ? (
                      affectedSites.map((site) => (
                        <Badge
                          key={site}
                          variant="outline"
                          className="text-[10px] uppercase font-mono border-rose-500/30 text-rose-400 bg-rose-500/10"
                        >
                          {site}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="glass" size="sm" className="text-xs gap-1.5">
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
