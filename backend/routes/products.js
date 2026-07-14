import express from "express";

/**
 * Products routes (issue #108): public catalog reads, admin-only CRUD and
 * reorder. Handlers moved verbatim from app.js.
 *
 * @param {object} deps
 * @param {object} deps.prisma
 * @param {{ requireAuth: Function }} deps.auth
 * @param {Function} deps.requireAdmin
 */
export function createProductsRouter({ prisma, auth, requireAdmin }) {
  const router = express.Router();

  router.get("/products", async (req, res) => {
    try {
      const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  // registered before /:id so a future PATCH /products/:id can't shadow it —
  // today nothing else answers PATCH, so behavior is unchanged
  router.patch("/products/reorder", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          prisma.product.update({ where: { id }, data: { sortOrder } })
        )
      );
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.get("/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const singleProduct = await prisma.product.findUnique({ where: { id } });
      if (!singleProduct) return res.status(404).json({ error: "Nie znaleziono produktu" });
      res.json(singleProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.post("/products", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock } = req.body;
      const product = await prisma.product.create({
        data: { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock },
      });
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.put("/products/:id", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock } = req.body;
      const id = Number(req.params.id);
      const updated = await prisma.product.update({
        where: { id },
        data: { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock },
      });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  router.delete("/products/:id", auth.requireAuth(), requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await prisma.product.delete({ where: { id } });
      res.json(deleted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Błąd serwera" });
    }
  });

  return router;
}
