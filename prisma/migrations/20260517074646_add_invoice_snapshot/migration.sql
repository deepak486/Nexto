-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderName" TEXT NOT NULL DEFAULT '',
    "orderDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT '',
    "subtotal" TEXT NOT NULL DEFAULT '',
    "tax" TEXT NOT NULL DEFAULT '',
    "total" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "shipName" TEXT NOT NULL DEFAULT '',
    "shipAddress" TEXT NOT NULL DEFAULT '',
    "lineItems" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Invoice" ("createdAt", "id", "orderId", "orderName", "shop") SELECT "createdAt", "id", "orderId", coalesce("orderName", '') AS "orderName", "shop" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
