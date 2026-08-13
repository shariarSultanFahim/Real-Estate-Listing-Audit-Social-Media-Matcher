"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCcw } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedField: string;
  onFieldChange: (value: string) => void;
  selectedSite: string;
  onSiteChange: (value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedField,
  onFieldChange,
  selectedSite,
  onSiteChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
        <Input
          type="text"
          placeholder="Filter by address, MLS#, agent..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background border-input text-xs"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Filters:</span>
        </div>

        {/* Field Type Select */}
        <select
          value={selectedField}
          onChange={(e) => onFieldChange(e.target.value)}
          className="h-9 px-3 rounded-md bg-background border border-input text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Mismatched Fields</option>
          <option value="price">Price Mismatch</option>
          <option value="photos">Photo Order / Missing</option>
          <option value="address">Address Mismatch</option>
          <option value="description">Description Text</option>
          <option value="mapCoordinates">Map Pin Coordinates</option>
        </select>

        {/* Syndication Site Select */}
        <select
          value={selectedSite}
          onChange={(e) => onSiteChange(e.target.value)}
          className="h-9 px-3 rounded-md bg-background border border-input text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Syndication Portals</option>
          <option value="zillow">Zillow</option>
          <option value="realtor">Realtor.com</option>
          <option value="homes">Homes.com</option>
          <option value="sothebysRealty">Sotheby&apos;s Realty</option>
          <option value="crescentSothebys">Crescent Sotheby&apos;s</option>
          <option value="google">Google</option>
        </select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCcw className="size-3.5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
