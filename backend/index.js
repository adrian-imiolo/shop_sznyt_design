import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import cors from "cors";

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// get single product
app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const singleProduct = await prisma.product.findUnique({
    where: { id },
  });
  res.json(singleProduct);
});

// delete product
app.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleteProduct = await prisma.product.delete({
    where: { id },
  });
  res.json(deleteProduct);
});

//update product
app.put("/products/:id", async (req, res) => {
  const { name, description, price, imageUrl, stock } = req.body;
  const id = Number(req.params.id);
  const update = await prisma.product.update({
    where: { id },
    data: { name, description, price, imageUrl, stock },
  });
  res.json(update);
});

app.post("/products", async (req, res) => {
  const { name, description, price, imageUrl, stock } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price, imageUrl, stock },
  });
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
