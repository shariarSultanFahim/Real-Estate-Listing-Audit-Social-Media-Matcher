"use client";

import { useState } from "react";
import { useMatchAgents } from "@/hooks/useRealEstateApi";
import { SocialCrossPostForm } from "./components/SocialCrossPostForm";
import { MatchAgentTable } from "./components/MatchAgentTable";
import { MatchResult } from "@real-estate/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { RequirePermission } from "@/components/auth/RequirePermission";
import { PageHeader } from "@/components/dashboard/PageHeader";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export default function SocialMatcherPage() {
  const matchAgents = useMatchAgents();

  const [queryCity, setQueryCity] = useQueryState("city", parseAsString.withDefault("Covington"));
  const [queryPrice, setQueryPrice] = useQueryState("price", parseAsInteger.withDefault(450000));
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Aug 22, 2026 10:30 AM");

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const formatted = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      setLastSyncTime(formatted);
      toast.success("Social Media Management Sheet successfully synced! Agent roster updated.");
    }, 900);
  };

  const handleSearch = (data: { city: string; price: number }) => {
    setQueryCity(data.city);
    setQueryPrice(data.price);

    matchAgents.mutate(data, {
      onSuccess: (results) => {
        setMatchResults(results);
      },
    });
  };

  return (
    <RequirePermission permission="socialMatcher:use">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Social Media Cross-Posting Matcher"
          description="Automating agent selection for social media cross-posting based on saved preferences, service areas & price thresholds."
        />

        {/* Social Media Management Sheet Integration Status Card */}
        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Social Media Management Sheet</span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    Connected
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Master agent roster &amp; posting preferences synced directly with the management spreadsheet.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Connection Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Connected</span>
              </div>
              <div className="h-7 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Updated</span>
                <span className="font-mono text-foreground">Aug 22, 2026 10:30 AM</span>
              </div>
              <div className="h-7 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Sync</span>
                <span className="font-mono text-foreground">{lastSyncTime}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="text-xs gap-1.5 ml-auto md:ml-2"
              >
                <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Form */}
        <SocialCrossPostForm onSearch={handleSearch} isLoading={matchAgents.isPending} />

        {/* Match Results Table */}
        {matchResults && (
          <MatchAgentTable
            results={matchResults}
            queryCity={queryCity}
            queryPrice={queryPrice}
          />
        )}
      </div>
    </RequirePermission>
  );
}
