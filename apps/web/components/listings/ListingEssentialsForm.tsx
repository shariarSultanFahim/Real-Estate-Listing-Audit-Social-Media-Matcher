"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListingSchema } from "@real-estate/validation";
import { Agent } from "@real-estate/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form-label";
import { Combobox } from "@/components/ui/combobox";
import { EmbeddedMapPreview } from "./EmbeddedMapPreview";
import { Save, ArrowLeft, MapPin, Building, FileText, Search, AlertCircle } from "lucide-react";
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

const STATE_OPTIONS = [
  { value: "LA", label: "Louisiana" },
  { value: "MS", label: "Mississippi" },
  { value: "AL", label: "Alabama" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "Single Family", label: "Single Family" },
  { value: "Condo / Townhouse", label: "Condo / Townhouse" },
  { value: "Land / Lot", label: "Land / Lot" },
  { value: "Commercial", label: "Commercial" },
];

const PROPERTY_STYLE_OPTIONS = [
  { value: "Craftsman", label: "Craftsman" },
  { value: "Traditional", label: "Traditional" },
  { value: "Modern / Contemporary", label: "Modern / Contemporary" },
  { value: "Creole Cottage", label: "Creole Cottage" },
  { value: "French Provincial", label: "French Provincial" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "Residential Sales", label: "Residential Sales" },
  { value: "Commercial Lease", label: "Commercial Lease" },
  { value: "Land Sale", label: "Land Sale" },
];

const LISTING_OFFICE_OPTIONS = [
  { value: "off-la-01", label: "Mandeville Central Office (LA)" },
  { value: "off-la-02", label: "New Orleans French Quarter (LA)" },
  { value: "off-ms-01", label: "Gulfport Beachfront (MS)" },
  { value: "off-al-01", label: "Mobile Bay Harbor (AL)" },
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
  const [featureSearch, setFeatureSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      id: initialValues?.id || `list-${Date.now()}`,
      mlsNumber: initialValues?.mlsNumber || `MLS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      address: {
        street: initialValues?.address?.street || "123 South Oak Street",
        city: initialValues?.address?.city || "Hammond",
        state: initialValues?.address?.state || "LA",
        zip: initialValues?.address?.zip || "70403",
      },
      addressLine2: initialValues?.addressLine2 || "",
      subdivision: initialValues?.subdivision || "",
      price: initialValues?.price || 450000,
      status: initialValues?.status || "active",
      listingAgentId: initialValues?.listingAgentId || agents[0]?.id || "agent-1",
      description: initialValues?.description || "Beautiful property with public records verified details.",
      legalDescription: initialValues?.legalDescription || "LOT 12 SQ 4 SUBDIVISION PH 1",
      mapCoordinates: initialValues?.mapCoordinates || { lat: 30.5044, lng: -90.4612 },
      photos: initialValues?.photos || [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", order: 1 },
      ],
      features: selectedFeatures,
      lastUpdatedAt: new Date().toISOString(),
      propertyType: initialValues?.propertyType || "",
      propertyStyle: initialValues?.propertyStyle || "",
      beds: initialValues?.beds ?? undefined,
      fullBaths: initialValues?.fullBaths ?? undefined,
      halfBaths: initialValues?.halfBaths ?? undefined,
      buildingAreaSqft: initialValues?.buildingAreaSqft ?? undefined,
      lotSizeAcres: initialValues?.lotSizeAcres ?? undefined,
      yearBuilt: initialValues?.yearBuilt ?? undefined,
      parkingPlaces: initialValues?.parkingPlaces ?? undefined,
      newConstruction: initialValues?.newConstruction || false,
      listingType: initialValues?.listingType || "Residential Sales",
      listDate: initialValues?.listDate || "2026-08-10",
      expirationDate: initialValues?.expirationDate || "2026-08-10",
      anticipatedLaunchDate: initialValues?.anticipatedLaunchDate || "2026-08-10",
      listingOfficeId: initialValues?.listingOfficeId || "",
    },
  });

  const agentOptions = agents.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.officeState})`,
  }));

  const toggleFeature = (feat: string) => {
    const updated = selectedFeatures.includes(feat)
      ? selectedFeatures.filter((f) => f !== feat)
      : [...selectedFeatures, feat];
    setSelectedFeatures(updated);
    setValue("features", updated);
  };

  const filteredFeatures = FEATURE_OPTIONS.filter((f) =>
    f.toLowerCase().includes(featureSearch.toLowerCase())
  );

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

      {/* 3-Column Layout Matching Screenshot exact structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Location */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <MapPin className="size-4 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Location</h3>
          </div>

          <EmbeddedMapPreview
            address="123 South Oak Street"
            city="Hammond"
            state="LA"
          />

          <div className="space-y-3">
            <div className="space-y-1">
              <FormLabel required htmlFor="address.street">Address Line 1</FormLabel>
              <Input
                id="address.street"
                {...register("address.street", { onChange: () => clearErrors("address.street") })}
                placeholder="123 South Oak Street"
                className={`h-10 text-sm ${errors.address?.street ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.address?.street && (
                <p className="text-red-500 text-xs mt-1">{errors.address.street.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <FormLabel htmlFor="addressLine2">Address Line 2</FormLabel>
              <Input
                id="addressLine2"
                {...register("addressLine2")}
                placeholder="Address Line 2"
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel htmlFor="subdivision">Subdivision</FormLabel>
                <Input
                  id="subdivision"
                  {...register("subdivision")}
                  placeholder="Subdivision"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1">
                <FormLabel required htmlFor="address.city">City</FormLabel>
                <Input
                  id="address.city"
                  {...register("address.city", { onChange: () => clearErrors("address.city") })}
                  placeholder="Hammond"
                  className={`h-10 text-sm ${errors.address?.city ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.address?.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel required>State</FormLabel>
                <Controller
                  name="address.state"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={STATE_OPTIONS}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        clearErrors("address.state");
                      }}
                      placeholder="Select State"
                      searchPlaceholder="Search State..."
                      className={`h-10 text-sm w-full ${errors.address?.state ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                  )}
                />
                {errors.address?.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.state.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <FormLabel required htmlFor="address.zip">Zip</FormLabel>
                <Input
                  id="address.zip"
                  {...register("address.zip", { onChange: () => clearErrors("address.zip") })}
                  placeholder="70403"
                  className={`h-10 text-sm ${errors.address?.zip ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.address?.zip && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.zip.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Column 2: Property Information & Property Features */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building className="size-4 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">Property Information</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <FormLabel required>Property Type</FormLabel>
                <Controller
                  name="propertyType"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={PROPERTY_TYPE_OPTIONS}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        clearErrors("propertyType");
                      }}
                      placeholder="Select Property Type"
                      searchPlaceholder="Search Property Type..."
                      className={`h-10 text-sm w-full ${errors.propertyType ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                  )}
                />
                {errors.propertyType && (
                  <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <FormLabel required>Property Style</FormLabel>
                <Controller
                  name="propertyStyle"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={PROPERTY_STYLE_OPTIONS}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        clearErrors("propertyStyle");
                      }}
                      placeholder="Select Property Style"
                      searchPlaceholder="Search Style..."
                      className={`h-10 text-sm w-full ${errors.propertyStyle ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    />
                  )}
                />
                {errors.propertyStyle && (
                  <p className="text-red-500 text-xs mt-1">{errors.propertyStyle.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <FormLabel required htmlFor="beds">Beds</FormLabel>
                  <Input
                    id="beds"
                    type="number"
                    {...register("beds", {
                      valueAsNumber: true,
                      onChange: () => clearErrors("beds"),
                    })}
                    placeholder="Beds"
                    className={`h-10 text-sm ${errors.beds ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                  {errors.beds && (
                    <p className="text-red-500 text-xs mt-1">{errors.beds.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <FormLabel htmlFor="fullBaths">Baths</FormLabel>
                  <Input
                    id="fullBaths"
                    type="number"
                    {...register("fullBaths", {
                      valueAsNumber: true,
                      onChange: () => clearErrors("fullBaths"),
                    })}
                    placeholder="Full Bath"
                    className={`h-10 text-sm ${errors.fullBaths ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                </div>
                <div className="space-y-1">
                  <FormLabel htmlFor="halfBaths">Half Bath</FormLabel>
                  <Input
                    id="halfBaths"
                    type="number"
                    {...register("halfBaths", {
                      valueAsNumber: true,
                      onChange: () => clearErrors("halfBaths"),
                    })}
                    placeholder="Half Bath"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FormLabel htmlFor="buildingAreaSqft">Building Area (Sq. Ft.)</FormLabel>
                  <Input
                    id="buildingAreaSqft"
                    type="number"
                    {...register("buildingAreaSqft", {
                      valueAsNumber: true,
                      onChange: () => clearErrors("buildingAreaSqft"),
                    })}
                    placeholder="in SqFt"
                    className={`h-10 text-sm ${errors.buildingAreaSqft ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                </div>
                <div className="space-y-1">
                  <FormLabel htmlFor="lotSizeAcres">Lot Size (Acres)</FormLabel>
                  <Input
                    id="lotSizeAcres"
                    type="number"
                    step="0.01"
                    {...register("lotSizeAcres", {
                      valueAsNumber: true,
                      onChange: () => clearErrors("lotSizeAcres"),
                    })}
                    placeholder="in Acres"
                    className={`h-10 text-sm ${errors.lotSizeAcres ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <FormLabel htmlFor="yearBuilt">Year Built</FormLabel>
                  <Input
                    id="yearBuilt"
                    type="number"
                    {...register("yearBuilt", { valueAsNumber: true })}
                    placeholder="Year Built"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <FormLabel htmlFor="parkingPlaces">Parking Places</FormLabel>
                  <Input
                    id="parkingPlaces"
                    type="number"
                    {...register("parkingPlaces", { valueAsNumber: true })}
                    placeholder="# of Parking Places"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newConstruction"
                  {...register("newConstruction")}
                  className="size-4 rounded border-input bg-background accent-primary"
                />
                <label htmlFor="newConstruction" className="text-xs text-foreground cursor-pointer select-none">
                  New Construction (To Be Built)
                </label>
              </div>
            </div>
          </Card>

          {/* Property Features section */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText className="size-4 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">Property Features</h3>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="size-3.5 text-muted-foreground absolute left-3 top-3" />
                <Input
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Search Features ..."
                  className="pl-9 h-10 text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredFeatures.map((feat) => {
                  const isSelected = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isSelected
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
          </Card>
        </div>

        {/* Column 3: Listing Detail */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Listing Detail</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <FormLabel required>Listing Type</FormLabel>
              <Controller
                name="listingType"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={LISTING_TYPE_OPTIONS}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      clearErrors("listingType");
                    }}
                    placeholder="Select Listing Type"
                    searchPlaceholder="Search Listing Type..."
                    className={`h-10 text-sm w-full ${errors.listingType ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                )}
              />
              {errors.listingType && (
                <p className="text-red-500 text-xs mt-1">{errors.listingType.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <FormLabel required htmlFor="price">List Price</FormLabel>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  {...register("price", {
                    valueAsNumber: true,
                    onChange: () => clearErrors("price"),
                  })}
                  placeholder="List Price"
                  className={`pl-7 pr-9 h-10 text-sm font-semibold ${errors.price ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                <span className="absolute right-3 text-xs text-muted-foreground">.00</span>
              </div>
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel required htmlFor="listDate">List Date</FormLabel>
                <Input
                  id="listDate"
                  type="date"
                  {...register("listDate", { onChange: () => clearErrors("listDate") })}
                  className={`h-10 text-sm ${errors.listDate ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.listDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.listDate.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <FormLabel required htmlFor="expirationDate">Expiration Date</FormLabel>
                <Input
                  id="expirationDate"
                  type="date"
                  {...register("expirationDate", { onChange: () => clearErrors("expirationDate") })}
                  className={`h-10 text-sm ${errors.expirationDate ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.expirationDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <FormLabel htmlFor="anticipatedLaunchDate">Anticipated Launch Date</FormLabel>
              <Input
                id="anticipatedLaunchDate"
                type="date"
                {...register("anticipatedLaunchDate")}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1">
              <FormLabel required>Listing Office</FormLabel>
              <Controller
                name="listingOfficeId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={LISTING_OFFICE_OPTIONS}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      clearErrors("listingOfficeId");
                    }}
                    placeholder="-- Select Listing Office --"
                    searchPlaceholder="Search Office..."
                    className={`h-10 text-sm w-full ${errors.listingOfficeId ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                )}
              />
              {errors.listingOfficeId && (
                <p className="text-red-500 text-xs mt-1">{errors.listingOfficeId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <FormLabel required>Listing Agent</FormLabel>
              <Controller
                name="listingAgentId"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={agentOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      clearErrors("listingAgentId");
                    }}
                    placeholder="Select Listing Agent"
                    searchPlaceholder="Search Agent..."
                    className={`h-10 text-sm w-full ${errors.listingAgentId ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                )}
              />
              {errors.listingAgentId && (
                <p className="text-red-500 text-xs mt-1">{errors.listingAgentId.message}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Footer */}
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
