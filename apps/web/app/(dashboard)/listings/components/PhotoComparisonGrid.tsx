"use client";

import { useState } from "react";
import { Listing, Discrepancy } from "@real-estate/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Check, Eye, RefreshCw, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

interface PhotoComparisonGridProps {
  listing: Listing;
  discrepancies: Discrepancy[];
}

export function PhotoComparisonGrid({ listing, discrepancies }: PhotoComparisonGridProps) {
  const photoDiscrepancy = discrepancies.find(
    (d) => d.field === "photos" && (d.status === "open" || d.status === "in_progress")
  );

  const [isApproved, setIsApproved] = useState(false);
  const [showNewDetected, setShowNewDetected] = useState(false);
  const [showDetailComparison, setShowDetailComparison] = useState(true);

  const handleApprove = () => {
    setIsApproved(true);
    setShowNewDetected(false);
    toast.success("Photo arrangement approved as baseline! It will no longer flag as an active discrepancy.");
  };

  const handleSimulateNew = () => {
    setIsApproved(false);
    setShowNewDetected(true);
    toast.info("Simulated detection of a new external photo arrangement.");
  };

  // Reordered array for portal arrangement preview
  const portalPhotos = listing.photos.length >= 2
    ? [listing.photos[1], listing.photos[0], ...listing.photos.slice(2)]
    : listing.photos;

  const siteName = photoDiscrepancy?.site ? photoDiscrepancy.site.toUpperCase() : "REALTOR.COM";

  return (
    <div className="space-y-4">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Photo Sequence &amp; Arrangement Audit</h3>
          <p className="text-xs text-muted-foreground">
            Verifying photo arrangements between MLS and external syndication portals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <Badge variant="outline" className="gap-1 px-3 py-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Approved Baseline
            </Badge>
          ) : showNewDetected ? (
            <Badge variant="outline" className="gap-1 px-3 py-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-3.5 text-amber-500" />
              New Photo Arrangement Detected ({siteName})
            </Badge>
          ) : photoDiscrepancy ? (
            <Badge variant="outline" className="gap-1 px-3 py-1 border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <ArrowRightLeft className="size-3.5 text-sky-500" />
              Photo Order Difference Detected ({siteName})
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 px-3 py-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Photo Order Synced Across All Sites
            </Badge>
          )}
        </div>
      </div>

      {/* Discrepancy Review / Approval Banner */}
      {(photoDiscrepancy || showNewDetected) && !isApproved && (
        <Card className="border-sky-500/30 bg-sky-500/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {showNewDetected ? "New Photo Arrangement Detected" : "Photo Order Difference Detected"}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {siteName}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Photo order can intentionally differ between MLS feeds and external portals. Review the portal&apos;s arrangement below and approve it if intended.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailComparison(!showDetailComparison)}
                  className="text-xs gap-1.5"
                >
                  <Eye className="size-3.5" />
                  {showDetailComparison ? "Hide Comparison" : "Review Comparison"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="size-3.5" />
                  Approve Photo Arrangement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Baseline Confirmation Banner */}
      {isApproved && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>Approved Photo Arrangement</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Approved
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  This arrangement has been approved and is being used as the baseline. It will not appear as an active discrepancy unless a new photo arrangement is detected.
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSimulateNew}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1"
            >
              <RefreshCw className="size-3" />
              Simulate New External Drift
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Side-by-Side Photo Comparison when reviewing difference */}
      {(photoDiscrepancy || showNewDetected) && showDetailComparison && !isApproved ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* MLS Source Arrangement */}
          <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                MLS / Brokerage Engine Arrangement
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">Source of Truth</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {listing.photos.map((photo, index) => (
                <div key={index} className="rounded-lg bg-muted/40 border border-border p-2 space-y-1.5 relative group">
                  <div className="aspect-video rounded overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`MLS Photo ${photo.order}`}
                      className="object-cover size-full group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-md text-foreground text-[9px] font-mono font-bold border border-border">
                      Position #{photo.order}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Photo {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* External Portal Arrangement */}
          <div className="space-y-3 p-4 rounded-xl bg-card border border-sky-500/30 bg-sky-500/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="size-2 rounded-full bg-sky-500" />
                External Portal Arrangement ({siteName})
              </span>
              <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Pending Review</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {portalPhotos.map((photo, index) => (
                <div key={index} className="rounded-lg bg-muted/40 border border-border p-2 space-y-1.5 relative group">
                  <div className="aspect-video rounded overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`Portal Photo ${index + 1}`}
                      className="object-cover size-full group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-md text-foreground text-[9px] font-mono font-bold border border-border">
                      Portal #{index + 1}
                    </span>
                    {photo.order !== index + 1 && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-sky-500/90 text-white text-[9px] font-mono font-bold">
                        MLS #{photo.order}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Position {index + 1}</span>
                    {photo.order !== index + 1 && (
                      <span className="text-sky-600 dark:text-sky-400 font-medium text-[9px]">Custom Order</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Single Grid of Baseline Photos */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {listing.photos.map((photo, index) => (
            <div
              key={index}
              className="rounded-xl bg-card border border-border p-2.5 space-y-2 relative group"
            >
              <div className="aspect-video rounded-lg overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Photo ${photo.order}`}
                  className="object-cover size-full group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-background/80 backdrop-blur-md text-foreground text-[10px] font-mono font-bold border border-border">
                  Order #{photo.order}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Baseline Photo {index + 1}</span>
                <span className="text-emerald-500 font-medium text-[10px] flex items-center gap-0.5">
                  <Check className="size-3" /> Synced
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

