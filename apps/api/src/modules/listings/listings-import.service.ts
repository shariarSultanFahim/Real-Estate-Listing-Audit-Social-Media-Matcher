import * as XLSX from "xlsx";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

export interface ImportOptions {
  autoResolveSold?: boolean;
}

export interface ImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  soldOrWithdrawn: number;
  resolvedDiscrepancies: number;
  errors: Array<{ row: number; mlsNumber?: string; error: string }>;
  details: Array<{ mlsNumber: string; address: string; action: "created" | "updated" | "skipped"; status: string }>;
}

/**
 * Clean & extract numeric price from string like "$259,000", "$1.2M", "259000.00"
 */
function cleanPrice(val: any): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (!val) return 0;
  const str = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Clean & extract numeric integer
 */
function cleanInt(val: any, defaultVal = 0): number {
  if (typeof val === "number" && !isNaN(val)) return Math.floor(val);
  if (!val) return defaultVal;
  const str = String(val).replace(/[^0-9]/g, "");
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Clean & extract decimal number (e.g. sqft, acreage)
 */
function cleanDecimal(val: any): number | undefined {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (!val) return undefined;
  const str = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? undefined : num;
}

/**
 * Normalize status string to Prisma ListingStatus ("active" | "pending" | "sold" | "withdrawn")
 */
function normalizeStatus(val: any): "active" | "pending" | "sold" | "withdrawn" {
  if (!val) return "active";
  const s = String(val).trim().toLowerCase();
  if (s.includes("sold") || s.includes("closed") || s === "sld") {
    return "sold";
  }
  if (
    s.includes("withdraw") ||
    s.includes("cancel") ||
    s.includes("expire") ||
    s.includes("terminate") ||
    s.includes("off market")
  ) {
    return "withdrawn";
  }
  if (s.includes("pend") || s.includes("contract") || s.includes("contingent") || s === "pnd") {
    return "pending";
  }
  return "active";
}

/**
 * Parse a raw row from Excel/CSV/JSON supporting flexible column headers
 */
export function normalizeListingRow(row: Record<string, any>) {
  // Helper to find first matching key in row
  const getVal = (...keys: string[]): any => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
        return row[key];
      }
      // Case-insensitive match fallback
      const foundKey = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === key.toLowerCase()
      );
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== "") {
        return row[foundKey];
      }
    }
    return undefined;
  };

  const rawMls = getVal("MLS ID", "MLS ID:", "MLS Number", "MLS#", "MLS", "mlsNumber", "mls_number", "id");
  const mlsNumber = rawMls ? String(rawMls).trim() : "";

  const street = String(
    getVal("Listing Address", "Street Address", "Address", "Street", "street") || "Property Address"
  ).trim();

  const city = String(getVal("City", "city") || "New Orleans").trim();
  const rawState = String(getVal("State", "state") || "LA").trim().toUpperCase();
  const state = ["LA", "MS", "AL"].includes(rawState) ? rawState : "LA";
  const zip = String(getVal("ZIP code", "Zip code", "Zip Code", "ZIP", "Zip", "zip") || "70112").trim();

  const price = cleanPrice(getVal("Price", "Listing Price", "price", "List Price"));
  const beds = cleanInt(getVal("Bedrooms", "Beds", "Bed", "bedrooms", "beds"), 0);
  const fullBaths = cleanInt(getVal("Full Bath", "Full Baths", "Baths", "fullBaths", "full_baths"), 0);
  const halfBaths = cleanInt(getVal("Half Bath", "Half Baths", "halfBaths", "half_baths"), 0);

  const buildingAreaSqft = cleanDecimal(
    getVal("Square Footage", "Sqft", "Square Feet", "buildingAreaSqft", "Sq. Ft.")
  );
  const lotSizeAcres = cleanDecimal(
    getVal("Lot Size", "Lot Size Acres", "Acreage", "lotSizeAcres", "Lot Size (Acres)")
  );

  const propertyType = String(
    getVal("Property Type", "PropertyType", "propertyType", "Type") || "Single Family"
  ).trim();

  const propertyStyle = String(
    getVal("Property Style", "Property Subtype", "propertyStyle", "Style") || propertyType || "Traditional"
  ).trim();

  const status = normalizeStatus(getVal("ListingStatus", "Listing Status", "Status", "status", "State"));

  const description = String(
    getVal("Description", "Remarks", "Public Remarks", "description") ||
      `Beautiful ${propertyType} property located at ${street}, ${city}, ${state} ${zip}.`
  ).trim();

  const agentName = String(
    getVal("Agent Information", "Agent Name", "Listing Agent", "Agent", "agent") || ""
  ).trim();

  const rawPhotos = getVal("Photos/photo URLs", "Photos", "Photo URLs", "Photo URL", "photos", "Photo");
  let photos: string[] = [];
  if (Array.isArray(rawPhotos)) {
    photos = rawPhotos.map((p) => (typeof p === "string" ? p : p.url)).filter(Boolean);
  } else if (typeof rawPhotos === "string" && rawPhotos.trim()) {
    // Can be comma or pipe separated, or single URL
    photos = rawPhotos
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http://") || s.startsWith("https://"));
  }

  const mlsSource = String(getVal("MLS Source", "MLS", "mlsSource") || "NOMAR MLS").trim();

  return {
    mlsNumber,
    street,
    city,
    state,
    zip,
    price,
    beds,
    fullBaths,
    halfBaths,
    buildingAreaSqft,
    lotSizeAcres,
    propertyType,
    propertyStyle,
    status,
    description,
    agentName,
    photos,
    mlsSource,
  };
}

/**
 * Match or create an agent
 */
async function resolveAgent(agentName: string, state: string): Promise<string> {
  const allAgents = await prisma.agent.findMany();

  if (!agentName) {
    if (allAgents.length > 0) return allAgents[0].id;
    // Create fallback agent
    const newAgent = await prisma.agent.create({
      data: {
        name: "Brokerage Agent",
        email: "brokerage.agent@cresentsothebys.com",
        officeState: (state as any) || "LA",
        serviceAreas: ["New Orleans", "Covington"],
        crossPostPreference: "all",
      },
    });
    return newAgent.id;
  }

  // Normalize string for fuzzy match: strip punctuation, extra spaces
  const cleanInput = agentName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const matched = allAgents.find((a) => {
    const cleanDbName = a.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      cleanDbName === cleanInput ||
      cleanDbName.includes(cleanInput) ||
      cleanInput.includes(cleanDbName)
    );
  });

  if (matched) return matched.id;

  // Create new Agent for this listing
  const emailSlug =
    agentName.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".") +
    "@cresentsothebys.com";

  try {
    const createdAgent = await prisma.agent.create({
      data: {
        name: agentName,
        email: emailSlug,
        officeState: (state as any) || "LA",
        serviceAreas: ["New Orleans", "Mandeville", "Covington"],
        crossPostPreference: "all",
      },
    });
    return createdAgent.id;
  } catch {
    // In case email already exists or collision, find first agent
    return allAgents.length > 0 ? allAgents[0].id : "agent-default";
  }
}

/**
 * Resolve office by state
 */
async function resolveOffice(state: string): Promise<string> {
  const offices = await prisma.listingOffice.findMany();
  const matched = offices.find((o) => o.state === state);
  if (matched) return matched.id;
  if (offices.length > 0) return offices[0].id;

  // Create default office if none
  const newOffice = await prisma.listingOffice.create({
    data: {
      name: "Crescent Sotheby's — Louisiana",
      state: "LA",
      address: "1400 Canal Street, New Orleans, LA 70112",
      phone: "(504) 555-0100",
      email: "la@cresentsothebys.com",
    },
  });
  return newOffice.id;
}

/**
 * Parse an uploaded file buffer (XLSX, XLS, CSV)
 */
export function parseSpreadsheetBuffer(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
}

/**
 * Generate standard sample template in CSV or XLSX format
 */
export function generateTemplate(format: "csv" | "xlsx"): Buffer {
  const sampleData = [
    {
      "MLS ID": "2589001",
      "Listing Address": "123 South Oak Street",
      "City": "New Orleans",
      "State": "LA",
      "ZIP code": "70112",
      "Price": "$350,000",
      "Bedrooms": 3,
      "Full Bath": 2,
      "Half Bath": 1,
      "Square Footage": 1850,
      "Lot Size": "0.25 Acres",
      "Property Type": "Single Family",
      "ListingStatus": "Active",
      "Description": "Charming historic residence with modern upgrades, tall ceilings, and private courtyard.",
      "Agent Information": "Liz Baer, J.D.",
      "Photos/photo URLs": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000",
      "MLS Source": "NOMAR MLS",
    },
    {
      "MLS ID": "2589002",
      "Listing Address": "450 Magnolia Avenue",
      "City": "Covington",
      "State": "LA",
      "ZIP code": "70433",
      "Price": "$675,000",
      "Bedrooms": 4,
      "Full Bath": 3,
      "Half Bath": 1,
      "Square Footage": 3100,
      "Lot Size": "1.2 Acres",
      "Property Type": "Single Family",
      "ListingStatus": "Active",
      "Description": "Stunning luxury estate with oak trees, chef's kitchen, and covered outdoor patio.",
      "Agent Information": "Puddy Robinson",
      "Photos/photo URLs": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000",
      "MLS Source": "NOMAR MLS",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Listings");

  if (format === "csv") {
    const csvStr = XLSX.utils.sheet_to_csv(ws);
    return Buffer.from(csvStr, "utf-8");
  }

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

/**
 * Bulk import listings from parsed rows with upsert, status sync, and auto-resolution of sold listings
 */
export async function bulkImportListings(
  rows: any[],
  options: ImportOptions = { autoResolveSold: true }
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    total: rows.length,
    created: 0,
    updated: 0,
    soldOrWithdrawn: 0,
    resolvedDiscrepancies: 0,
    errors: [],
    details: [],
  };

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const rowNum = idx + 1;

    try {
      const normalized = normalizeListingRow(row);

      if (!normalized.mlsNumber) {
        result.errors.push({
          row: rowNum,
          error: "Missing MLS ID or MLS Number.",
        });
        continue;
      }

      const agentId = await resolveAgent(normalized.agentName, normalized.state);
      const officeId = await resolveOffice(normalized.state);

      // Check if listing already exists
      const existing = await prisma.listing.findUnique({
        where: { mlsNumber: normalized.mlsNumber },
        include: { discrepancies: true },
      });

      const isSoldOrWithdrawn =
        normalized.status === "sold" || normalized.status === "withdrawn";

      if (isSoldOrWithdrawn) {
        result.soldOrWithdrawn++;
      }

      if (existing) {
        // UPDATE existing listing
        await prisma.listing.update({
          where: { id: existing.id },
          data: {
            street: normalized.street,
            city: normalized.city,
            state: normalized.state,
            zip: normalized.zip,
            price: new Prisma.Decimal(normalized.price),
            status: normalized.status,
            beds: normalized.beds,
            fullBaths: normalized.fullBaths,
            halfBaths: normalized.halfBaths,
            buildingAreaSqft:
              normalized.buildingAreaSqft != null
                ? new Prisma.Decimal(normalized.buildingAreaSqft)
                : undefined,
            lotSizeAcres:
              normalized.lotSizeAcres != null
                ? new Prisma.Decimal(normalized.lotSizeAcres)
                : undefined,
            propertyType: normalized.propertyType,
            propertyStyle: normalized.propertyStyle,
            description: normalized.description,
            mlsSource: normalized.mlsSource,
            listingAgentId: agentId,
            listingOfficeId: officeId,
            lastUpdatedAt: new Date(),
          },
        });

        // Update photos if provided
        if (normalized.photos.length > 0) {
          await prisma.listingPhoto.deleteMany({ where: { listingId: existing.id } });
          await prisma.listingPhoto.createMany({
            data: normalized.photos.map((url, pIdx) => ({
              listingId: existing.id,
              url,
              position: pIdx + 1,
              source: "client",
            })),
          });
        }

        // Auto-resolve open discrepancies if listing sold or withdrawn
        if (isSoldOrWithdrawn && options.autoResolveSold !== false) {
          const resolveUpdate = await prisma.discrepancy.updateMany({
            where: {
              listingId: existing.id,
              status: { in: ["open", "in_progress"] },
            },
            data: {
              status: "resolved",
              active: false,
              resolvedAt: new Date(),
              note: `Auto-resolved: Listing marked as "${normalized.status}" in Brokerage Engine sync.`,
            },
          });
          result.resolvedDiscrepancies += resolveUpdate.count;
        }

        result.updated++;
        result.details.push({
          mlsNumber: normalized.mlsNumber,
          address: `${normalized.street}, ${normalized.city}, ${normalized.state}`,
          action: "updated",
          status: normalized.status,
        });
      } else {
        // CREATE new listing
        const newListing = await prisma.listing.create({
          data: {
            mlsNumber: normalized.mlsNumber,
            street: normalized.street,
            city: normalized.city,
            state: normalized.state,
            zip: normalized.zip,
            price: new Prisma.Decimal(normalized.price),
            status: normalized.status,
            beds: normalized.beds,
            fullBaths: normalized.fullBaths,
            halfBaths: normalized.halfBaths,
            buildingAreaSqft:
              normalized.buildingAreaSqft != null
                ? new Prisma.Decimal(normalized.buildingAreaSqft)
                : undefined,
            lotSizeAcres:
              normalized.lotSizeAcres != null
                ? new Prisma.Decimal(normalized.lotSizeAcres)
                : undefined,
            propertyType: normalized.propertyType,
            propertyStyle: normalized.propertyStyle,
            listingType: "Residential Sales",
            description: normalized.description,
            legalDescription: "Authoritative MLS recorded parcel",
            mlsSource: normalized.mlsSource,
            listDate: new Date(),
            expirationDate: new Date(Date.now() + 180 * 86400000),
            listingAgentId: agentId,
            listingOfficeId: officeId,
            photos: {
              create: (normalized.photos.length > 0
                ? normalized.photos
                : [
                    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000",
                  ]
              ).map((url, pIdx) => ({
                url,
                position: pIdx + 1,
                source: "client",
              })),
            },
          },
        });

        result.created++;
        result.details.push({
          mlsNumber: normalized.mlsNumber,
          address: `${normalized.street}, ${normalized.city}, ${normalized.state}`,
          action: "created",
          status: normalized.status,
        });
      }
    } catch (err: any) {
      result.errors.push({
        row: rowNum,
        error: err.message || "Unknown error processing row",
      });
    }
  }

  return result;
}
