"use client";

import { Listing, Discrepancy } from "@real-estate/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface SiteSnapshotLike {
  id: string;
  listingId: string;
  site: string;
  price?: number | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  fetchedAt?: string;
}

interface FieldComparisonMatrixProps {
  listing: Listing;
  discrepancies: Discrepancy[];
  snapshots?: SiteSnapshotLike[];
}

const SITES = [
  { id: "realtor", label: "Realtor.com" },
  { id: "zillow", label: "Zillow" },
  { id: "lacdb", label: "LACDB" },
  { id: "homes", label: "Homes.com" },
  { id: "sothebysRealty", label: "Sotheby's Global" },
  { id: "crescentSothebys", label: "Crescent Sotheby's" },
];

export function FieldComparisonMatrix({ listing, discrepancies, snapshots = [] }: FieldComparisonMatrixProps) {
  const fields = [
    { key: "price", label: "List Price", sourceVal: `$${listing.price.toLocaleString()}` },
    { key: "address", label: "Property Address", sourceVal: `${listing.address.street}, ${listing.address.city}, ${listing.address.state} ${listing.address.zip}` },
    { key: "description", label: "Marketing Description", sourceVal: listing.description || "Not specified" },
    {
      key: "mapCoordinates",
      label: "Map Pin",
      sourceVal:
        listing.mapCoordinates?.lat != null && listing.mapCoordinates?.lng != null
          ? `Lat: ${listing.mapCoordinates.lat}, Lng: ${listing.mapCoordinates.lng}`
          : "Not specified",
    },
    { key: "legalDescription", label: "Legal Description", sourceVal: listing.legalDescription || "Not specified" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">Brokerage Engine Source vs Syndicated Portals</h3>
          <p className="text-xs text-muted-foreground">
            Comparing authoritative MLS records against latest scraped portal snapshots
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Synced</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-destructive" /> Mismatch</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/40" /> Not Audited</span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Field</TableHead>
            <TableHead className="w-80 bg-primary/10 text-primary font-semibold border-x border-primary/20">
              Source of Truth (MLS)
            </TableHead>
            {SITES.map((site) => {
              const snapshot = snapshots.find((s) => s.site === site.id);
              return (
                <TableHead key={site.id} className="text-center min-w-[130px]">
                  <div>{site.label}</div>
                  {snapshot ? (
                    <span className="text-[10px] text-emerald-500 font-normal">Audited</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 font-normal font-mono">No Snapshot</span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.key}>
              <TableCell className="font-semibold text-xs text-foreground">
                {field.label}
              </TableCell>

              {/* Source of Truth Column */}
              <TableCell className="bg-primary/10 border-x border-primary/20 text-xs font-mono text-primary">
                {field.sourceVal}
              </TableCell>

              {/* External Sites Columns */}
              {SITES.map((site) => {
                const snapshot = snapshots.find((s) => s.site === site.id);
                const disc = discrepancies.find(
                  (d) => d.site === site.id && d.field === field.key && (d.status === "open" || d.status === "in_progress")
                );

                // Case 1: Discrepancy Found
                if (disc) {
                  const isInProgress = disc.status === "in_progress";
                  return (
                    <TableCell
                      key={site.id}
                      className={
                        isInProgress
                          ? "bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-600 dark:text-amber-400 relative"
                          : "bg-destructive/10 border border-destructive/30 text-xs font-mono text-destructive relative"
                      }
                    >
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className={`size-3.5 ${isInProgress ? "text-amber-500" : "text-destructive"} shrink-0 mt-0.5`} />
                        <div>
                          <span className="font-semibold">{disc.siteValue}</span>
                          <div className="mt-1">
                            {isInProgress ? (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/50 bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                In Progress
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                                Mismatch
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  );
                }

                // Case 2: Portal has been audited / scraped and matches Source of Truth
                if (snapshot) {
                  return (
                    <TableCell key={site.id} className="text-xs text-muted-foreground font-mono text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5 text-emerald-500">
                        <div className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="size-3.5" />
                          <span>Synced</span>
                        </div>
                      </div>
                    </TableCell>
                  );
                }

                // Case 3: Portal has NOT been audited yet (No Apify/portal snapshot exists in DB)
                return (
                  <TableCell key={site.id} className="text-xs text-muted-foreground/60 font-mono text-center bg-muted/5">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="text-muted-foreground/40 text-sm">—</span>
                      <span className="text-[10px] text-muted-foreground/50">Not Audited</span>
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
