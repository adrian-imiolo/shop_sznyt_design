-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddress" JSONB,
ADD COLUMN     "shippingMethod" TEXT;
