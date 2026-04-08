-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('viewer', 'analyst', 'admin');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('critical', 'high', 'elevated', 'moderate', 'low', 'minimal');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('state', 'non_state', 'international_org', 'individual');

-- CreateEnum
CREATE TYPE "RiskContribution" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('military', 'diplomatic', 'economic', 'political', 'humanitarian', 'cyber');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('critical', 'high', 'moderate', 'low');

-- CreateEnum
CREATE TYPE "SourceReliability" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ForecastStatus" AS ENUM ('active', 'resolved', 'expired', 'draft');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "EvidenceDirection" AS ENUM ('supporting', 'opposing', 'neutral');

-- CreateEnum
CREATE TYPE "EvidenceWeight" AS ENUM ('strong', 'moderate', 'weak');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "overallRiskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "summary" TEXT NOT NULL,
    "keyTensions" TEXT[],
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "activeEventCount" INTEGER NOT NULL DEFAULT 0,
    "activeForecastCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "overallRiskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "riskCategories" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "capital" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "alertCount" INTEGER NOT NULL DEFAULT 0,
    "activeForecastCount" INTEGER NOT NULL DEFAULT 0,
    "population" BIGINT,
    "gdp" BIGINT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ActorType" NOT NULL,
    "role" TEXT NOT NULL,
    "riskContribution" "RiskContribution" NOT NULL,
    "description" TEXT NOT NULL,
    "affiliations" TEXT[],

    CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeopoliticalEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "severity" "EventSeverity" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "locationDescription" TEXT,
    "impactAssessment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeopoliticalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reliability" "SourceReliability" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" "ForecastStatus" NOT NULL DEFAULT 'active',
    "probability" INTEGER NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "confidenceNotes" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "uncertaintyNotes" TEXT NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT NOT NULL,
    "resolutionCriteria" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastHistoryEntry" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "probability" INTEGER NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "changeReason" TEXT NOT NULL,
    "analystNote" TEXT,

    CONSTRAINT "ForecastHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastEvidence" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "direction" "EvidenceDirection" NOT NULL,
    "weight" "EvidenceWeight" NOT NULL,
    "sourceUrl" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ForecastCountries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ForecastCountries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventCountries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventCountries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CountryActors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventActors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventActors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ForecastEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ForecastEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso2_key" ON "Country"("iso2");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso3_key" ON "Country"("iso3");

-- CreateIndex
CREATE INDEX "_ForecastCountries_B_index" ON "_ForecastCountries"("B");

-- CreateIndex
CREATE INDEX "_EventCountries_B_index" ON "_EventCountries"("B");

-- CreateIndex
CREATE INDEX "_CountryActors_B_index" ON "_CountryActors"("B");

-- CreateIndex
CREATE INDEX "_EventActors_B_index" ON "_EventActors"("B");

-- CreateIndex
CREATE INDEX "_ForecastEvents_B_index" ON "_ForecastEvents"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSource" ADD CONSTRAINT "EventSource_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GeopoliticalEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastHistoryEntry" ADD CONSTRAINT "ForecastHistoryEntry_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastEvidence" ADD CONSTRAINT "ForecastEvidence_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForecastCountries" ADD CONSTRAINT "_ForecastCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForecastCountries" ADD CONSTRAINT "_ForecastCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "Forecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventCountries" ADD CONSTRAINT "_EventCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventCountries" ADD CONSTRAINT "_EventCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "GeopoliticalEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryActors" ADD CONSTRAINT "_CountryActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryActors" ADD CONSTRAINT "_CountryActors_B_fkey" FOREIGN KEY ("B") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventActors" ADD CONSTRAINT "_EventActors_A_fkey" FOREIGN KEY ("A") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventActors" ADD CONSTRAINT "_EventActors_B_fkey" FOREIGN KEY ("B") REFERENCES "GeopoliticalEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForecastEvents" ADD CONSTRAINT "_ForecastEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Forecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ForecastEvents" ADD CONSTRAINT "_ForecastEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "GeopoliticalEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
