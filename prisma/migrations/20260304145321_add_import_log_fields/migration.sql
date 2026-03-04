-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DELIVERY', 'MOVING', 'PACKING', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceBidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('DRAFT', 'SHARED', 'BUYER_REVIEW', 'NEEDS_REVISION', 'AGREED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('PENDING', 'PASSED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "city" TEXT,
    "street" TEXT,
    "houseNumber" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "roles" "UserRole"[] DEFAULT ARRAY['BUYER']::"UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceTypes" "ServiceType"[],
    "displayName" TEXT,
    "bio" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isFixedPrice" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "videos" TEXT,
    "category" TEXT,
    "extraData" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationName" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT,
    "listingId" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentDetails" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "itemCondition" TEXT NOT NULL,
    "sellerNotes" TEXT,
    "aiStatus" "AiStatus" NOT NULL DEFAULT 'PENDING',
    "images" TEXT NOT NULL,
    "videos" TEXT,
    "flexibleData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "buyerAgreedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerIp" TEXT,
    "agreedVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "pickupLocation" TEXT,
    "dropoffLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBid" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "status" "ServiceBidStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowLead" (
    "id" TEXT NOT NULL,
    "sellerName" TEXT,
    "sellerLink" TEXT,
    "postText" TEXT,
    "sourceUrl" TEXT,
    "images" TEXT,
    "videos" TEXT,
    "capturedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShadowLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "extraData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParserLog" (
    "id" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "aiParsed" TEXT NOT NULL,
    "userFinal" TEXT,
    "corrections" TEXT,
    "testerNote" TEXT,
    "testerImage" TEXT,
    "testerName" TEXT,
    "category" TEXT,
    "inputMode" TEXT,
    "sessionId" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "quality" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminTaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNote" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaptopCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "type" TEXT,
    "screenSize" TEXT[],
    "cpu" TEXT[],
    "gpu" TEXT[],
    "ram" TEXT[],
    "storage" TEXT[],
    "os" TEXT[],
    "releaseYear" TEXT,
    "notes" TEXT,
    "sku" TEXT,
    "weight" TEXT,
    "ports" TEXT,
    "display" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaptopCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDesktopCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "cpu" TEXT[],
    "gpu" TEXT[],
    "ram" TEXT[],
    "storage" TEXT[],
    "os" TEXT[],
    "releaseYear" TEXT,
    "notes" TEXT,
    "sku" TEXT,
    "ports" TEXT,
    "weight" TEXT,
    "isMini" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandDesktopCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBuildCatalog" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "typicalCpu" TEXT,
    "typicalGpu" TEXT,
    "typicalRam" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomBuildCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AioCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "screenSize" TEXT[],
    "cpu" TEXT[],
    "gpu" TEXT[],
    "ram" TEXT[],
    "storage" TEXT[],
    "os" TEXT[],
    "releaseYear" TEXT,
    "notes" TEXT,
    "sku" TEXT,
    "display" TEXT,
    "ports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AioCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobileCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "hebrewAliases" TEXT[],
    "storages" INTEGER[],
    "screenSize" DOUBLE PRECISION,
    "releaseYear" INTEGER,
    "cpu" TEXT,
    "ramG" INTEGER,
    "os" TEXT,
    "battery" TEXT,
    "rearCamera" TEXT,
    "frontCamera" TEXT,
    "weight" TEXT,
    "nfc" BOOLEAN NOT NULL DEFAULT false,
    "wirelessCharging" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCatalog" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "type" TEXT,
    "fuelType" TEXT,
    "transmission" TEXT,
    "engineSize" TEXT,
    "hp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectronicsCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "hebrewAliases" TEXT[],
    "releaseYear" INTEGER,
    "specs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectronicsCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplianceCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "hebrewAliases" TEXT[],
    "capacity" TEXT,
    "energyRating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplianceCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotherboardCatalog" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "chipset" TEXT,
    "socket" TEXT,
    "formFactor" TEXT,
    "ramType" TEXT,
    "maxRam" TEXT,
    "pcie" TEXT,
    "m2" TEXT,
    "lan" TEXT,
    "wifi" TEXT,
    "releaseYear" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotherboardCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogImportLog" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "totalInFile" INTEGER NOT NULL DEFAULT 0,
    "added" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL,
    "duplicatesInFile" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL,
    "errorDetails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "newTotal" INTEGER NOT NULL DEFAULT 0,
    "adminName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderProfile_userId_key" ON "ServiceProviderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shortId_key" ON "Shipment"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentDetails_shipmentId_key" ON "ShipmentDetails"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_shipmentId_key" ON "Agreement"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_shipmentId_key" ON "ServiceRequest"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "LaptopCatalog_sku_key" ON "LaptopCatalog"("sku");

-- CreateIndex
CREATE INDEX "LaptopCatalog_brand_idx" ON "LaptopCatalog"("brand");

-- CreateIndex
CREATE INDEX "LaptopCatalog_series_idx" ON "LaptopCatalog"("series");

-- CreateIndex
CREATE UNIQUE INDEX "BrandDesktopCatalog_sku_key" ON "BrandDesktopCatalog"("sku");

-- CreateIndex
CREATE INDEX "BrandDesktopCatalog_brand_idx" ON "BrandDesktopCatalog"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "AioCatalog_sku_key" ON "AioCatalog"("sku");

-- CreateIndex
CREATE INDEX "AioCatalog_brand_idx" ON "AioCatalog"("brand");

-- CreateIndex
CREATE INDEX "MobileCatalog_brand_idx" ON "MobileCatalog"("brand");

-- CreateIndex
CREATE INDEX "VehicleCatalog_make_idx" ON "VehicleCatalog"("make");

-- CreateIndex
CREATE INDEX "VehicleCatalog_model_idx" ON "VehicleCatalog"("model");

-- CreateIndex
CREATE INDEX "ElectronicsCatalog_brand_idx" ON "ElectronicsCatalog"("brand");

-- CreateIndex
CREATE INDEX "ElectronicsCatalog_category_idx" ON "ElectronicsCatalog"("category");

-- CreateIndex
CREATE INDEX "ElectronicsCatalog_modelName_idx" ON "ElectronicsCatalog"("modelName");

-- CreateIndex
CREATE INDEX "ApplianceCatalog_brand_idx" ON "ApplianceCatalog"("brand");

-- CreateIndex
CREATE INDEX "ApplianceCatalog_category_idx" ON "ApplianceCatalog"("category");

-- CreateIndex
CREATE INDEX "ApplianceCatalog_modelName_idx" ON "ApplianceCatalog"("modelName");

-- CreateIndex
CREATE INDEX "MotherboardCatalog_brand_idx" ON "MotherboardCatalog"("brand");

-- CreateIndex
CREATE INDEX "MotherboardCatalog_model_idx" ON "MotherboardCatalog"("model");

-- CreateIndex
CREATE UNIQUE INDEX "MotherboardCatalog_brand_model_key" ON "MotherboardCatalog"("brand", "model");

-- CreateIndex
CREATE INDEX "CatalogImportLog_category_idx" ON "CatalogImportLog"("category");

-- CreateIndex
CREATE INDEX "CatalogImportLog_createdAt_idx" ON "CatalogImportLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceProviderProfile" ADD CONSTRAINT "ServiceProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentDetails" ADD CONSTRAINT "ShipmentDetails_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBid" ADD CONSTRAINT "ServiceBid_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBid" ADD CONSTRAINT "ServiceBid_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerRequest" ADD CONSTRAINT "BuyerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTaskComment" ADD CONSTRAINT "AdminTaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AdminTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTaskComment" ADD CONSTRAINT "AdminTaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNote" ADD CONSTRAINT "AdminNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
