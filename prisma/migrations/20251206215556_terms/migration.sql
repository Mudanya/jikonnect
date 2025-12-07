-- CreateTable
CREATE TABLE "Terms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isAccept" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Terms_userId_key" ON "Terms"("userId");

-- AddForeignKey
ALTER TABLE "Terms" ADD CONSTRAINT "Terms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
