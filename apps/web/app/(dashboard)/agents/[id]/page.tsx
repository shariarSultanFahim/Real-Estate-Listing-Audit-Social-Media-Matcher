"use client";

import { use } from "react";
import { useAgents, useListings } from "@/hooks/useRealEstateApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Facebook, Instagram, Building2, MapPin } from "lucide-react";
import Link from "next/link";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents();
  const { data: listings = [], isLoading: isLoadingListings } = useListings();

  if (isLoadingAgents || isLoadingListings) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    return <div className="p-8 text-center text-rose-400">Agent not found</div>;
  }

  // Filter listings assigned to or matched by this agent
  const agentListings = listings.filter((l) => l.listingAgentId === agent.id);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <Link href="/agents" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="size-3.5" /> Back to Agent Directory
        </Link>
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-slate-800 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xl font-bold">
            {agent.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
            <p className="text-xs text-slate-400">{agent.email} • Phone: {agent.phone || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Preferences Summary Card */}
      <Card className="glass-panel border-slate-800 p-6 space-y-4">
        <CardTitle className="text-base text-white">Standing Cross-Posting Profile</CardTitle>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Office State:</span>
            <div className="font-semibold text-slate-200 mt-1">{agent.officeState} Office</div>
          </div>
          <div>
            <span className="text-slate-400">Preference Mode:</span>
            <div className="font-semibold text-indigo-300 capitalize mt-1">
              {agent.crossPostPreference}
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Service Areas Covered:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {agent.serviceAreas.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Historical Listing Matches */}
      <Card className="glass-panel border-slate-800 p-6 space-y-4">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Building2 className="size-5 text-indigo-400" />
          Active Agent Listings ({agentListings.length})
        </CardTitle>

        <div className="space-y-3">
          {agentListings.map((listing) => (
            <div key={listing.id} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{listing.address.street}</p>
                <p className="text-xs text-slate-400">{listing.address.city}, {listing.address.state}</p>
              </div>
              <span className="font-mono text-xs text-indigo-300 font-bold">
                ${listing.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
