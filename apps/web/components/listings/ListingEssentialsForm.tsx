"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListingSchema } from "@real-estate/validation";
import { Agent, Photo } from "@real-estate/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form-label";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { EmbeddedMapPreview } from "./EmbeddedMapPreview";
import {
  Save,
  ArrowLeft,
  MapPin,
  Building,
  FileText,
  Search,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Star,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Link as LinkIcon,
  ShieldCheck,
  FileEdit,
} from "lucide-react";
import { z } from "zod";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof ListingSchema>;

interface ListingEssentialsFormProps {
  initialValues?: Partial<FormData>;
  agents: Agent[];
  onSubmit: (data: FormData) => void;
  onBack?: () => void;
  isEditMode?: boolean;
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
  "Smart Home System",
  "Solar Panels",
  "Outdoor Kitchen",
  "Gated Community",
];

const STATE_SUGGESTIONS = ["LA", "MS", "AL"];

const PROPERTY_TYPE_SUGGESTIONS = [
  "Single Family",
  "Condo / Townhouse",
  "Land / Lot",
  "Commercial",
  "Multi-Family",
  "Industrial",
];

const PROPERTY_SUBTYPE_SUGGESTIONS = [
  "Craftsman",
  "Traditional",
  "Modern / Contemporary",
  "Creole Cottage",
  "French Provincial",
  "Office",
  "Retail",
  "Industrial / Warehouse",
  "Residential Acreage",
];

const LISTING_TYPE_SUGGESTIONS = [
  "Residential Sales",
  "Commercial Lease",
  "Commercial Sale",
  "Land Sale",
];

const LISTING_STATUS_SUGGESTIONS = ["active", "pending", "sold", "withdrawn"];

const LISTING_OFFICE_SUGGESTIONS = [
  "off-la-01",
  "off-ms-01",
  "off-al-01",
];

export function ListingEssentialsForm({
  initialValues,
  agents,
  onSubmit,
  onBack,
  isEditMode = false,
}: ListingEssentialsFormProps) {
  const router = useRouter();

  // Features state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialValues?.features || []
  );
  const [featureSearch, setFeatureSearch] = useState("");

  // Photos state (Ordered array representing Source-of-Truth arrangement)
  const [photos, setPhotos] = useState<Photo[]>(
    initialValues?.photos && initialValues.photos.length > 0
      ? initialValues.photos
      : []
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Description & Rich Text State
  const [shortDesc, setShortDesc] = useState(
    initialValues?.description ? initialValues.description.substring(0, 100) : ""
  );
  const [fullDesc, setFullDesc] = useState(
    initialValues?.description || ""
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      id: initialValues?.id || `list-${Date.now()}`,
      mlsNumber: initialValues?.mlsNumber || "",
      address: {
        street: initialValues?.address?.street || "",
        city: initialValues?.address?.city || "",
        state: initialValues?.address?.state || "",
        zip: initialValues?.address?.zip || "",
      },
      addressLine2: initialValues?.addressLine2 || "",
      subdivision: initialValues?.subdivision || "",
      price: initialValues?.price ?? undefined,
      status: initialValues?.status || "active",
      listingAgentId: initialValues?.listingAgentId || agents[0]?.id || "",
      description: fullDesc,
      legalDescription: initialValues?.legalDescription || "",
      mapCoordinates: initialValues?.mapCoordinates || undefined,
      photos,
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
      listingType: initialValues?.listingType || "",
      listDate: initialValues?.listDate ?? "",
      expirationDate: initialValues?.expirationDate ?? "",
      anticipatedLaunchDate: initialValues?.anticipatedLaunchDate ?? "",
      listingOfficeId: initialValues?.listingOfficeId || "",
    },
  });

  const propertyType = watch("propertyType");
  const isCommercialOrLand = propertyType === "Commercial" || propertyType === "Land / Lot";

  // Feature selection
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

  // Photo handlers
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const updated: Photo[] = [
      ...photos,
      { url: newPhotoUrl.trim(), order: photos.length + 1 },
    ];
    setPhotos(updated);
    setValue("photos", updated);
    setNewPhotoUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      newItems.push({
        url: objectUrl,
        order: photos.length + i + 1,
      });
    }
    const combined = [...photos, ...newItems];
    setPhotos(combined);
    setValue("photos", combined);
  };

  const handleMovePhoto = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    const cloned = [...photos];
    const temp = cloned[index];
    cloned[index] = cloned[targetIndex];
    cloned[targetIndex] = temp;
    const resequenced = cloned.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(resequenced);
    setValue("photos", resequenced);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const cloned = [...photos];
    const [selected] = cloned.splice(index, 1);
    cloned.unshift(selected);
    const resequenced = cloned.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(resequenced);
    setValue("photos", resequenced);
  };

  const handleDeletePhoto = (index: number) => {
    const filtered = photos.filter((_, idx) => idx !== index);
    const resequenced = filtered.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(resequenced);
    setValue("photos", resequenced);
  };

  // Rich text actions
  const applyFormatting = (prefix: string, suffix = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = fullDesc;
    const selected = current.substring(start, end) || "text";
    const formatted = current.substring(0, start) + prefix + selected + suffix + current.substring(end);
    setFullDesc(formatted);
    setValue("description", formatted);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleFormSubmit = (data: FormData) => {
    const lat = typeof data.mapCoordinates?.lat === "number" && !isNaN(data.mapCoordinates.lat) ? data.mapCoordinates.lat : undefined;
    const lng = typeof data.mapCoordinates?.lng === "number" && !isNaN(data.mapCoordinates.lng) ? data.mapCoordinates.lng : undefined;

    onSubmit({
      ...data,
      mapCoordinates: lat !== undefined && lng !== undefined ? { lat, lng } : null,
      propertyStyle: data.propertyStyle ? data.propertyStyle : null,
      listingType: data.listingType ? data.listingType : null,
      listDate: data.listDate ? data.listDate : null,
      expirationDate: data.expirationDate ? data.expirationDate : null,
      anticipatedLaunchDate: data.anticipatedLaunchDate ? data.anticipatedLaunchDate : null,
      description: fullDesc,
      photos,
      features: selectedFeatures,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Native DataLists for Autocomplete & Suggestions */}
      <datalist id="state-suggestions">
        {STATE_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <datalist id="property-type-suggestions">
        {PROPERTY_TYPE_SUGGESTIONS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <datalist id="property-subtype-suggestions">
        {PROPERTY_SUBTYPE_SUGGESTIONS.map((st) => (
          <option key={st} value={st} />
        ))}
      </datalist>

      <datalist id="listing-type-suggestions">
        {LISTING_TYPE_SUGGESTIONS.map((lt) => (
          <option key={lt} value={lt} />
        ))}
      </datalist>

      <datalist id="status-suggestions">
        {LISTING_STATUS_SUGGESTIONS.map((st) => (
          <option key={st} value={st} />
        ))}
      </datalist>

      <datalist id="office-suggestions">
        {LISTING_OFFICE_SUGGESTIONS.map((off) => (
          <option key={off} value={off} />
        ))}
      </datalist>

      <datalist id="agent-suggestions">
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.officeState})
          </option>
        ))}
      </datalist>

      {/* Source-of-Truth Informational Banner */}
      <div className="p-4 rounded-xl bg-card border border-primary/30 bg-primary/5 text-xs flex items-start justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">MLS / Brokerage Engine Source of Truth</span>
              <Badge variant="outline" className="text-[10px] border-primary/40 bg-primary/10 text-primary">
                Authoritative Master
              </Badge>
            </div>
            <p className="text-muted-foreground">
              This listing information is the authoritative source used for audits across Zillow, Realtor.com, LACDB, and external syndication portals. Scraped external feeds will never overwrite this data.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3-COLUMN MAIN GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Location */}
        <Card className="p-5 space-y-4 border-border bg-card">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Location</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Geographic Point</span>
          </div>

          <EmbeddedMapPreview
            address={watch("address.street") || "104 Magnolia Lane"}
            city={watch("address.city") || "Covington"}
            state={watch("address.state") || "LA"}
          />

          <div className="space-y-3">
            <div className="space-y-1">
              <FormLabel required htmlFor="address.street">Address Line 1</FormLabel>
              <Input
                id="address.street"
                type="text"
                {...register("address.street", { onChange: () => clearErrors("address.street") })}
                placeholder="104 Magnolia Lane"
                className={`h-10 text-sm bg-background ${errors.address?.street ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.address?.street && (
                <p className="text-red-500 text-xs mt-1">{errors.address.street.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <FormLabel htmlFor="addressLine2">Address Line 2</FormLabel>
              <Input
                id="addressLine2"
                type="text"
                {...register("addressLine2")}
                placeholder="Suite, Apt, Unit (Optional)"
                className="h-10 text-sm bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel htmlFor="subdivision">Subdivision</FormLabel>
                <Input
                  id="subdivision"
                  type="text"
                  {...register("subdivision")}
                  placeholder="e.g. Magnolia Trace"
                  className="h-10 text-sm bg-background"
                />
              </div>
              <div className="space-y-1">
                <FormLabel required htmlFor="address.city">City</FormLabel>
                <Input
                  id="address.city"
                  type="text"
                  {...register("address.city", { onChange: () => clearErrors("address.city") })}
                  placeholder="Covington"
                  className={`h-10 text-sm bg-background ${errors.address?.city ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.address?.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel required htmlFor="address.state">State</FormLabel>
                <Input
                  id="address.state"
                  type="text"
                  list="state-suggestions"
                  {...register("address.state", { onChange: () => clearErrors("address.state") })}
                  placeholder="e.g. LA, MS, AL"
                  className={`h-10 text-sm bg-background uppercase font-mono ${errors.address?.state ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.address?.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.state.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <FormLabel required htmlFor="address.zip">ZIP Code</FormLabel>
                <Input
                  id="address.zip"
                  type="text"
                  {...register("address.zip", { onChange: () => clearErrors("address.zip") })}
                  placeholder="70433"
                  className={`h-10 text-sm bg-background font-mono ${errors.address?.zip ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.address?.zip && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.zip.message}</p>
                )}
              </div>
            </div>

            {/* Latitude & Longitude for Haversine Audit Comparison */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <FormLabel htmlFor="mapCoordinates.lat">Latitude (Audit Sync)</FormLabel>
                <Input
                  id="mapCoordinates.lat"
                  type="number"
                  step="0.0000001"
                  {...register("mapCoordinates.lat", { valueAsNumber: true })}
                  placeholder="e.g. 30.4755 (Optional)"
                  className="h-9 text-xs font-mono bg-background"
                />
              </div>
              <div className="space-y-1">
                <FormLabel htmlFor="mapCoordinates.lng">Longitude (Audit Sync)</FormLabel>
                <Input
                  id="mapCoordinates.lng"
                  type="number"
                  step="0.0000001"
                  {...register("mapCoordinates.lng", { valueAsNumber: true })}
                  placeholder="e.g. -90.1009 (Optional)"
                  className="h-9 text-xs font-mono bg-background"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Column 2: Property Information */}
        <Card className="p-5 space-y-4 border-border bg-card">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Building className="size-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Property Information</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Structural Specs</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <FormLabel required htmlFor="propertyType">Property Type</FormLabel>
              <Input
                id="propertyType"
                type="text"
                list="property-type-suggestions"
                {...register("propertyType", { onChange: () => clearErrors("propertyType") })}
                placeholder="e.g. Single Family, Commercial, Land"
                className={`h-10 text-sm bg-background ${errors.propertyType ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.propertyType && (
                <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <FormLabel htmlFor="propertyStyle">Property Subtype</FormLabel>
              <Input
                id="propertyStyle"
                type="text"
                list="property-subtype-suggestions"
                {...register("propertyStyle", { onChange: () => clearErrors("propertyStyle") })}
                placeholder="e.g. Craftsman, Traditional, Modern (Optional)"
                className={`h-10 text-sm bg-background ${errors.propertyStyle ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.propertyStyle && (
                <p className="text-red-500 text-xs mt-1">{errors.propertyStyle.message}</p>
              )}
            </div>

            {/* Conditional Beds / Baths for Residential */}
            {!isCommercialOrLand && (
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
                    className={`h-10 text-sm bg-background ${errors.beds ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                  {errors.beds && (
                    <p className="text-red-500 text-xs mt-1">{errors.beds.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <FormLabel htmlFor="fullBaths">Full Baths</FormLabel>
                  <Input
                    id="fullBaths"
                    type="number"
                    {...register("fullBaths", {
                      valueAsNumber: true,
                      onChange: () => clearErrors("fullBaths"),
                    })}
                    placeholder="Full Baths"
                    className={`h-10 text-sm bg-background ${errors.fullBaths ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
                    className="h-10 text-sm bg-background"
                  />
                </div>
              </div>
            )}

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
                  placeholder="e.g. 2850"
                  className={`h-10 text-sm bg-background ${errors.buildingAreaSqft ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
                  placeholder="e.g. 0.45"
                  className={`h-10 text-sm bg-background ${errors.lotSizeAcres ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
                  placeholder="e.g. 2021 (Optional)"
                  className="h-10 text-sm bg-background"
                />
              </div>
              <div className="space-y-1">
                <FormLabel htmlFor="parkingPlaces">Parking Places</FormLabel>
                <Input
                  id="parkingPlaces"
                  type="number"
                  {...register("parkingPlaces", { valueAsNumber: true })}
                  placeholder="e.g. 2"
                  className="h-10 text-sm bg-background"
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
              <label htmlFor="newConstruction" className="text-xs text-foreground cursor-pointer select-none font-medium">
                New Construction (To Be Built / Spec)
              </label>
            </div>
          </div>
        </Card>

        {/* Column 3: Listing Detail */}
        <Card className="p-5 space-y-4 border-border bg-card">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Listing Detail</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">MLS Contract</span>
          </div>

          <div className="space-y-3">
            {/* MLS Listing ID (Critical for audit matching) */}
            <div className="space-y-1">
              <FormLabel required htmlFor="mlsNumber">MLS Listing ID</FormLabel>
              <Input
                id="mlsNumber"
                type="text"
                {...register("mlsNumber", { onChange: () => clearErrors("mlsNumber") })}
                placeholder="e.g. MLS-2026-4891"
                className={`h-10 text-sm font-mono font-semibold bg-background ${errors.mlsNumber ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.mlsNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.mlsNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel htmlFor="listingType">Listing Type</FormLabel>
                <Input
                  id="listingType"
                  type="text"
                  list="listing-type-suggestions"
                  {...register("listingType", { onChange: () => clearErrors("listingType") })}
                  placeholder="e.g. Residential Sales (Optional)"
                  className={`h-10 text-sm bg-background ${errors.listingType ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.listingType && (
                  <p className="text-red-500 text-xs mt-1">{errors.listingType.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <FormLabel required htmlFor="status">Status</FormLabel>
                <Input
                  id="status"
                  type="text"
                  list="status-suggestions"
                  {...register("status", { onChange: () => clearErrors("status") })}
                  placeholder="active, pending, sold"
                  className={`h-10 text-sm bg-background font-mono ${errors.status ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <FormLabel required htmlFor="price">List Price</FormLabel>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm text-muted-foreground font-semibold">$</span>
                <Input
                  id="price"
                  type="number"
                  {...register("price", {
                    valueAsNumber: true,
                    onChange: () => clearErrors("price"),
                  })}
                  placeholder="List Price"
                  className={`pl-7 pr-9 h-10 text-sm font-semibold bg-background ${errors.price ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                <span className="absolute right-3 text-xs text-muted-foreground">.00</span>
              </div>
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <FormLabel htmlFor="listDate">List Date</FormLabel>
                <Input
                  id="listDate"
                  type="date"
                  {...register("listDate", { onChange: () => clearErrors("listDate") })}
                  className={`h-10 text-sm bg-background ${errors.listDate ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.listDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.listDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <FormLabel htmlFor="expirationDate">Expiration Date</FormLabel>
                <Input
                  id="expirationDate"
                  type="date"
                  {...register("expirationDate", { onChange: () => clearErrors("expirationDate") })}
                  className={`h-10 text-sm bg-background ${errors.expirationDate ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
                {...register("anticipatedLaunchDate", { onChange: () => clearErrors("anticipatedLaunchDate") })}
                className="h-10 text-sm bg-background"
              />
            </div>

            <div className="space-y-1">
              <FormLabel required htmlFor="listingOfficeId">Listing Office</FormLabel>
              <Input
                id="listingOfficeId"
                type="text"
                list="office-suggestions"
                {...register("listingOfficeId", { onChange: () => clearErrors("listingOfficeId") })}
                placeholder="off-la-01"
                className={`h-10 text-sm bg-background font-mono ${errors.listingOfficeId ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.listingOfficeId && (
                <p className="text-red-500 text-xs mt-1">{errors.listingOfficeId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <FormLabel required htmlFor="listingAgentId">Listing Agent</FormLabel>
              <Input
                id="listingAgentId"
                type="text"
                list="agent-suggestions"
                {...register("listingAgentId", { onChange: () => clearErrors("listingAgentId") })}
                placeholder="Agent ID or Name"
                className={`h-10 text-sm bg-background font-mono ${errors.listingAgentId ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errors.listingAgentId && (
                <p className="text-red-500 text-xs mt-1">{errors.listingAgentId.message}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ─── PROPERTY FEATURES ─────────────────────────────────────────── */}
      <Card className="p-5 space-y-4 border-border bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Property Features</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {selectedFeatures.length} Features Selected
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-3" />
            <Input
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              placeholder="Search Features (Pool, Quartz Countertops, Waterfront)..."
              className="pl-9 h-10 text-xs bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeatures.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border border-primary shadow-xs"
                      : "bg-muted/60 text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {feat} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ─── DESCRIPTION SECTION ───────────────────────────────────────── */}
      <Card className="p-5 space-y-4 border-border bg-card">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileEdit className="size-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Listing Descriptions</h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">Audit Overlap Engine</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <FormLabel htmlFor="shortDesc">Short Description (Marketing Hook)</FormLabel>
            <Input
              id="shortDesc"
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief overview summary for syndication cards..."
              className="h-10 text-sm bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <FormLabel required htmlFor="fullDesc">Full Listing Description</FormLabel>

            {/* Rich Text Toolbar */}
            <div className="rounded-t-lg border border-border bg-muted/40 p-1.5 flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("**", "**")}
                className="h-7 px-2 text-xs"
                title="Bold"
              >
                <Bold className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("*", "*")}
                className="h-7 px-2 text-xs"
                title="Italic"
              >
                <Italic className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("<u>", "</u>")}
                className="h-7 px-2 text-xs"
                title="Underline"
              >
                <Underline className="size-3.5" />
              </Button>
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("# ")}
                className="h-7 px-2 text-xs"
                title="Heading 1"
              >
                <Heading1 className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("## ")}
                className="h-7 px-2 text-xs"
                title="Heading 2"
              >
                <Heading2 className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("- ")}
                className="h-7 px-2 text-xs"
                title="Bullet List"
              >
                <List className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting("[", "](https://)")}
                className="h-7 px-2 text-xs"
                title="Link"
              >
                <LinkIcon className="size-3.5" />
              </Button>
            </div>

            {/* Description Textarea */}
            <textarea
              id="fullDesc"
              ref={textareaRef}
              rows={5}
              value={fullDesc}
              onChange={(e) => {
                setFullDesc(e.target.value);
                setValue("description", e.target.value);
              }}
              placeholder="Enter full comprehensive MLS listing remarks and property description..."
              className="w-full rounded-b-lg border border-t-0 border-border bg-background p-3 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* ─── PROPERTY PHOTOS (Source of Truth Photo Arrangement) ─────── */}
      <Card className="p-5 space-y-4 border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Property Photos &amp; Sequence Order</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              The order established here represents the authoritative MLS photo arrangement used to detect drift against external portals.
            </p>
          </div>

          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
            {photos.length} Photos in Sequence
          </Badge>
        </div>

        {/* Photo Upload & Add Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="url"
              placeholder="Paste photo image URL (e.g. https://images.unsplash.com/...)..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPhoto())}
              className="h-10 text-xs bg-background"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddPhoto}
            disabled={!newPhotoUrl.trim()}
            className="text-xs gap-1.5 shrink-0"
          >
            <Plus className="size-3.5" /> Add URL
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 h-10 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs">
              <Plus className="size-3.5" /> Upload Images
            </span>
          </label>
        </div>

        {/* Photo Sequence Grid */}
        {photos.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground text-xs">
            No photos added yet. Add URLs or upload image files above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="group relative rounded-xl border border-border bg-card p-2.5 space-y-2 shadow-xs hover:border-primary/50 transition-all"
              >
                <div className="aspect-video rounded-lg overflow-hidden relative bg-muted/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Property Photo ${photo.order}`}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />

                  {/* Position Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-md text-foreground text-[10px] font-mono font-bold border border-border">
                    #{photo.order} {photo.order === 1 && "★ Primary"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMovePhoto(index, "left")}
                      className="size-7 text-muted-foreground hover:text-foreground"
                      title="Move Left in Sequence"
                    >
                      <ArrowLeftIcon className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === photos.length - 1}
                      onClick={() => handleMovePhoto(index, "right")}
                      className="size-7 text-muted-foreground hover:text-foreground"
                      title="Move Right in Sequence"
                    >
                      <ArrowRightIcon className="size-3" />
                    </Button>
                    {index !== 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetPrimary(index)}
                        className="size-7 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                        title="Make Primary Photo"
                      >
                        <Star className="size-3" />
                      </Button>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePhoto(index)}
                    className="size-7 text-destructive hover:bg-destructive/10"
                    title="Delete Photo"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── FORM ACTIONS ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack} className="text-xs gap-1.5">
              <ArrowLeft className="size-3.5" /> Back to Step 1
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/listings")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setValue("status", "pending");
              handleSubmit(handleFormSubmit)();
            }}
            className="text-xs"
          >
            Save as Draft / Pending
          </Button>
          <Button type="submit" className="text-xs gap-2 shadow-md">
            <Save className="size-3.5" />
            {isEditMode ? "Update Authoritative MLS Listing" : "Create Authoritative MLS Listing"}
          </Button>
        </div>
      </div>
    </form>
  );
}
