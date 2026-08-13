"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListingSchema } from "@real-estate/validation";
import { Agent } from "@real-estate/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { EmbeddedMapPreview } from "./EmbeddedMapPreview";
import { AlertCircle, Save, ArrowLeft, Tag } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

type FormData = z.infer<typeof ListingSchema>;

interface ListingEssentialsFormProps {
  initialValues?: Partial<FormData>;
  agents: Agent[];
  onSubmit: (data: FormData) => void;
  onBack?: () => void;
}

const FEATURE_OPTIONS = [
  "Pool",
  "Quartz Countertops",
  "Patio",
  "Hardwood Floors",
  "2-Car Garage",
  "Waterfront",
  "Dock Access",
  "Wine Cellar",
  "Balcony",
  "Elevator",
  "Screened Porch",
  "Metal Roof",
  "Chef Kitchen",
  "Golf Course Lot",
];

export function ListingEssentialsForm({
  initialValues,
  agents,
  onSubmit,
  onBack,
}: ListingEssentialsFormProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialValues?.features || ["Quartz Countertops", "2-Car Garage"]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      id: initialValues?.id || `list-${Date.now()}`,
      mlsNumber: initialValues?.mlsNumber || `MLS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      address: {
        street: initialValues?.address?.street || "104 Magnolia Lane",
        city: initialValues?.address?.city || "Covington",
        state: initialValues?.address?.state || "LA",
        zip: initialValues?.address?.zip || "70433",
      },
      price: initialValues?.price || 450000,
      status: initialValues?.status || "active",
      listingAgentId: initialValues?.listingAgentId || agents[0]?.id || "agent-1",
      description: initialValues?.description || "Beautiful property with modern features and open layout.",
      legalDescription: initialValues?.legalDescription || "LOT 12 SQ 4 SUBDIVISION PH 1",
      mapCoordinates: initialValues?.mapCoordinates || { lat: 30.4755, lng: -90.1009 },
      photos: initialValues?.photos || [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", order: 1 },
      ],
      features: selectedFeatures,
      lastUpdatedAt: new Date().toISOString(),
      propertyType: initialValues?.propertyType || "Single Family",
      propertyStyle: initialValues?.propertyStyle || "Craftsman",
      beds: initialValues?.beds || 4,
      fullBaths: initialValues?.fullBaths || 3,
      halfBaths: initialValues?.halfBaths || 1,
      buildingAreaSqft: initialValues?.buildingAreaSqft || 2800,
      newConstruction: initialValues?.newConstruction || false,
      listingType: initialValues?.listingType || "Residential Sales",
      listDate: initialValues?.listDate || "2026-08-01",
      expirationDate: initialValues?.expirationDate || "2027-02-01",
      listingOfficeId: initialValues?.listingOfficeId || "off-la-01",
    },
  });

  const toggleFeature = (feat: string) => {
    const updated = selectedFeatures.includes(feat)
      ? selectedFeatures.filter((f) => f !== feat)
      : [...selectedFeatures, feat];
    setSelectedFeatures(updated);
    setValue("features", updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Banner Note matching spec reference */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3">
        <AlertCircle className="size-4 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="font-semibold">Verification Required</p>
          <p className="opacity-90 mt-0.5">
            Information is populated from public records where possible and must be verified before saving.
          </p>
        </div>
      </div>

      {/* 3-Column Layout Matching Specification Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Location */}
        <Card className="space-y-4 p-6">
          <h3 className="text-base font-semibold text-card-foreground border-b border-border pb-3">
            1. Location
          </h3>

          <EmbeddedMapPreview
            address={initialValues?.address?.street || "104 Magnolia Lane"}
            city={initialValues?.address?.city || "Covington"}
            state={initialValues?.address?.state || "LA"}
          />

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Address Line 1</label>
              <Input {...register("address.street")} className="bg-background border-input text-xs" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Address Line 2 (Optional)</label>
              <Input {...register("addressLine2")} className="bg-background border-input text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Subdivision</label>
                <Input {...register("subdivision")} className="bg-background border-input text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">City</label>
                <Input {...register("address.city")} className="bg-background border-input text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">State</label>
                <select {...register("address.state")} className="h-9 w-full rounded-md bg-background border border-input text-xs px-2 text-foreground">
                  <option value="LA">Louisiana (LA)</option>
                  <option value="MS">Mississippi (MS)</option>
                  <option value="AL">Alabama (AL)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Zip Code</label>
                <Input {...register("address.zip")} className="bg-background border-input text-xs" />
              </div>
            </div>
          </div>
        </Card>

        {/* Column 2: Property Information & Features */}
        <Card className="space-y-4 p-6">
          <h3 className="text-base font-semibold text-card-foreground border-b border-border pb-3">
            2. Property Info &amp; Features
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Property Type</label>
                <select {...register("propertyType")} className="h-9 w-full rounded-md bg-background border border-input text-xs px-2 text-foreground">
                  <option value="Single Family">Single Family</option>
                  <option value="Condo / Townhouse">Condo / Townhouse</option>
                  <option value="Land / Lot">Land / Lot</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Property Style</label>
                <Input {...register("propertyStyle")} className="bg-background border-input text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Beds</label>
                <Input type="number" {...register("beds", { valueAsNumber: true })} className="bg-background border-input text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Full Baths</label>
                <Input type="number" {...register("fullBaths", { valueAsNumber: true })} className="bg-background border-input text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Half Baths</label>
                <Input type="number" {...register("halfBaths", { valueAsNumber: true })} className="bg-background border-input text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Building Area (sq ft)</label>
                <Input type="number" {...register("buildingAreaSqft", { valueAsNumber: true })} className="bg-background border-input text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Lot Size (acres)</label>
                <Input type="number" step="0.01" {...register("lotSizeAcres", { valueAsNumber: true })} className="bg-background border-input text-xs" />
              </div>
            </div>

            {/* Tag-style Features Selection */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" /> Select Property Features
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {FEATURE_OPTIONS.map((feat) => {
                  const isSelected = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border border-primary"
                          : "bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Column 3: Listing Details */}
        <Card className="space-y-4 p-6">
          <h3 className="text-base font-semibold text-card-foreground border-b border-border pb-3">
            3. Listing Detail
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">List Price ($)</label>
              <Input type="number" {...register("price", { valueAsNumber: true })} className="bg-background border-input text-xs font-bold text-primary" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">MLS Number</label>
              <Input {...register("mlsNumber")} className="bg-background border-input text-xs font-mono" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Listing Agent</label>
              <select {...register("listingAgentId")} className="h-9 w-full rounded-md bg-background border border-input text-xs px-2 text-foreground">
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.officeState})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-md bg-background border border-input text-xs p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="text-xs">
            <ArrowLeft className="size-3.5 mr-1" /> Back to Step 1
          </Button>
        )}
        <Button type="submit" className="text-xs ml-auto gap-2">
          <Save className="size-3.5" /> Save Listing to Brokerage Engine Mirror
        </Button>
      </div>
    </form>
  );
}
