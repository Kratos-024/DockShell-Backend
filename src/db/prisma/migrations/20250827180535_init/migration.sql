/*
  Warnings:

  - You are about to drop the `CtfProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ctfClaimed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CtfProgress" DROP CONSTRAINT "CtfProgress_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ctfClaimed" DROP CONSTRAINT "ctfClaimed_id_fkey";

-- DropTable
DROP TABLE "public"."CtfProgress";

-- DropTable
DROP TABLE "public"."ctfClaimed";

-- CreateTable
CREATE TABLE "public"."ctf_claimed" (
    "id" TEXT NOT NULL,
    "levelNo" INTEGER NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "ctf_claimed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ctf_progress" (
    "id" TEXT NOT NULL,
    "ctfName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ctf_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ctf_progress_userId_ctfName_key" ON "public"."ctf_progress"("userId", "ctfName");

-- AddForeignKey
ALTER TABLE "public"."ctf_claimed" ADD CONSTRAINT "ctf_claimed_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."ctf_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ctf_progress" ADD CONSTRAINT "ctf_progress_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
