/*
  Warnings:

  - You are about to drop the column `name` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `serialNo` on the `Device` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "customerName" TEXT,
    "phone" TEXT,
    "type" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Serviste',
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Device_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Device" ("brand", "companyId", "createdAt", "id", "model", "status", "updatedAt") SELECT "brand", "companyId", "createdAt", "id", "model", "status", "updatedAt" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
