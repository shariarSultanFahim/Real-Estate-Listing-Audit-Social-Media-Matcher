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
    <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-accent transition-colors">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-card-foreground">{match.agentName}</span>
          <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-primary">
            Matched
          </Badge>
        </div>

        {/* Explainable Match Reason (Explicit requirement in spec) */}
        <p className="text-xs text-foreground flex items-center gap-1.5">
          <span className="text-primary font-semibold">Match Rationale:</span>
          <span>{match.matchReason}</span>
        </p>

        {/* Social Media Handles Links */}
        <div className="flex items-center gap-4 text-xs pt-1">
          {match.facebookPageUrl ? (
            <a
              href={match.facebookPageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Facebook className="size-3.5 text-primary" />
              <span>Facebook Page</span>
            </a>
          ) : (
            <span className="text-muted-foreground/60 text-[11px]">No FB Page</span>
          )}

          {match.instagramPageUrl ? (
            <a
              href={match.instagramPageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Instagram className="size-3.5 text-primary" />
              <span>Instagram Profile</span>
            </a>
          ) : (
            <span className="text-muted-foreground/60 text-[11px]">No IG Handle</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
          <Copy className="size-3.5 mr-1" /> Copy Details
        </Button>
        <Button
          size="sm"
          variant={isPosted ? "secondary" : "default"}
          onClick={() => {
            setIsPosted(!isPosted);
            toast.success(isPosted ? "Marked as pending" : `Marked cross-post sent for ${match.agentName}`);
          }}
          className="text-xs"
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
