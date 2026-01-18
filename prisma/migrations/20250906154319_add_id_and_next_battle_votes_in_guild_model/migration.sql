/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Guild" ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nextBattleVotes" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "public"."Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "public"."Guild"("id");

-- CreateIndex
CREATE INDEX "Guild_id_idx" ON "public"."Guild"("id");
