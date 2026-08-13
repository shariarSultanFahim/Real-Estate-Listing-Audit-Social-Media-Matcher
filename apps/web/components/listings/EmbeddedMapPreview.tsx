"use client";

import { MapPin } from "lucide-react";

interface EmbeddedMapPreviewProps {
  address: string;
  city: string;
  state: string;
}

export function EmbeddedMapPreview({ address, city, state }: EmbeddedMapPreviewProps) {
  return (
    <div className="h-44 w-full rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center group">
      {/* Simulated Map Grid Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 space-y-2">
        <div className="mx-auto size-10 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-bounce">
          <MapPin className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{address || "Selected Location"}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            {city}, {state} (Coordinates: 30.4755, -90.1009)
          </p>
        </div>
      </div>

      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-slate-400 border border-slate-800">
        Google Places Stub • Map Preview
      </span>
    </div>
  );
}
