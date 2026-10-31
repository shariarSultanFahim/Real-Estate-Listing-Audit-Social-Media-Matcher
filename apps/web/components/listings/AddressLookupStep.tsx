"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form-label";
import {
  MapPin,
  Search,
  ArrowRight,
  Building2,
  FileSpreadsheet,
  Upload,
  Sparkles,
  Check,
} from "lucide-react";
import { useListings } from "@/hooks/useRealEstateApi";

interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressLookupStepProps {
  onSelectAddress: (addr: AddressSuggestion) => void;
  onOpenImport?: () => void;
}

export function AddressLookupStep({ onSelectAddress, onOpenImport }: AddressLookupStepProps) {
  const { data: existingListings = [] } = useListings();
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("LA");
  const [zip, setZip] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!street.trim()) {
      setErrorMsg("Please enter at least a street address (e.g. 104 Magnolia Lane).");
      return;
    }

    setErrorMsg("");
    onSelectAddress({
      street: street.trim(),
      city: city.trim() || "New Orleans",
      state: state.trim() || "LA",
      zip: zip.trim() || "70112",
    });
  };

  const handleSkip = () => {
    onSelectAddress({
      street: street.trim() || "123 Main Street",
      city: city.trim() || "New Orleans",
      state: state.trim() || "LA",
      zip: zip.trim() || "70112",
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
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Top Banner: Bulk Import Option */}
      {onOpenImport && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Have multiple listings to add?
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                  Recommended
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload your Brokerage Engine export or spreadsheet (.xlsx, .xls, .csv) to import all listings at once.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onOpenImport}
            className="shrink-0 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Upload className="size-3.5" />
            Bulk Import Excel / CSV
          </Button>
        </div>
      )}

      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Step 1 — Enter Property Location
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Enter address details for a single listing, or jump straight to the full essentials form.
        </p>
      </div>

      {/* Manual Address Form */}
      <form
        onSubmit={handleCustomSubmit}
        className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm"
      >
        <div className="space-y-1.5">
          <FormLabel required htmlFor="street">Street Address</FormLabel>
          <div className="relative">
            <MapPin className="size-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="street"
              placeholder="e.g. 104 Magnolia Lane"
              value={street}
              onChange={(e) => {
                setStreet(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              className="pl-9 bg-background border-input text-sm"
              autoFocus
            />
          </div>
          {errorMsg && (
            <p className="text-xs text-destructive font-medium mt-1">{errorMsg}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5 sm:col-span-1">
            <FormLabel htmlFor="city">City</FormLabel>
            <Input
              id="city"
              placeholder="e.g. New Orleans"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-background border-input text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <FormLabel htmlFor="state">State</FormLabel>
            <Input
              id="state"
              placeholder="LA"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              maxLength={2}
              className="bg-background border-input text-sm uppercase font-mono"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <FormLabel htmlFor="zip">ZIP Code</FormLabel>
            <Input
              id="zip"
              placeholder="70112"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="bg-background border-input text-sm font-mono"
            />
          </div>
        </div>

        <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground w-full sm:w-auto"
          >
            Skip Address Lookup → Enter Manually
          </Button>

          <Button
            type="submit"
            className="text-xs gap-1.5 w-full sm:w-auto font-semibold"
          >
            Continue to Essentials Form <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </form>

      {/* Lookup Existing Property (if desired) */}
      {existingListings.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Search className="size-3.5" /> Or Quick-Fill From Existing Database Listings ({existingListings.length}):
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
            <div className="rounded-xl bg-card border border-border overflow-hidden divide-y divide-border shadow-xs max-h-48 overflow-y-auto">
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
                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">{l.address.street}</span>
                      <span className="text-muted-foreground ml-1.5">
                        {l.address.city}, {l.address.state} {l.address.zip} • MLS: {l.mlsNumber}
                      </span>
                    </div>
                  </div>
                  <span className="text-primary font-medium group-hover:underline shrink-0">
                    Use Address →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
