-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "value" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_guildName_fkey" FOREIGN KEY ("guildName") REFERENCES "Guild"("name") ON DELETE CASCADE ON UPDATE CASCADE;
