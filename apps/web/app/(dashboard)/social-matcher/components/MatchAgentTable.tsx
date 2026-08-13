"use client";

import { MatchResult } from "@real-estate/types";
import { MatchAgentItem } from "./MatchAgentItem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";

interface MatchAgentTableProps {
  results: MatchResult[];
  queryCity: string;
  queryPrice: number;
}

export function MatchAgentTable({ results, queryCity, queryPrice }: MatchAgentTableProps) {
  const handleCopyAll = () => {
    const text = results
      .map(
        (r) =>
          `${r.agentName} | Rationale: ${r.matchReason} | FB: ${r.facebookPageUrl || "N/A"} | IG: ${r.instagramPageUrl || "N/A"}`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    toast.success(`Copied all ${results.length} matched agent cross-posting details to clipboard!`);
  };

  return (
    <Card className="glass-panel border-slate-800 space-y-4 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Users className="size-5 text-indigo-400" />
            Matched Agents ({results.length})
          </CardTitle>
          <p className="text-xs text-slate-400 mt-0.5">
            Matching area <strong className="text-white">{queryCity}</strong> at price point{" "}
            <strong className="text-indigo-300">${queryPrice.toLocaleString()}</strong>
          </p>
        </div>

        {results.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleCopyAll} className="text-xs border-slate-800 text-slate-300">
            <Copy className="size-3.5 mr-1.5" /> Copy Entire List
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="p-8 text-center text-slate-500 space-y-2">
          <p className="text-sm font-medium">No agents matched this specific combination.</p>
          <p className="text-xs text-slate-600">
            Try adjusting the city or price filter above to see agents with matching standing preferences.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((match) => (
            <MatchAgentItem key={match.agentId} match={match} />
          ))}
        </div>
      )}
    </Card>
  );
}
