/*
  Warnings:

  - You are about to drop the column `mappedTo` on the `service_categories` table. All the data in the column will be lost.
  - The `skillLevels` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `professional_services` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "professional_services" DROP CONSTRAINT "professional_services_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "professional_services" DROP CONSTRAINT "professional_services_serviceId_fkey";

-- AlterTable
ALTER TABLE "service_categories" DROP COLUMN "mappedTo";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "skillLevels",
ADD COLUMN     "skillLevels" TEXT[];

-- DropTable
DROP TABLE "professional_services";

-- CreateTable
CREATE TABLE "_ProfileToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProfileToService_B_index" ON "_ProfileToService"("B");

-- AddForeignKey
ALTER TABLE "_ProfileToService" ADD CONSTRAINT "_ProfileToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToService" ADD CONSTRAINT "_ProfileToService_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
