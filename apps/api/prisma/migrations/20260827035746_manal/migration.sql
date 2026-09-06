-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('active', 'pending', 'sold', 'withdrawn');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Single Family', 'Condo / Townhouse', 'Multi-Family', 'Commercial', 'Land', 'Other');

-- CreateEnum
CREATE TYPE "CrossPostPreference" AS ENUM ('all', 'byRequest', 'never', 'areaAndPrice');

-- CreateEnum
CREATE TYPE "OfficeState" AS ENUM ('LA', 'MS', 'AL');

-- CreateEnum
CREATE TYPE "SyndicationSite" AS ENUM ('realtor', 'zillow', 'homes', 'redfin', 'sothebysRealty', 'crescentSothebys', 'mansionsGlobal', 'lacdb', 'google');

-- CreateEnum
CREATE TYPE "ExternalPlatform" AS ENUM ('ZILLOW', 'REALTOR', 'LACDB', 'HOMES', 'REDFIN', 'SOTHEBYS_REALTY', 'CRESCENT_SOTHEBYS', 'MANSIONS_GLOBAL', 'GOOGLE', 'OTHER');

-- CreateEnum
CREATE TYPE "DiscrepancyField" AS ENUM ('price', 'address', 'description', 'mapCoordinates', 'photos', 'legalDescription', 'beds', 'fullBaths', 'halfBaths', 'squareFeet', 'status', 'agent', 'lotSize', 'propertyType', 'not_found');

-- CreateEnum
CREATE TYPE "DiscrepancyStatus" AS ENUM ('open', 'in_progress', 'resolved', 'ignored');

-- CreateEnum
CREATE TYPE "DiscrepancyAction" AS ENUM ('status_change', 'reopened', 'note_added', 'photo_approved', 'ignored', 'manual_resolution');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('superAdmin', 'employee');

-- CreateEnum
CREATE TYPE "AuditRunStatus" AS ENUM ('pending', 'running', 'completed', 'partial', 'failed');

-- CreateTable
CREATE TABLE "listing_offices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "OfficeState" NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "officeState" "OfficeState" NOT NULL,
    "serviceAreas" TEXT[],
    "facebookPageUrl" TEXT,
    "instagramPageUrl" TEXT,
    "crossPostPreference" "CrossPostPreference" NOT NULL DEFAULT 'byRequest',
    "priceRangeMin" DECIMAL(12,2),
    "priceRangeMax" DECIMAL(12,2),
    "bio" TEXT,
    "licenseNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "mlsNumber" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "propertyType" TEXT NOT NULL,
    "propertyStyle" TEXT NOT NULL,
    "subdivision" TEXT,
    "beds" INTEGER NOT NULL DEFAULT 0,
    "fullBaths" INTEGER NOT NULL DEFAULT 0,
    "halfBaths" INTEGER,
    "buildingAreaSqft" DECIMAL(10,2),
    "lotSizeAcres" DECIMAL(10,4),
    "yearBuilt" INTEGER,
    "parkingPlaces" INTEGER,
    "newConstruction" BOOLEAN NOT NULL DEFAULT false,
    "listingType" TEXT NOT NULL,
    "features" TEXT[],
    "description" TEXT NOT NULL,
    "legalDescription" TEXT NOT NULL,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "listDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "anticipatedLaunchDate" TIMESTAMP(3),
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "mlsSource" TEXT,
    "approvedPhotoArrangementHash" TEXT,
    "listingAgentId" TEXT NOT NULL,
    "listingOfficeId" TEXT NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "hash" TEXT,
    "source" TEXT NOT NULL DEFAULT 'client',
    "caption" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approved_photo_arrangements" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "site" "SyndicationSite" NOT NULL,
    "platform" "ExternalPlatform",
    "fingerprint" TEXT NOT NULL,
    "photoCount" INTEGER NOT NULL,
    "photoUrls" JSONB,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "approved_photo_arrangements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_snapshots" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "site" "SyndicationSite" NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(12,2),
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "description" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "photos" JSONB,
    "sourceUrl" TEXT NOT NULL,

    CONSTRAINT "site_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_snapshot_histories" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "site" "SyndicationSite" NOT NULL,
    "auditRunId" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(12,2),
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "description" TEXT,
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "photos" JSONB,
    "sourceUrl" TEXT,

    CONSTRAINT "site_snapshot_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_listings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "platform" "ExternalPlatform" NOT NULL,
    "externalId" TEXT,
    "listingUrl" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "price" DECIMAL(12,2),
    "bedrooms" INTEGER,
    "fullBaths" INTEGER,
    "halfBaths" INTEGER,
    "squareFeet" DECIMAL(10,2),
    "lotSize" TEXT,
    "propertyType" TEXT,
    "status" TEXT,
    "description" TEXT,
    "agentName" TEXT,
    "rawData" JSONB NOT NULL,
    "matchConfidence" INTEGER,
    "matchedBy" TEXT,
    "matchingSignals" JSONB,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discrepancies" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "site" "SyndicationSite" NOT NULL,
    "field" "DiscrepancyField" NOT NULL,
    "sourceValue" TEXT NOT NULL,
    "siteValue" TEXT NOT NULL,
    "status" "DiscrepancyStatus" NOT NULL DEFAULT 'open',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "discrepancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discrepancy_notes" (
    "id" TEXT NOT NULL,
    "discrepancyId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discrepancy_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discrepancy_history" (
    "id" TEXT NOT NULL,
    "discrepancyId" TEXT NOT NULL,
    "changedBy" TEXT,
    "action" "DiscrepancyAction" NOT NULL DEFAULT 'status_change',
    "fromStatus" "DiscrepancyStatus",
    "toStatus" "DiscrepancyStatus",
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discrepancy_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL DEFAULT 'employee',
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_runs" (
    "id" TEXT NOT NULL,
    "platform" "ExternalPlatform",
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "AuditRunStatus" NOT NULL DEFAULT 'pending',
    "listingsProcessed" INTEGER NOT NULL DEFAULT 0,
    "listingsMatched" INTEGER NOT NULL DEFAULT 0,
    "listingsUnmatched" INTEGER NOT NULL DEFAULT 0,
    "discrepanciesFound" INTEGER NOT NULL DEFAULT 0,
    "discrepanciesCreated" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "errorLog" JSONB,

    CONSTRAINT "audit_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE INDEX "agents_officeState_idx" ON "agents"("officeState");

-- CreateIndex
CREATE UNIQUE INDEX "listings_mlsNumber_key" ON "listings"("mlsNumber");

-- CreateIndex
CREATE INDEX "listings_mlsNumber_idx" ON "listings"("mlsNumber");

-- CreateIndex
CREATE INDEX "listings_city_idx" ON "listings"("city");

-- CreateIndex
CREATE INDEX "listings_state_idx" ON "listings"("state");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_listingAgentId_idx" ON "listings"("listingAgentId");

-- CreateIndex
CREATE INDEX "listing_photos_listingId_idx" ON "listing_photos"("listingId");

-- CreateIndex
CREATE INDEX "approved_photo_arrangements_listingId_site_idx" ON "approved_photo_arrangements"("listingId", "site");

-- CreateIndex
CREATE UNIQUE INDEX "approved_photo_arrangements_listingId_site_fingerprint_key" ON "approved_photo_arrangements"("listingId", "site", "fingerprint");

-- CreateIndex
CREATE INDEX "site_snapshots_site_idx" ON "site_snapshots"("site");

-- CreateIndex
CREATE UNIQUE INDEX "site_snapshots_listingId_site_key" ON "site_snapshots"("listingId", "site");

-- CreateIndex
CREATE INDEX "site_snapshot_histories_listingId_site_idx" ON "site_snapshot_histories"("listingId", "site");

-- CreateIndex
CREATE INDEX "site_snapshot_histories_capturedAt_idx" ON "site_snapshot_histories"("capturedAt");

-- CreateIndex
CREATE INDEX "site_snapshot_histories_auditRunId_idx" ON "site_snapshot_histories"("auditRunId");

-- CreateIndex
CREATE INDEX "external_listings_platform_idx" ON "external_listings"("platform");

-- CreateIndex
CREATE INDEX "external_listings_externalId_idx" ON "external_listings"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "external_listings_listingId_platform_key" ON "external_listings"("listingId", "platform");

-- CreateIndex
CREATE INDEX "discrepancies_listingId_idx" ON "discrepancies"("listingId");

-- CreateIndex
CREATE INDEX "discrepancies_site_idx" ON "discrepancies"("site");

-- CreateIndex
CREATE INDEX "discrepancies_status_idx" ON "discrepancies"("status");

-- CreateIndex
CREATE INDEX "discrepancies_active_idx" ON "discrepancies"("active");

-- CreateIndex
CREATE INDEX "discrepancy_notes_discrepancyId_idx" ON "discrepancy_notes"("discrepancyId");

-- CreateIndex
CREATE INDEX "discrepancy_history_discrepancyId_idx" ON "discrepancy_history"("discrepancyId");

-- CreateIndex
CREATE INDEX "discrepancy_history_changedAt_idx" ON "discrepancy_history"("changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_accountType_idx" ON "users"("accountType");

-- CreateIndex
CREATE INDEX "audit_runs_status_idx" ON "audit_runs"("status");

-- CreateIndex
CREATE INDEX "audit_runs_startedAt_idx" ON "audit_runs"("startedAt");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_listingAgentId_fkey" FOREIGN KEY ("listingAgentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_listingOfficeId_fkey" FOREIGN KEY ("listingOfficeId") REFERENCES "listing_offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approved_photo_arrangements" ADD CONSTRAINT "approved_photo_arrangements_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_snapshots" ADD CONSTRAINT "site_snapshots_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_snapshot_histories" ADD CONSTRAINT "site_snapshot_histories_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_listings" ADD CONSTRAINT "external_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancies" ADD CONSTRAINT "discrepancies_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_notes" ADD CONSTRAINT "discrepancy_notes_discrepancyId_fkey" FOREIGN KEY ("discrepancyId") REFERENCES "discrepancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_history" ADD CONSTRAINT "discrepancy_history_discrepancyId_fkey" FOREIGN KEY ("discrepancyId") REFERENCES "discrepancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
