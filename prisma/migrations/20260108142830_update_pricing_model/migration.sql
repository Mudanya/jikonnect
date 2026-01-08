/*
  Warnings:

  - The values [CUSTOM] on the enum `PricingType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PricingType_new" AS ENUM ('HOURLY', 'FIXED', 'PER_UNIT');
ALTER TABLE "public"."Booking" ALTER COLUMN "pricingType" DROP DEFAULT;
ALTER TABLE "public"."Profile" ALTER COLUMN "defaultPricingType" DROP DEFAULT;
ALTER TABLE "public"."services" ALTER COLUMN "pricingType" DROP DEFAULT;
ALTER TABLE "Profile" ALTER COLUMN "defaultPricingType" TYPE "PricingType_new" USING ("defaultPricingType"::text::"PricingType_new");
ALTER TABLE "Booking" ALTER COLUMN "pricingType" TYPE "PricingType_new" USING ("pricingType"::text::"PricingType_new");
ALTER TABLE "services" ALTER COLUMN "pricingType" TYPE "PricingType_new" USING ("pricingType"::text::"PricingType_new");
ALTER TYPE "PricingType" RENAME TO "PricingType_old";
ALTER TYPE "PricingType_new" RENAME TO "PricingType";
DROP TYPE "public"."PricingType_old";
ALTER TABLE "Booking" ALTER COLUMN "pricingType" SET DEFAULT 'HOURLY';
ALTER TABLE "Profile" ALTER COLUMN "defaultPricingType" SET DEFAULT 'HOURLY';
ALTER TABLE "services" ALTER COLUMN "pricingType" SET DEFAULT 'HOURLY';
COMMIT;
