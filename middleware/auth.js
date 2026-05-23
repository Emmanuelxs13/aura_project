function getCartCount(cart) {
  if (!Array.isArray(cart)) {
    return 0;
  }

  return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function attachAuthContext(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.cartCount = getCartCount(req.session.cart);
  res.locals.isAdmin = [
    "Administrator",
    "Admin",
    "Operador",
    "Auditor",
  ].includes(req.session.user?.role);
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect(
      `/login?returnTo=${encodeURIComponent(req.originalUrl)}`,
    );
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect(
      `/login?returnTo=${encodeURIComponent(req.originalUrl)}`,
    );
  }

  if (
    !["Administrator", "Admin", "Operador", "Auditor"].includes(
      req.session.user.role,
    )
  ) {
    return res.status(403).send("Acceso restringido al panel administrativo.");
  }

  return next();
}

module.exports = {
  attachAuthContext,
  requireAuth,
  requireAdmin,
  getCartCount,
};
