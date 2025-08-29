/*
  Warnings:

  - Added the required column `difficulty` to the `CTFS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imgSrc` to the `CTFS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subHeader` to the `CTFS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CTFS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `CTFS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPlayers` to the `CTFS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CTFS" ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "imgSrc" TEXT NOT NULL,
ADD COLUMN     "subHeader" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT NOT NULL,
ADD COLUMN     "totalPlayers" INTEGER NOT NULL;
