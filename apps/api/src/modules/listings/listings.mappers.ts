import { Listing as PrismaListing, ListingPhoto, Agent } from "@prisma/client";
import { Listing, Photo, Address } from "@real-estate/types";

type ListingWithRelations = PrismaListing & {
  photos: ListingPhoto[];
  listingAgent?: Agent;
};

/**
 * Maps a Prisma Listing row to the frontend ListingSchema shape.
 * This is the canonical adapter — all listing responses flow through here.
 */
export function mapListing(
  row: ListingWithRelations
): Listing {
  const address: Address = {
    street: row.street,
    city: row.city,
    state: row.state,
    zip: row.zip,
  };

  const photos: Photo[] = row.photos
    .sort((a, b) => a.position - b.position)
    .map((p) => ({
      url: p.url,
      order: p.position,
    }));

  return {
    id: row.id,
    mlsNumber: row.mlsNumber,
    address,
    addressLine2: row.addressLine2 ?? undefined,
    price: Number(row.price),
    status: row.status as Listing["status"],
    listingAgentId: row.listingAgentId,
    description: row.description,
    legalDescription: row.legalDescription,
    mapCoordinates: {
      lat: row.lat ? Number(row.lat) : 0,
      lng: row.lng ? Number(row.lng) : 0,
    },
    photos,
    features: row.features,
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),

    // Extended fields
    subdivision: row.subdivision ?? undefined,
    propertyType: row.propertyType,
    propertyStyle: row.propertyStyle,
    beds: row.beds,
    fullBaths: row.fullBaths,
    halfBaths: row.halfBaths ?? undefined,
    buildingAreaSqft: row.buildingAreaSqft ? Number(row.buildingAreaSqft) : undefined,
    lotSizeAcres: row.lotSizeAcres ? Number(row.lotSizeAcres) : undefined,
    yearBuilt: row.yearBuilt ?? undefined,
    parkingPlaces: row.parkingPlaces ?? undefined,
    newConstruction: row.newConstruction,
    listingType: row.listingType,
    listDate: row.listDate.toISOString(),
    expirationDate: row.expirationDate.toISOString(),
    anticipatedLaunchDate: row.anticipatedLaunchDate?.toISOString() ?? undefined,
    listingOfficeId: row.listingOfficeId,
  };
}

export function mapListings(rows: ListingWithRelations[]): Listing[] {
  return rows.map(mapListing);
}
