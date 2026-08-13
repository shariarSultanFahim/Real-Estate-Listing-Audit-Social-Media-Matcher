"use client";

import { MatchResult } from "@real-estate/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Copy, CheckCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MatchAgentItemProps {
  match: MatchResult;
}

export function MatchAgentItem({ match }: MatchAgentItemProps) {
  const [isPosted, setIsPosted] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${match.agentName} - FB: ${match.facebookPageUrl || "N/A"} | IG: ${match.instagramPageUrl || "N/A"}`);
    toast.success(`Copied cross-posting info for ${match.agentName}`);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-white">{match.agentName}</span>
          <Badge variant="outline" className="text-[10px] bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
            Matched
          </Badge>
        </div>

        {/* Explainable Match Reason (Explicit requirement in spec) */}
        <p className="text-xs text-slate-300 flex items-center gap-1.5">
          <span className="text-indigo-400 font-semibold">Match Rationale:</span>
          <span>{match.matchReason}</span>
        </p>

        {/* Social Media Handles Links */}
        <div className="flex items-center gap-4 text-xs pt-1">
          {match.facebookPageUrl ? (
            <a
              href={match.facebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <Facebook className="size-3.5 text-blue-500" />
              <span>Facebook Page</span>
            </a>
          ) : (
            <span className="text-slate-600 text-[11px]">No FB Page</span>
          )}

          {match.instagramPageUrl ? (
            <a
              href={match.instagramPageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-pink-400 flex items-center gap-1 transition-colors"
            >
              <Instagram className="size-3.5 text-pink-500" />
              <span>Instagram Profile</span>
            </a>
          ) : (
            <span className="text-slate-600 text-[11px]">No IG Handle</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs border-slate-800 text-slate-300">
          <Copy className="size-3.5 mr-1" /> Copy Details
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setIsPosted(!isPosted);
            toast.success(isPosted ? "Marked as pending" : `Marked cross-post sent for ${match.agentName}`);
          }}
          className={isPosted ? "bg-emerald-600 hover:bg-emerald-500 text-white text-xs" : "bg-indigo-600 hover:bg-indigo-500 text-white text-xs"}
        >
          {isPosted ? (
            <>
              <CheckCircle className="size-3.5 mr-1" /> Posted
            </>
          ) : (
            <>
              <Share2 className="size-3.5 mr-1" /> Mark Posted
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
