-- CreateTable
CREATE TABLE "Invoice" (
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
