/*
  Warnings:

  - Added the required column `ctfName` to the `levels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."levels" ADD COLUMN     "ctfName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."CTFS" (
    "ctfName" TEXT NOT NULL,
    "totalLevels" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CTFS_ctfName_key" ON "public"."CTFS"("ctfName");
