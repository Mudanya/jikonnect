/*
  Warnings:

  - The values [SUPER_ADMIN] on the enum `ConversationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConversationType_new" AS ENUM ('ADMIN', 'CLIENT', 'PROVIDER');
ALTER TABLE "admin_conversations" ALTER COLUMN "userType" TYPE "ConversationType_new" USING ("userType"::text::"ConversationType_new");
ALTER TABLE "admin_messages" ALTER COLUMN "senderType" TYPE "ConversationType_new" USING ("senderType"::text::"ConversationType_new");
ALTER TYPE "ConversationType" RENAME TO "ConversationType_old";
ALTER TYPE "ConversationType_new" RENAME TO "ConversationType";
DROP TYPE "public"."ConversationType_old";
COMMIT;
