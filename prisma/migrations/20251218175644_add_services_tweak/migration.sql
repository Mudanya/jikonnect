-- AlterTable
ALTER TABLE "service_categories" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "slug" DROP NOT NULL;
