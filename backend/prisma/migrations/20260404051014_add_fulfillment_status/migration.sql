-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentStatus" TEXT NOT NULL DEFAULT 'received',
ADD COLUMN     "trackingNumber" TEXT;
