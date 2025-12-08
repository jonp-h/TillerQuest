-- CreateEnum
CREATE TYPE "public"."UploadStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."ImageUpload" (
    "id" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "guildName" TEXT,
    "filename" TEXT NOT NULL,
    "fileHash" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."UploadStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "ImageUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImageUpload_status_idx" ON "public"."ImageUpload"("status");

-- AddForeignKey
ALTER TABLE "public"."ImageUpload" ADD CONSTRAINT "ImageUpload_guildName_fkey" FOREIGN KEY ("guildName") REFERENCES "public"."Guild"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageUpload" ADD CONSTRAINT "ImageUpload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageUpload" ADD CONSTRAINT "ImageUpload_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
