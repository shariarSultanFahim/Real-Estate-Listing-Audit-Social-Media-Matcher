"use client";

import { Listing, Discrepancy } from "@real-estate/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface PhotoComparisonGridProps {
  listing: Listing;
  discrepancies: Discrepancy[];
}

export function PhotoComparisonGrid({ listing, discrepancies }: PhotoComparisonGridProps) {
  const photoDiscrepancy = discrepancies.find(
    (d) => d.field === "photos" && d.status === "open"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Photo Sequence &amp; Order Audit</h3>
          <p className="text-xs text-slate-400">Verifying photo sequence accuracy across syndication sites</p>
        </div>
        {photoDiscrepancy ? (
          <Badge variant="destructive" className="gap-1 px-3 py-1">
            <AlertTriangle className="size-3.5" />
            Photo Order Mismatch Detected ({photoDiscrepancy.site})
          </Badge>
        ) : (
          <Badge variant="success" className="gap-1 px-3 py-1">
            <CheckCircle2 className="size-3.5" />
            Photo Order Synced Across All Sites
          </Badge>
        )}
      </div>

      {/* Grid of source photos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {listing.photos.map((photo, index) => (
          <div
            key={index}
            className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 space-y-2 relative group"
          >
            <div className="aspect-video rounded-lg overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo ${photo.order}`}
                className="object-cover size-full group-hover:scale-105 transition-transform"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-mono font-bold border border-slate-700">
                Order #{photo.order}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Source Photo {index + 1}</span>
              {photoDiscrepancy && index === 0 && (
                <span className="text-rose-400 font-semibold text-[10px]">Realtor: #2</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
