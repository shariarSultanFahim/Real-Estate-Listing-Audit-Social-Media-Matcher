"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const SYNDICATION_SITES = [
  { id: "realtor", name: "Realtor.com", status: "Active", type: "National Portal" },
  { id: "zillow", name: "Zillow Group", status: "Active", type: "National Portal" },
  { id: "homes", name: "Homes.com", status: "Active", type: "National Portal" },
  { id: "sothebysRealty", name: "Sotheby's International Realty", status: "Active", type: "Global Brand Portal" },
  { id: "crescentSothebys", name: "Crescent Sotheby's Internal Site", status: "Active", type: "Brokerage Web" },
  { id: "mansionsGlobal", name: "Mansions Global", status: "Active", type: "Luxury Syndicate" },
  { id: "google", name: "Google Business / Maps", status: "Active", type: "Search Engine" },
];

export default function SettingsPage() {
  const [enabledSites, setEnabledSites] = useState<Record<string, boolean>>({
    realtor: true,
    zillow: true,
    homes: true,
    sothebysRealty: true,
    crescentSothebys: true,
    mansionsGlobal: true,
    google: true,
  });

  const toggleSite = (id: string) => {
    setEnabledSites((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      toast.info(`Syndication monitoring for ${id} ${updated[id] ? "enabled" : "disabled"}`);
      return updated;
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Syndication Settings &amp; Portal Controls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Toggle active syndication endpoints monitored by the discrepancy detection engine.
        </p>
      </div>

      <Card className="glass-panel border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Globe className="size-5 text-indigo-400" />
              Monitored Syndication Outlets (7 Portals)
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Read-only scraper engines inspect these platforms for listing data drift.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Refreshed all syndication portal connections!")}
            className="text-xs border-slate-800"
          >
            <RefreshCcw className="size-3.5 mr-1.5" /> Test Connections
          </Button>
        </div>

        <div className="space-y-3">
          {SYNDICATION_SITES.map((site) => {
            const isEnabled = enabledSites[site.id];
            return (
              <div
                key={site.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{site.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-slate-700">
                      {site.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-400" /> Read-only API / Scraping Active
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={isEnabled ? "default" : "outline"}
                  onClick={() => toggleSite(site.id)}
                  className={`text-xs ${isEnabled ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-slate-800 text-slate-400"}`}
                >
                  {isEnabled ? "Monitoring Active" : "Disabled"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
