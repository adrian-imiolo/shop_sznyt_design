/**
 * Shared tail error handler (issue #115). Express 5 forwards rejected async
 * handlers here automatically, so routes no longer wrap their bodies in the
 * try/catch → 500 boilerplate; the canonical 500 shape lives in one place.
 *
 * Routes that map specific errors to other statuses (webhook signature → 400,
 * checkout email_invalid → 400) still do so locally and rethrow the rest.
 */
export function serverError(err, req, res, next) {
  // Mid-stream failure: the status line is already on the wire, so delegate
  // to Express's default handler, which closes the connection.
  if (res.headersSent) return next(err);
  console.error(err);
  res.status(500).json({ error: "Błąd serwera" });
}
