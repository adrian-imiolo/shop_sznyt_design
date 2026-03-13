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
        imageUrl: "https://placehold.co/800x1000/2a2420/FAFAF8?text=Studio",
        lifestyleImageUrl:
          "https://placehold.co/800x1000/4a3f35/FAFAF8?text=Lifestyle",
        stock: 10,
      },
      {
        name: "Ramka Corner Cut",
        tagline: "Minimalizm w każdym detalu.",
        description:
          "Dębowa rama z charakterystycznymi nacięciami na narożnikach, w które wpuszczono kontrastowy materiał. Połączenie drewna i wyraźnego detalu na rogach tworzy subtelny, nowoczesny akcent bez zbędnej ozdobności.",
        price: 349,
        imageUrl: "https://placehold.co/800x1000/1a1a1a/FAFAF8?text=Studio",
        lifestyleImageUrl:
          "https://placehold.co/800x1000/2d2d2d/FAFAF8?text=Lifestyle",
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
