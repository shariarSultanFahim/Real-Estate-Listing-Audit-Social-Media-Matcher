"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Discrepancy } from "@real-estate/types";

interface DiscrepancyBreakdownProps {
  discrepancies: Discrepancy[];
}

export function DiscrepancyBreakdown({ discrepancies }: DiscrepancyBreakdownProps) {
  const openDiscrepancies = discrepancies.filter((d) => d.status === "open");

  const byField = openDiscrepancies.reduce((acc, curr) => {
    acc[curr.field] = (acc[curr.field] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySite = openDiscrepancies.reduce((acc, curr) => {
    acc[curr.site] = (acc[curr.site] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Breakdown by Field */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">Discrepancies by Field Type</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Fields where syndicated data deviates from Brokerage Engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(byField).map(([field, count]) => {
            const percentage = Math.round((count / (openDiscrepancies.length || 1)) * 100);
            return (
              <div key={field} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground capitalize">{field}</span>
                  <span className="font-mono text-muted-foreground">{count} issues ({percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Breakdown by Syndication Site */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-card-foreground">Discrepancies by Syndication Portal</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            External sites flagged for inaccurate photo order, pricing, or details
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2.5 pt-2">
          {Object.entries(bySite).map(([site, count]) => (
            <Badge
              key={site}
              variant="destructive"
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <span>{site}</span>
              <span className="size-5 rounded-full bg-destructive-foreground/20 text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {count}
              </span>
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
