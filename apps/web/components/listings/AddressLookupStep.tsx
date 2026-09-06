"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form-label";
import { MapPin, Search, ArrowRight, Building2 } from "lucide-react";
import { useListings } from "@/hooks/useRealEstateApi";

interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressLookupStepProps {
  onSelectAddress: (addr: AddressSuggestion) => void;
}

export function AddressLookupStep({ onSelectAddress }: AddressLookupStepProps) {
  const { data: existingListings = [] } = useListings();
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("LA");
  const [zip, setZip] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !zip.trim()) return;
    onSelectAddress({
      street: street.trim(),
      city: city.trim(),
      state: state.trim() || "LA",
      zip: zip.trim(),
    });
  };

  const filteredExisting = searchQuery.trim()
    ? existingListings.filter(
        (l) =>
          l.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.mlsNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Step 1 — Enter Listing Address
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter property location details or search existing MLS records.
        </p>
      </div>

      {/* Manual Address Form */}
      <form onSubmit={handleCustomSubmit} className="p-6 rounded-xl bg-card border border-border space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <FormLabel required htmlFor="street">Street Address</FormLabel>
          <div className="relative">
            <MapPin className="size-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="street"
              placeholder="e.g. 104 Magnolia Lane"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              className="pl-9 bg-background border-input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5 sm:col-span-1">
            <FormLabel required htmlFor="city">City</FormLabel>
            <Input
              id="city"
              placeholder="e.g. Covington"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="bg-background border-input text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <FormLabel required htmlFor="state">State</FormLabel>
            <Input
              id="state"
              placeholder="LA"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              maxLength={2}
              required
              className="bg-background border-input text-sm uppercase font-mono"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <FormLabel required htmlFor="zip">ZIP Code</FormLabel>
            <Input
              id="zip"
              placeholder="70433"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              required
              className="bg-background border-input text-sm font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={!street.trim() || !city.trim() || !zip.trim()}
            className="text-xs gap-1.5"
          >
            Continue to Essentials Form <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </form>

      {/* Lookup Existing Property (if desired) */}
      {existingListings.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Search className="size-3.5" /> Or Quick-Fill From Existing Database Listings:
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search existing MLS street, city, or MLS#..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border-input text-xs"
            />
          </div>

          {filteredExisting.length > 0 && (
            <div className="rounded-lg bg-card border border-border overflow-hidden divide-y divide-border shadow-sm">
              {filteredExisting.slice(0, 5).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    onSelectAddress({
                      street: l.address.street,
                      city: l.address.city,
                      state: l.address.state,
                      zip: l.address.zip,
                    })
                  }
                  className="w-full p-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between group text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{l.address.street}</span>
                      <span className="text-muted-foreground ml-1.5">
                        {l.address.city}, {l.address.state} {l.address.zip} • MLS: {l.mlsNumber}
                      </span>
                    </div>
                  </div>
                  <span className="text-primary font-medium group-hover:underline">Use Address →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
