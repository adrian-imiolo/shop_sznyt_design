import express from "express";

/**
 * Products routes (issue #108): public catalog reads, admin-only CRUD and
 * reorder. Failures propagate to the shared serverError middleware (issue
 * #115) — Express 5 forwards rejected async handlers automatically.
 *
 * @param {object} deps
 * @param {object} deps.prisma
 * @param {{ requireAuth: Function }} deps.auth
 * @param {Function} deps.requireAdmin
 */
export function createProductsRouter({ prisma, auth, requireAdmin }) {
  const router = express.Router();

  router.get("/products", async function listProducts(req, res) {
    const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
    res.json(products);
  });

  // registered before /:id so a future PATCH /products/:id can't shadow it —
  // today nothing else answers PATCH, so behavior is unchanged
  router.patch(
    "/products/reorder",
    auth.requireAuth(),
    requireAdmin,
    async function reorderProducts(req, res) {
      const updates = req.body;
      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          prisma.product.update({ where: { id }, data: { sortOrder } })
        )
      );
      res.json({ ok: true });
    },
  );

  router.get("/products/:id", async function getProduct(req, res) {
    const id = Number(req.params.id);
    const singleProduct = await prisma.product.findUnique({ where: { id } });
    if (!singleProduct) return res.status(404).json({ error: "Nie znaleziono produktu" });
    res.json(singleProduct);
  });

  router.post(
    "/products",
    auth.requireAuth(),
    requireAdmin,
    async function createProduct(req, res) {
      const { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock } = req.body;
      const product = await prisma.product.create({
        data: { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock },
      });
      res.json(product);
    },
  );

  router.put(
    "/products/:id",
    auth.requireAuth(),
    requireAdmin,
    async function updateProduct(req, res) {
      const { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock } = req.body;
      const id = Number(req.params.id);
      const updated = await prisma.product.update({
        where: { id },
        data: { name, tagline, description, price, imageUrl, lifestyleImageUrl, stock },
      });
      res.json(updated);
    },
  );

  router.delete(
    "/products/:id",
    auth.requireAuth(),
    requireAdmin,
    async function deleteProduct(req, res) {
      const id = Number(req.params.id);
      const deleted = await prisma.product.delete({ where: { id } });
      res.json(deleted);
    },
  );

  return router;
}
