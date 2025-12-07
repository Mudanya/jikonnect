/*
  Warnings:

  - You are about to drop the column `location` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_locationId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "location",
ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locationId";

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
