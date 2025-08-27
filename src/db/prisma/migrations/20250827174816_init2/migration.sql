-- CreateTable
CREATE TABLE "public"."ctfClaimed" (
    "id" TEXT NOT NULL,
    "levelNo" INTEGER NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "ctfClaimed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CtfProgress" (
    "id" TEXT NOT NULL,
    "ctfName" TEXT NOT NULL,

    CONSTRAINT "CtfProgress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ctfClaimed" ADD CONSTRAINT "ctfClaimed_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."CtfProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CtfProgress" ADD CONSTRAINT "CtfProgress_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
