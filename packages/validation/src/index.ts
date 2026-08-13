import { z } from "zod";

export const SyndicationSiteEnum = z.enum([
  "realtor",
  "zillow",
  "homes",
  "redfin",
  "sothebysRealty",
  "crescentSothebys",
  "mansionsGlobal",
  "google",
]);

export const DiscrepancyFieldEnum = z.enum([
  "price",
  "address",
  "description",
  "mapCoordinates",
  "photos",
  "legalDescription",
]);

export const DiscrepancyStatusEnum = z.enum(["open", "resolved", "ignored"]);

export const ListingStatusEnum = z.enum(["active", "pending", "sold", "withdrawn"]);

export const CrossPostPreferenceEnum = z.enum(["all", "byRequest", "never", "areaAndPrice"]);

export const OfficeStateEnum = z.enum(["LA", "MS", "AL"]);

export const UserRoleEnum = z.enum(["admin", "staff"]);

export const AddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
});

export const MapCoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const PhotoSchema = z.object({
  url: z.string().url(),
  order: z.number().int().min(0),
});

export const ListingSchema = z.object({
  id: z.string(),
  mlsNumber: z.string().min(1, "MLS Number is required"),
  address: AddressSchema,
  price: z.number().positive("Price must be positive"),
  status: ListingStatusEnum,
  listingAgentId: z.string(),
  description: z.string(),
  legalDescription: z.string(),
  mapCoordinates: MapCoordinatesSchema,
  photos: z.array(PhotoSchema),
  features: z.array(z.string()),
  lastUpdatedAt: z.string(),

  // Extended fields captured at creation
  addressLine2: z.string().optional(),
  subdivision: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  propertyStyle: z.string().min(1, "Property style is required"),
  beds: z.number().int().nonnegative(),
  fullBaths: z.number().int().nonnegative(),
  halfBaths: z.number().int().nonnegative().optional(),
  buildingAreaSqft: z.number().positive().optional(),
  lotSizeAcres: z.number().positive().optional(),
  yearBuilt: z.number().int().optional(),
  parkingPlaces: z.number().int().optional(),
  newConstruction: z.boolean().default(false),
  listingType: z.string().min(1, "Listing type is required"),
  listDate: z.string(),
  expirationDate: z.string(),
  anticipatedLaunchDate: z.string().optional(),
  listingOfficeId: z.string(),
});

export const SiteSnapshotSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  site: SyndicationSiteEnum,
  fetchedAt: z.string(),
  price: z.number(),
  address: AddressSchema,
  description: z.string(),
  mapCoordinates: MapCoordinatesSchema,
  photos: z.array(PhotoSchema),
  sourceUrl: z.string().url(),
});

export const DiscrepancySchema = z.object({
  id: z.string(),
  listingId: z.string(),
  site: SyndicationSiteEnum,
  field: DiscrepancyFieldEnum,
  sourceValue: z.string(),
  siteValue: z.string(),
  status: DiscrepancyStatusEnum,
  detectedAt: z.string(),
  resolvedAt: z.string().optional(),
  note: z.string().optional(),
});

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Agent name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  officeState: OfficeStateEnum,
  serviceAreas: z.array(z.string()),
  facebookPageUrl: z.string().url().optional().or(z.literal("")),
  instagramPageUrl: z.string().url().optional().or(z.literal("")),
  crossPostPreference: CrossPostPreferenceEnum,
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
});

export const MatchQuerySchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  price: z.number().positive("Price must be positive"),
});

export const MatchResultSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  facebookPageUrl: z.string().optional(),
  instagramPageUrl: z.string().optional(),
  matchReason: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleEnum,
});
