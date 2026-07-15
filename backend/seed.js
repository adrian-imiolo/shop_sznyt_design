import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await prisma.product.deleteMany();
  await prisma.$executeRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1`;

  await prisma.product.createMany({
    data: [
      {
        name: "Ramka Szachownica",
        tagline: "Dwa kolory, jeden charakter.",
        description:
          "Rama wykonana z litego dębu, w której naprzemienne kwadraty jasnego i ciemnego drewna tworzą wzór szachownicy. Każdy element precyzyjnie dopasowany — kontrast kolorów nadaje jej wyrazisty, a zarazem ponadczasowy charakter.",
        price: 299,
        // Relative — deployment-agnostic; checkout prefixes FRONTEND_URL for Stripe
        imageUrl: "/images/szachownica-studio-v2.webp",
        lifestyleImageUrl: "/images/szachownica-lifestyle.webp",
        stock: 10,
      },
      {
        name: "Ramka Corner Cut",
        tagline: "Minimalizm w każdym detalu.",
        description:
          "Dębowa rama z charakterystycznymi nacięciami na narożnikach, w które wpuszczono kontrastowy materiał. Połączenie drewna i wyraźnego detalu na rogach tworzy subtelny, nowoczesny akcent bez zbędnej ozdobności.",
        price: 349,
        imageUrl: "/images/corner-cut-studio-v2.webp",
        lifestyleImageUrl: "/images/corner-cut-lifestyle.webp",
        stock: 8,
      },
    ],
  });

  console.log("Seeded 2 products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
