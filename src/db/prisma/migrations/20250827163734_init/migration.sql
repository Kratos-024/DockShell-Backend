/*
  Warnings:

  - Added the required column `LastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "LastName" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL;
