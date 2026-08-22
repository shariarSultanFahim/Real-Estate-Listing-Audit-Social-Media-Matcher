"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCcw } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { Card } from "@/components/ui/card";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedField: string;
  onFieldChange: (value: string) => void;
  selectedSite: string;
  onSiteChange: (value: string) => void;
  onReset: () => void;
}

const FIELD_OPTIONS = [
  { value: "all", label: "All Mismatched Fields" },
  { value: "price", label: "Price Mismatch" },
  { value: "photos", label: "Photo Order / Missing" },
  { value: "address", label: "Address Mismatch" },
  { value: "description", label: "Description Text" },
  { value: "mapCoordinates", label: "Map Pin Coordinates" },
];

const SITE_OPTIONS = [
  { value: "all", label: "All Syndication Portals" },
  { value: "zillow", label: "Zillow" },
  { value: "realtor", label: "Realtor.com" },
  { value: "homes", label: "Homes.com" },
  { value: "sothebysRealty", label: "Sotheby's Realty" },
  { value: "crescentSothebys", label: "Crescent Sotheby's" },
  { value: "lacdb", label: "LACDB (Louisiana Commercial DB)" },
  { value: "google", label: "Google" },
];

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
    <Card className="p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
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
        <div className="w-52">
          <Combobox
            options={FIELD_OPTIONS}
            value={selectedField}
            onChange={onFieldChange}
            placeholder="Select field..."
            searchPlaceholder="Search field..."
            className="h-9 text-xs"
          />
        </div>

        {/* Syndication Site Select */}
        <div className="w-52">
          <Combobox
            options={SITE_OPTIONS}
            value={selectedSite}
            onChange={onSiteChange}
            placeholder="Select portal..."
            searchPlaceholder="Search portal..."
            className="h-9 text-xs"
          />
        </div>

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
    </Card>
  );
}
