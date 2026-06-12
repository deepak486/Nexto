-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT,
    "orderId" TEXT,
    "orderName" TEXT DEFAULT '',
    "orderDate" DATETIME,
    "status" TEXT DEFAULT '',
    "subtotal" TEXT DEFAULT '',
    "tax" TEXT DEFAULT '',
    "total" TEXT DEFAULT '',
    "currency" TEXT DEFAULT '',
    "shipName" TEXT DEFAULT '',
    "shipAddress" TEXT DEFAULT '',
    "lineItems" JSONB DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Invoice" ("createdAt", "id", "orderId", "orderName", "shop") SELECT "createdAt", "id", "orderId", "orderName", "shop" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
