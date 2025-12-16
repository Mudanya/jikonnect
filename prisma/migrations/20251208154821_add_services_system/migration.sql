/*
  Warnings:

  - You are about to drop the column `isActive` on the `service_categories` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `services` table. All the data in the column will be lost.
  - You are about to drop the `ProfessionalService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skill_levels` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `service_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `service_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProfessionalService" DROP CONSTRAINT "ProfessionalService_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalService" DROP CONSTRAINT "ProfessionalService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalService" DROP CONSTRAINT "ProfessionalService_skillLevelId_fkey";

-- DropIndex
DROP INDEX "services_name_categoryId_key";

-- AlterTable
ALTER TABLE "service_categories" DROP COLUMN "isActive",
ADD COLUMN     "mappedTo" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "isActive",
ADD COLUMN     "skillLevels" JSONB,
ADD COLUMN     "slug" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProfessionalService";

-- DropTable
DROP TABLE "skill_levels";

-- CreateTable
CREATE TABLE "professional_services" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "skillLevel" TEXT,
    "pricePerHour" DECIMAL(10,2),
    "pricePerDay" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_services_professionalId_serviceId_key" ON "professional_services"("professionalId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- AddForeignKey
ALTER TABLE "professional_services" ADD CONSTRAINT "professional_services_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_services" ADD CONSTRAINT "professional_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
