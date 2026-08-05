-- DropForeignKey
ALTER TABLE "ImageUpload" DROP CONSTRAINT "ImageUpload_uploadedBy_fkey";

-- AlterTable
ALTER TABLE "ImageUpload" ALTER COLUMN "uploadedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ImageUpload" ADD CONSTRAINT "ImageUpload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
