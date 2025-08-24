-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('filEexploration', 'crypto', 'binary', 'forensics', 'web', 'network');

-- CreateTable
CREATE TABLE "public"."Level" (
    "uniqueId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "commands" TEXT[],
    "hints" TEXT[],
    "files" TEXT,
    "expectedOutput" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL,
    "category" "public"."Category" NOT NULL,
    "solutionSteps" TEXT,
    "estimatedTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_uniqueId_key" ON "public"."Level"("uniqueId");
