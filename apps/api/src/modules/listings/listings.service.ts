import { prisma } from "../../prisma";
import { createError } from "../../middleware/errorHandler";
import { mapListing, mapListings } from "./listings.mappers";
import { Listing } from "@real-estate/types";
import { Prisma } from "@prisma/client";

const LISTING_INCLUDE = {
  photos: true,
  listingAgent: true,
} as const;

// ─── Queries ─────────────────────────────────────────────────

export async function findAll(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    include: LISTING_INCLUDE,
    orderBy: { lastUpdatedAt: "desc" },
  });
  return mapListings(rows);
}

export async function findById(id: string): Promise<Listing> {
  const row = await prisma.listing.findUnique({
    where: { id },
    include: LISTING_INCLUDE,
  });
  if (!row) throw createError(`Listing ${id} not found`, 404);
  return mapListing(row);
}

export async function findByMlsNumber(mlsNumber: string): Promise<Listing | null> {
  const row = await prisma.listing.findUnique({
    where: { mlsNumber },
    include: LISTING_INCLUDE,
  });
  if (!row) return null;
  return mapListing(row);
}

// ─── Mutations ───────────────────────────────────────────────

export interface CreateListingInput {
  mlsNumber: string;
  street?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  price: number;
  status?: "active" | "pending" | "sold" | "withdrawn";
  propertyType: string;
  propertyStyle: string;
  subdivision?: string;
  beds?: number;
  fullBaths?: number;
  halfBaths?: number;
  buildingAreaSqft?: number;
  lotSizeAcres?: number;
  yearBuilt?: number;
  parkingPlaces?: number;
  newConstruction?: boolean;
  listingType: string;
  description: string;
  legalDescription?: string;
  lat?: number;
  lng?: number;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  features?: string[];
  listDate: string;
  expirationDate: string;
  anticipatedLaunchDate?: string;
  listingAgentId?: string;
  listingOfficeId?: string;
  mlsSource?: string;
  photos?: Array<{ url: string; order: number }>;
}

export async function create(input: CreateListingInput): Promise<Listing> {
  let listingAgentId = input.listingAgentId;
  if (!listingAgentId) {
    const firstAgent = await prisma.agent.findFirst();
    if (!firstAgent) throw createError("No agents found in database", 400);
    listingAgentId = firstAgent.id;
  } else {
    const agent = await prisma.agent.findUnique({ where: { id: listingAgentId } });
    if (!agent) {
      const firstAgent = await prisma.agent.findFirst();
      if (firstAgent) listingAgentId = firstAgent.id;
      else throw createError(`Agent ${listingAgentId} not found`, 404);
    }
  }

  let listingOfficeId = input.listingOfficeId;
  if (!listingOfficeId) {
    const firstOffice = await prisma.listingOffice.findFirst();
    if (!firstOffice) throw createError("No offices found in database", 400);
    listingOfficeId = firstOffice.id;
  } else {
    const office = await prisma.listingOffice.findUnique({ where: { id: listingOfficeId } });
    if (!office) {
      const firstOffice = await prisma.listingOffice.findFirst();
      if (firstOffice) listingOfficeId = firstOffice.id;
      else throw createError(`Office ${listingOfficeId} not found`, 404);
    }
  }

  const street = input.street || input.address?.street || "123 South Oak Street";
  const city = input.city || input.address?.city || "Hammond";
  const state = input.state || input.address?.state || "LA";
  const zip = input.zip || input.address?.zip || "70403";

  const lat = input.lat != null ? input.lat : input.mapCoordinates?.lat;
  const lng = input.lng != null ? input.lng : input.mapCoordinates?.lng;

  const photos = input.photos || [];

  const row = await prisma.listing.create({
    data: {
      mlsNumber: input.mlsNumber,
      street,
      addressLine2: input.addressLine2,
      city,
      state,
      zip,
      subdivision: input.subdivision,
      price: new Prisma.Decimal(input.price),
      status: (input.status as any) || "active",
      propertyType: input.propertyType || "Single Family",
      propertyStyle: input.propertyStyle || "Traditional",
      beds: input.beds ?? 0,
      fullBaths: input.fullBaths ?? 0,
      halfBaths: input.halfBaths,
      buildingAreaSqft: input.buildingAreaSqft != null ? new Prisma.Decimal(input.buildingAreaSqft) : undefined,
      lotSizeAcres: input.lotSizeAcres != null ? new Prisma.Decimal(input.lotSizeAcres) : undefined,
      yearBuilt: input.yearBuilt,
      parkingPlaces: input.parkingPlaces,
      newConstruction: input.newConstruction ?? false,
      listingType: input.listingType || "Residential Sales",
      description: input.description || "",
      legalDescription: input.legalDescription || "LOT 12 SQ 4 SUBDIVISION PH 1",
      lat: lat != null ? new Prisma.Decimal(lat) : undefined,
      lng: lng != null ? new Prisma.Decimal(lng) : undefined,
      listDate: new Date(input.listDate || Date.now()),
      expirationDate: new Date(input.expirationDate || Date.now() + 180 * 86400000),
      anticipatedLaunchDate: input.anticipatedLaunchDate
        ? new Date(input.anticipatedLaunchDate)
        : undefined,
      features: input.features ?? [],
      listingAgentId,
      listingOfficeId,
      mlsSource: input.mlsSource || "Crescent Sotheby's MLS",
      photos: {
        create: photos.map((p, idx) => ({
          url: p.url,
          position: p.order != null ? p.order : idx + 1,
          source: "client",
        })),
      },
    },
    include: LISTING_INCLUDE,
  });

  return mapListing(row);
}

export interface UpdateListingInput {
  price?: number;
  status?: "active" | "pending" | "sold" | "withdrawn";
  description?: string;
  legalDescription?: string;
  features?: string[];
  beds?: number;
  fullBaths?: number;
  halfBaths?: number;
  buildingAreaSqft?: number;
  lotSizeAcres?: number;
  lat?: number;
  lng?: number;
}

export async function update(
  id: string,
  input: UpdateListingInput
): Promise<Listing> {
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) throw createError(`Listing ${id} not found`, 404);

  const row = await prisma.listing.update({
    where: { id },
    data: {
      ...input,
      price: input.price != null ? new Prisma.Decimal(input.price) : undefined,
      buildingAreaSqft: input.buildingAreaSqft != null ? new Prisma.Decimal(input.buildingAreaSqft) : undefined,
      lotSizeAcres: input.lotSizeAcres != null ? new Prisma.Decimal(input.lotSizeAcres) : undefined,
      lat: input.lat != null ? new Prisma.Decimal(input.lat) : undefined,
      lng: input.lng != null ? new Prisma.Decimal(input.lng) : undefined,
    },
    include: LISTING_INCLUDE,
  });

  return mapListing(row);
}
