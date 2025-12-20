/*
  Warnings:

  - A unique constraint covering the columns `[panVat]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_panVat_key" ON "Company"("panVat");
