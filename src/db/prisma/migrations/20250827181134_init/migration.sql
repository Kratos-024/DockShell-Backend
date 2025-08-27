/*
  Warnings:

  - You are about to drop the column `levelNo` on the `ctf_claimed` table. All the data in the column will be lost.
  - You are about to drop the column `ctfName` on the `ctf_progress` table. All the data in the column will be lost.
  - You are about to drop the `CTFS` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `levels` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[progressId,levelId]` on the table `ctf_claimed` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,ctfId]` on the table `ctf_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `levelId` to the `ctf_claimed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progressId` to the `ctf_claimed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ctfId` to the `ctf_progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ctf_claimed" DROP CONSTRAINT "ctf_claimed_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ctf_progress" DROP CONSTRAINT "ctf_progress_id_fkey";

-- DropIndex
DROP INDEX "public"."ctf_progress_userId_ctfName_key";

-- AlterTable
ALTER TABLE "public"."ctf_claimed" DROP COLUMN "levelNo",
ADD COLUMN     "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "levelId" TEXT NOT NULL,
ADD COLUMN     "progressId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ctf_progress" DROP COLUMN "ctfName",
ADD COLUMN     "ctfId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."CTFS";

-- DropTable
DROP TABLE "public"."levels";

-- CreateTable
CREATE TABLE "public"."ctfs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ctfs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ctf_levels" (
    "id" TEXT NOT NULL,
    "levelNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "commands" TEXT[],
    "hints" TEXT[],
    "links" TEXT[],
    "files" TEXT,
    "expectedOutput" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL,
    "category" "public"."Category" NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ctfId" TEXT NOT NULL,

    CONSTRAINT "ctf_levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ctfs_name_key" ON "public"."ctfs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ctf_levels_ctfId_levelNo_key" ON "public"."ctf_levels"("ctfId", "levelNo");

-- CreateIndex
CREATE UNIQUE INDEX "ctf_claimed_progressId_levelId_key" ON "public"."ctf_claimed"("progressId", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "ctf_progress_userId_ctfId_key" ON "public"."ctf_progress"("userId", "ctfId");

-- AddForeignKey
ALTER TABLE "public"."ctf_levels" ADD CONSTRAINT "ctf_levels_ctfId_fkey" FOREIGN KEY ("ctfId") REFERENCES "public"."ctfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ctf_progress" ADD CONSTRAINT "ctf_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ctf_progress" ADD CONSTRAINT "ctf_progress_ctfId_fkey" FOREIGN KEY ("ctfId") REFERENCES "public"."ctfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ctf_claimed" ADD CONSTRAINT "ctf_claimed_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."ctf_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ctf_claimed" ADD CONSTRAINT "ctf_claimed_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "public"."ctf_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
