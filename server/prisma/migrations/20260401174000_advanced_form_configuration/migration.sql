-- AlterTable
ALTER TABLE "Survey"
ADD COLUMN "appearance" JSONB,
ADD COLUMN "branding" JSONB,
ADD COLUMN "shareMeta" JSONB,
ADD COLUMN "seo" JSONB,
ADD COLUMN "settings" JSONB,
ADD COLUMN "notifications" JSONB,
ADD COLUMN "retention" JSONB,
ADD COLUMN "hiddenFields" JSONB,
ADD COLUMN "computedFields" JSONB,
ADD COLUMN "automationRules" JSONB,
ADD COLUMN "delivery" JSONB;
