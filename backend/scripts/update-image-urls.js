// One-off: point existing products at new image files without reseeding
// (seed.js wipes products and resets stock — never run it against prod).
// Run from backend/: npx tsx scripts/update-image-urls.js
// Against prod: run in the Render shell, or locally with DATABASE_URL set to the prod connection string.
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const updates = [
  { name: "Ramka Szachownica", imageUrl: "/images/szachownica-studio-v2.webp" },
  { name: "Ramka Corner Cut", imageUrl: "/images/corner-cut-studio-v2.webp" },
];

async function main() {
  for (const { name, imageUrl } of updates) {
    const { count } = await prisma.product.updateMany({
      where: { name },
      data: { imageUrl },
    });
    console.log(`${name} -> ${imageUrl} (${count} row)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
