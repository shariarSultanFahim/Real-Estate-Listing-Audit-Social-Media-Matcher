"use client";

import { Listing, Discrepancy } from "@real-estate/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FieldComparisonMatrixProps {
  listing: Listing;
  discrepancies: Discrepancy[];
}

const SITES = [
  { id: "realtor", label: "Realtor.com" },
  { id: "zillow", label: "Zillow" },
  { id: "homes", label: "Homes.com" },
  { id: "sothebysRealty", label: "Sotheby's Global" },
  { id: "crescentSothebys", label: "Crescent Sotheby's" },
];

export function FieldComparisonMatrix({ listing, discrepancies }: FieldComparisonMatrixProps) {
  const fields = [
    { key: "price", label: "List Price", sourceVal: `$${listing.price.toLocaleString()}` },
    { key: "address", label: "Property Address", sourceVal: `${listing.address.street}, ${listing.address.city}, ${listing.address.state} ${listing.address.zip}` },
    { key: "description", label: "Marketing Description", sourceVal: listing.description },
    { key: "mapCoordinates", label: "Map Pin", sourceVal: `Lat: ${listing.mapCoordinates.lat}, Lng: ${listing.mapCoordinates.lng}` },
    { key: "legalDescription", label: "Legal Description", sourceVal: listing.legalDescription },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Brokerage Engine Source vs Syndicated Portals</h3>
        <span className="text-xs text-slate-400">Highlighted cells indicate detected discrepancies</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Field</TableHead>
            <TableHead className="w-80 bg-indigo-950/20 text-indigo-300 font-semibold border-x border-indigo-500/20">
              Source of Truth (Brokerage Engine)
            </TableHead>
            {SITES.map((site) => (
              <TableHead key={site.id} className="text-center">
                {site.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.key}>
              <TableCell className="font-semibold text-xs text-slate-300">
                {field.label}
              </TableCell>

              {/* Source of Truth Column */}
              <TableCell className="bg-indigo-950/20 border-x border-indigo-500/20 text-xs font-mono text-indigo-200">
                {field.sourceVal}
              </TableCell>

              {/* External Sites Columns */}
              {SITES.map((site) => {
                const disc = discrepancies.find(
                  (d) => d.site === site.id && d.field === field.key && d.status === "open"
                );

                if (disc) {
                  return (
                    <TableCell
                      key={site.id}
                      className="bg-rose-950/30 border border-rose-500/40 text-xs font-mono text-rose-300 relative"
                    >
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span>{disc.siteValue}</span>
                          <div className="mt-1">
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                              Mismatch
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={site.id} className="text-xs text-slate-400 font-mono text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Synced</span>
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
