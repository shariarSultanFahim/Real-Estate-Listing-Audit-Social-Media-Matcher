"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, AlertTriangle, Share2, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface StatCardsProps {
  totalListings: number;
  openDiscrepancies: number;
  totalAgents: number;
}

export function StatCards({
  totalListings,
  openDiscrepancies,
  totalAgents,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Active Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Active Listings
          </CardTitle>
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Building2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground tracking-tight">{totalListings}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-medium">100% Synced</span> from Brokerage Engine
          </p>
        </CardContent>
      </Card>

      {/* Discrepancies Counter (Primary Action Card) */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Open Discrepancies
          </CardTitle>
          <div className="size-8 rounded-lg bg-destructive/20 border border-destructive/40 flex items-center justify-center text-destructive animate-pulse">
            <AlertTriangle className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive tracking-tight">{openDiscrepancies}</div>
          <Link href="/listings" className="text-xs text-destructive/80 hover:text-destructive mt-1 inline-flex items-center gap-1 group font-medium">
            Review affected listings <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </CardContent>
      </Card>

      {/* Social Cross-Post Enrolled Agents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Enrolled Agents
          </CardTitle>
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground tracking-tight">{totalAgents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across LA, MS &amp; AL offices
          </p>
        </CardContent>
      </Card>

      {/* Social Matching Tool Shortcut */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cross-Post Matcher
          </CardTitle>
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Share2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-semibold text-foreground">Instant Agent Matcher</div>
          <Link href="/social-matcher" className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1 group font-medium">
            Match listing to agents <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
