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
      <Card className="glass-panel glass-panel-hover border-slate-800/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Active Listings
          </CardTitle>
          <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white tracking-tight">{totalListings}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">100% Synced</span> from Brokerage Engine
          </p>
        </CardContent>
      </Card>

      {/* Discrepancies Counter (Primary Action Card) */}
      <Card className="glass-panel glass-panel-hover border-rose-500/30 bg-rose-950/10 glow-border-rose">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Open Discrepancies
          </CardTitle>
          <div className="size-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
            <AlertTriangle className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-400 tracking-tight">{openDiscrepancies}</div>
          <Link href="/listings" className="text-xs text-rose-300/80 hover:text-rose-200 mt-1 inline-flex items-center gap-1 group font-medium">
            Review affected listings <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </CardContent>
      </Card>

      {/* Social Cross-Post Enrolled Agents */}
      <Card className="glass-panel glass-panel-hover border-slate-800/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Enrolled Agents
          </CardTitle>
          <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white tracking-tight">{totalAgents}</div>
          <p className="text-xs text-slate-400 mt-1">
            Across LA, MS &amp; AL offices
          </p>
        </CardContent>
      </Card>

      {/* Social Matching Tool Shortcut */}
      <Card className="glass-panel glass-panel-hover border-slate-800/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cross-Post Matcher
          </CardTitle>
          <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Share2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-semibold text-white">Instant Agent Matcher</div>
          <Link href="/social-matcher" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-1 group font-medium">
            Match listing to agents <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
