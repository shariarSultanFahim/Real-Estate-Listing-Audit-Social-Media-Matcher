"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Check } from "lucide-react";

interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  zip: string;
}

const MOCK_ADDRESS_SUGGESTIONS: AddressSuggestion[] = [
  { street: "104 Magnolia Lane", city: "Covington", state: "LA", zip: "70433" },
  { street: "520 Ocean Drive", city: "Gulfport", state: "MS", zip: "39501" },
  { street: "812 Mobile Street", city: "Fairhope", state: "AL", zip: "36532" },
  { street: "315 St. Charles Avenue", city: "New Orleans", state: "LA", zip: "70130" },
  { street: "1405 Beach Boulevard", city: "Biloxi", state: "MS", zip: "39530" },
];

interface AddressLookupStepProps {
  onSelectAddress: (addr: AddressSuggestion) => void;
}

export function AddressLookupStep({ onSelectAddress }: AddressLookupStepProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filtered = query.trim()
    ? MOCK_ADDRESS_SUGGESTIONS.filter(
        (a) =>
          a.street.toLowerCase().includes(query.toLowerCase()) ||
          a.city.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_ADDRESS_SUGGESTIONS;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Step 1 — Enter Listing Address
        </h2>
        <p className="text-sm text-slate-400">
          Search Google Places to auto-fill property location and map pin coordinates.
        </p>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="size-5 text-slate-500 absolute left-4 top-3.5" />
          <Input
            type="text"
            placeholder="Type property address (e.g. 104 Magnolia Lane, Covington)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 h-12 text-base bg-slate-900/90 border-slate-700 text-white rounded-xl shadow-xl"
          />
        </div>

        {/* Dropdown Suggestions */}
        <div className="mt-3 rounded-xl glass-panel border-slate-800 overflow-hidden divide-y divide-slate-800/80 shadow-2xl">
          {filtered.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectAddress(item)}
              className="w-full p-4 text-left hover:bg-slate-800/60 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {item.street}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.city}, {item.state} {item.zip}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white">
                Select &amp; Continue <Check className="size-3.5 ml-1" />
              </Button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
