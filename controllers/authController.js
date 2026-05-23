const { findUserByEmail } = require("../models/authModel");
const { verifyPassword } = require("../lib/security");

async function renderLogin(req, res) {
  res.render("login", {
    pageTitle: "Login | Aura Store",
    returnTo:
      typeof req.query.returnTo === "string"
        ? req.query.returnTo
        : "/dashboard",
    error: null,
  });
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");
    const returnTo =
      typeof req.body.returnTo === "string" ? req.body.returnTo : "/dashboard";

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).render("login", {
        pageTitle: "Login | Aura Store",
        returnTo,
        error: "Credenciales invalidas.",
      });
    }

    if (user.status && user.status !== "Active") {
      return res.status(403).render("login", {
        pageTitle: "Login | Aura Store",
        returnTo,
        error: "Tu cuenta esta suspendida. Contacta al administrador.",
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return res.redirect(returnTo || "/dashboard");
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      return res.redirect("/");
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderLogin,
  login,
  logout,
};
