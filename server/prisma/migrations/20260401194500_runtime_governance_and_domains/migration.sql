-- AlterTable
ALTER TABLE "SurveyResponse"
ADD COLUMN "purgeAfter" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SurveyRevision" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "label" TEXT,
    "restoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyInsightEvent" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "questionId" TEXT,
    "pageIndex" INTEGER,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyInsightEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "host" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verificationToken" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "sslStatus" TEXT NOT NULL DEFAULT 'pending',
    "faviconUrl" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "headCode" TEXT,
    "bodyCode" TEXT,
    "brandName" TEXT,
    "removeBranding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainRoute" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_host_key" ON "CustomDomain"("host");

-- CreateIndex
CREATE UNIQUE INDEX "DomainRoute_domainId_slug_key" ON "DomainRoute"("domainId", "slug");

-- AddForeignKey
ALTER TABLE "SurveyRevision" ADD CONSTRAINT "SurveyRevision_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyInsightEvent" ADD CONSTRAINT "SurveyInsightEvent_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainRoute" ADD CONSTRAINT "DomainRoute_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "CustomDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainRoute" ADD CONSTRAINT "DomainRoute_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
