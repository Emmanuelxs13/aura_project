const {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByIds,
  getSuggestedProducts,
  createProductRecord,
  createOrderFromCart,
  getOrdersByUser,
  getStoreSummary,
  getAdminOverview,
  getAdminUsers,
  getAdminInventory,
} = require("../models/storeModel");
const {
  createUser,
  updateUserRole,
  updateUserStatus,
} = require("../models/authModel");
const deviceModel = require("../models/deviceModel");
const auditModel = require("../models/auditModel");

const ADMIN_ROLES = ["Admin", "Operador", "Auditor", "Administrator"];
const USER_ROLES = [...ADMIN_ROLES, "Customer"];
const USER_STATUSES = ["Active", "Suspended"];

function normalizeQuantity(value) {
  const quantity = Number.parseInt(String(value || "1"), 10);
  if (Number.isNaN(quantity) || quantity < 1) {
    return 1;
  }

  return Math.min(quantity, 99);
}

function getSessionCart(req) {
  if (!Array.isArray(req.session.cart)) {
    req.session.cart = [];
  }

  return req.session.cart;
}

function updateSessionCart(req, cart) {
  req.session.cart = cart;
  return cart;
}

function buildCartSummary(cartEntries, products) {
  const productMap = new Map(products.map((product) => [product.id, product]));

  const items = cartEntries
    .map((entry) => {
      const product = productMap.get(Number(entry.productId));
      if (!product) {
        return null;
      }

      const quantity = normalizeQuantity(entry.quantity);
      const lineTotal = Number(product.price) * quantity;

      return { product, quantity, lineTotal };
    })
    .filter(Boolean);

  const totals = items.reduce(
    (accumulator, item) => {
      accumulator.quantity += item.quantity;
      accumulator.amount += item.lineTotal;
      return accumulator;
    },
    { quantity: 0, amount: 0 },
  );

  return { items, totals };
}

async function renderHome(req, res, next) {
  try {
    const [featuredProducts, summary] = await Promise.all([
      getFeaturedProducts(4),
      getAdminOverview(),
    ]);

    res.render("index", {
      featuredProducts,
      summary: summary.summary,
      pageTitle: "Aura Store | Apple-inspired ecommerce",
    });
  } catch (error) {
    next(error);
  }
}

async function renderCatalog(req, res, next) {
  try {
    const category =
      typeof req.query.category === "string" ? req.query.category : "";
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const products = await getProducts({ category, search });

    res.render("devices/index", {
      products,
      category,
      search,
      pageTitle: "Shop | Aura Store",
    });
  } catch (error) {
    next(error);
  }
}

async function renderProductDetail(req, res, next) {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).render("index", {
        featuredProducts: [],
        summary: {},
        pageTitle: "Producto no encontrado | Aura Store",
      });
    }

    const recommendations = (await getProducts({ category: product.category }))
      .filter((item) => item.id !== product.id)
      .slice(0, 3);

    res.render("product", {
      product,
      recommendations,
      pageTitle: `${product.name} | Aura Store`,
    });
  } catch (error) {
    next(error);
  }
}

async function renderCart(req, res, next) {
  try {
    const { items, totals } = await getCartViewData(req);

    res.render("cart", {
      items,
      totals,
      checkoutError: null,
      orderCreated: null,
      pageTitle: "Bag | Aura Store",
    });
  } catch (error) {
    next(error);
  }
}

async function getCartViewData(req) {
  const cart = getSessionCart(req);
  const products = await getProductsByIds(
    cart.map((item) => Number(item.productId)),
  );
  return buildCartSummary(cart, products);
}

async function addToCart(req, res, next) {
  try {
    const productId = Number(req.body.productId || req.body.product_id);
    const quantity = normalizeQuantity(req.body.quantity);

    if (Number.isNaN(productId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Producto invalido." });
    }

    const cart = getSessionCart(req);
    const existing = cart.find(
      (entry) => Number(entry.productId) === productId,
    );

    if (existing) {
      existing.quantity = Math.min(
        99,
        normalizeQuantity(existing.quantity) + quantity,
      );
    } else {
      cart.push({ productId, quantity });
    }

    updateSessionCart(req, cart);

    if (String(req.headers.accept || "").includes("application/json")) {
      return res.status(200).json({
        status: "success",
        cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      });
    }

    return res.redirect("/cart");
  } catch (error) {
    next(error);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const quantity = normalizeQuantity(req.body.quantity);
    const cart = getSessionCart(req);
    const existing = cart.find(
      (entry) => Number(entry.productId) === productId,
    );

    if (existing) {
      existing.quantity = quantity;
    }

    updateSessionCart(req, cart);
    return res.redirect("/cart");
  } catch (error) {
    next(error);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const cart = getSessionCart(req).filter(
      (entry) => Number(entry.productId) !== productId,
    );
    updateSessionCart(req, cart);
    return res.redirect("/cart");
  } catch (error) {
    next(error);
  }
}

async function checkout(req, res, next) {
  try {
    const cart = getSessionCart(req);
    if (cart.length === 0) {
      return res.redirect("/cart");
    }

    const { items, totals } = await getCartViewData(req);

    if (items.length === 0) {
      req.session.cart = [];
      return res.redirect("/cart");
    }

    const shippingName = String(
      req.session.user?.name || req.body.shippingName || "",
    ).trim();
    const shippingEmail = String(
      req.session.user?.email || req.body.shippingEmail || "",
    ).trim();
    const shippingAddress = String(req.body.shippingAddress || "").trim();

    if (!shippingName || !shippingEmail || !shippingAddress) {
      return res.status(400).render("cart", {
        items,
        totals,
        orderCreated: null,
        checkoutError:
          "Completa nombre, correo y direccion para finalizar la compra.",
        pageTitle: "Checkout incompleto | Aura Store",
      });
    }

    const order = await createOrderFromCart({
      userId: req.session.user?.id ?? null,
      shippingName,
      shippingEmail,
      shippingAddress,
      items,
    });

    req.session.cart = [];
    return res.render("cart", {
      items: [],
      totals: { quantity: 0, amount: 0 },
      orderCreated: order.order,
      checkoutError: null,
      pageTitle: "Checkout completado | Aura Store",
    });
  } catch (error) {
    if (error.code === "OUT_OF_STOCK") {
      const { items, totals } = await getCartViewData(req);
      return res.status(409).render("cart", {
        items,
        totals,
        orderCreated: null,
        checkoutError: `Stock insuficiente para: ${error.detail || "uno o mas productos"}`,
        pageTitle: "Stock agotado | Aura Store",
      });
    }

    next(error);
  }
}

async function searchCatalog(req, res, next) {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const products = await getSuggestedProducts(query, 6);

    return res.status(200).json({
      status: "success",
      items: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        tagline: product.tagline,
        price: product.price,
        stock: product.stock,
        colorway: product.colorway,
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function renderDashboard(req, res, next) {
  try {
    const [orders, products, overview] = await Promise.all([
      getOrdersByUser(req.session.user.id),
      getProducts(),
      getAdminOverview(),
    ]);

    res.render("dashboard", {
      orders,
      products,
      overview: overview.summary,
      pageTitle: "Dashboard | Aura Store",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdmin(req, res, next) {
  try {
    const overview = await getAdminOverview();
    const recentActivity = (overview.recentActivity || []).map((item) => ({
      ...item,
      when: new Date(item.created_at).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }));
    res.render("admin", {
      overview: {
        ...overview,
        recentActivity,
      },
      pageTitle: "Admin | Aura Store",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdminUsers(req, res, next) {
  try {
    const [summary, users] = await Promise.all([
      getStoreSummary(),
      getAdminUsers(),
    ]);

    res.render("admin/users", {
      summary,
      users,
      roleOptions: USER_ROLES,
      statusOptions: USER_STATUSES,
      pageTitle: "Usuarios | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function createAdminUser(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim();
    const role = String(req.body.role || "Customer").trim();
    const status = String(req.body.status || "Active").trim();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).redirect("/admin/users?error=missing");
    }

    if (!USER_ROLES.includes(role)) {
      return res.status(400).redirect("/admin/users?error=role");
    }

    if (!USER_STATUSES.includes(status)) {
      return res.status(400).redirect("/admin/users?error=status");
    }

    const createdUser = await createUser({
      name,
      email,
      role,
      status,
      password,
    });
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "create_user",
        "user",
        createdUser.id,
        JSON.stringify({ name, email, role, status }),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect("/admin/users?created=1");
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).redirect("/admin/users?error=exists");
    }
    next(error);
  }
}

async function changeAdminUserRole(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const role = String(req.body.role || "").trim();

    if (!Number.isFinite(userId) || !USER_ROLES.includes(role)) {
      return res.status(400).redirect("/admin/users?error=role");
    }

    await updateUserRole(userId, role);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "change_user_role",
        "user",
        userId,
        JSON.stringify({ role }),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect("/admin/users?updated=role");
  } catch (error) {
    next(error);
  }
}

async function changeAdminUserStatus(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const status = String(req.body.status || "").trim();

    if (!Number.isFinite(userId) || !USER_STATUSES.includes(status)) {
      return res.status(400).redirect("/admin/users?error=status");
    }

    await updateUserStatus(userId, status);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "change_user_status",
        "user",
        userId,
        JSON.stringify({ status }),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect("/admin/users?updated=status");
  } catch (error) {
    next(error);
  }
}

async function renderAdminInventory(req, res, next) {
  try {
    const [summary, inventory, devices] = await Promise.all([
      getStoreSummary(),
      getAdminInventory(),
      deviceModel.getAllDevices(200),
    ]);

    res.render("admin/inventory", {
      summary,
      inventory,
      devices,
      pageTitle: "Inventario | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdminDevices(req, res, next) {
  try {
    const [summary, devices] = await Promise.all([
      getStoreSummary(),
      deviceModel.getAllDevices(200),
    ]);

    res.render("admin/devices", {
      summary,
      devices,
      pageTitle: "Activos | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function createDevice(req, res, next) {
  try {
    const payload = {
      model_name: String(req.body.model_name || "").trim(),
      category: String(req.body.category || "").trim(),
      serial_number: String(req.body.serial_number || "").trim(),
      status: String(req.body.status || "Available").trim(),
      purchase_price: req.body.purchase_price
        ? Number(req.body.purchase_price)
        : null,
      purchase_date: req.body.purchase_date || null,
      specifications: req.body.specifications
        ? JSON.parse(req.body.specifications)
        : null,
    };

    if (!payload.model_name) {
      return res.status(400).redirect("/admin/devices?error=missing_model");
    }

    const created = await deviceModel.createDevice(payload);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "create_device",
        "device",
        created.id,
        JSON.stringify(payload),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect("/admin/devices?created=1");
  } catch (error) {
    next(error);
  }
}

async function updateDeviceHandler(req, res, next) {
  try {
    const id = Number(req.params.deviceId);
    const patch = {};
    for (const key of [
      "model_name",
      "category",
      "serial_number",
      "status",
      "assigned_to",
      "purchase_price",
      "purchase_date",
    ]) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (req.body.specifications) {
      try {
        patch.specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        patch.specifications = req.body.specifications;
      }
    }

    const updated = await deviceModel.updateDevice(id, patch);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "update_device",
        "device",
        id,
        JSON.stringify(patch),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect(`/admin/devices?updated=${id}`);
  } catch (error) {
    next(error);
  }
}

async function deleteDeviceHandler(req, res, next) {
  try {
    const id = Number(req.params.deviceId);
    const before = await deviceModel.getDeviceById(id);
    await deviceModel.deleteDevice(id);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "delete_device",
        "device",
        id,
        JSON.stringify(before || {}),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect("/admin/devices?deleted=1");
  } catch (error) {
    next(error);
  }
}

async function renderDeviceLogs(req, res, next) {
  try {
    const deviceId = Number(req.params.deviceId);
    const device = await deviceModel.getDeviceById(deviceId);
    if (!device) return res.status(404).send("Dispositivo no encontrado");

    const logs = await deviceModel.getMaintenanceLogs(deviceId);
    res.render("admin/device-logs", {
      device,
      logs,
      pageTitle: `Incidencias - ${device.model_name}`,
    });
  } catch (error) {
    next(error);
  }
}

async function renderDeviceEdit(req, res, next) {
  try {
    const deviceId = Number(req.params.deviceId);
    const device = await deviceModel.getDeviceById(deviceId);
    if (!device) return res.status(404).send("Dispositivo no encontrado");

    res.render("admin/device-edit", {
      device,
      pageTitle: `Editar activo - ${device.model_name}`,
    });
  } catch (error) {
    next(error);
  }
}

async function assignDeviceHandler(req, res, next) {
  try {
    const deviceId = Number(req.params.deviceId);
    const assignee = String(req.body.assignee || "").trim() || null;
    const patch = {
      assigned_to: assignee,
      status: assignee ? "Assigned" : "Available",
    };

    const updated = await deviceModel.updateDevice(deviceId, patch);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "assign_device",
        "device",
        deviceId,
        JSON.stringify({ assigned_to: assignee }),
      );
    } catch (e) {}

    return res.redirect(`/admin/devices?assigned=${deviceId}`);
  } catch (error) {
    next(error);
  }
}

async function createDeviceLog(req, res, next) {
  try {
    const deviceId = Number(req.params.deviceId);
    const payload = {
      device_id: deviceId,
      code: String(req.body.code || `INC-${Date.now()}`).trim(),
      title: String(req.body.title || "").trim(),
      area: String(req.body.area || null),
      maintenance_cost: req.body.maintenance_cost
        ? Number(req.body.maintenance_cost)
        : 0,
      status: String(req.body.status || "Open"),
      notes: String(req.body.notes || null),
    };

    if (!payload.title) {
      return res
        .status(400)
        .redirect(`/admin/devices/${deviceId}/logs?error=missing_title`);
    }

    const createdLog = await deviceModel.createMaintenanceLog(payload);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "create_incident",
        "maintenance_log",
        createdLog.id,
        JSON.stringify(payload),
      );
    } catch (e) {
      // non-fatal
    }
    return res.redirect(`/admin/devices/${deviceId}/logs?created=1`);
  } catch (error) {
    next(error);
  }
}

async function updateMaintenanceLogHandler(req, res, next) {
  try {
    const logId = Number(req.params.logId);
    const patch = {};
    for (const key of [
      "status",
      "title",
      "area",
      "notes",
      "maintenance_cost",
    ]) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    const updated = await deviceModel.updateMaintenanceLog(logId, patch);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "update_incident",
        "maintenance_log",
        logId,
        JSON.stringify(patch),
      );
    } catch (e) {}

    return res.redirect(
      req.get("Referrer") || `/admin/support?updated=${logId}`,
    );
  } catch (error) {
    next(error);
  }
}

async function deleteMaintenanceLogHandler(req, res, next) {
  try {
    const logId = Number(req.params.logId);
    const before = await deviceModel
      .getMaintenanceLogs(req.params.deviceId)
      .then((rows) => rows.find((r) => r.id === logId));
    await deviceModel.deleteMaintenanceLog(logId);
    try {
      await auditModel.logAction(
        req.session.user?.id,
        "delete_incident",
        "maintenance_log",
        logId,
        JSON.stringify(before || {}),
      );
    } catch (e) {}
    return res.redirect(
      req.get("Referrer") || `/admin/support?deleted=${logId}`,
    );
  } catch (error) {
    next(error);
  }
}

async function renderAdminSupport(req, res, next) {
  try {
    const summary = await getStoreSummary();
    const incidentsRaw = await deviceModel.getRecentMaintenanceLogs(50);
    const incidents = incidentsRaw.map((i) => ({
      id: i.id,
      code: i.code,
      title: i.title,
      area: i.area,
      cost: Number(i.maintenance_cost || 0),
      status: i.status,
      opened: new Date(i.created_at).toLocaleString(),
      device: i.model_name,
    }));

    res.render("admin/support", {
      summary,
      incidents,
      pageTitle: "Soporte | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAudit(req, res, next) {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : null;
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10) || 1);
    const pageSize = Math.min(
      200,
      Math.max(10, Number.parseInt(req.query.pageSize || "50", 10) || 50),
    );
    const offset = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      auditModel.list({ limit: pageSize, offset, q }),
      auditModel.count({ q }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.render("admin/audit", {
      logs,
      page,
      pageSize,
      total,
      totalPages,
      q,
      pageTitle: "Auditoría | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}
// renderAdminSupport is implemented above using real maintenance logs

async function renderAdminSettings(req, res, next) {
  try {
    const summary = await getStoreSummary();
    const settings = [
      {
        label: "Modo de ejecucion",
        value: process.env.NODE_ENV || "development",
      },
      {
        label: "Sesion segura",
        value:
          process.env.NODE_ENV === "production" ? "Activada" : "En pruebas",
      },
      {
        label: "Region operativa",
        value: "Latam Norte",
      },
    ];
    const audit = [
      {
        event: "Actualizacion de politicas de acceso",
        actor: "Aura Admin",
        when: "Hoy 07:42",
      },
      {
        event: "Cambio de rol a Auditor",
        actor: "Mariana Soto",
        when: "Ayer 19:10",
      },
      {
        event: "Backup de base de datos",
        actor: "Sistema",
        when: "May 18",
      },
    ];

    res.render("admin/settings", {
      summary,
      settings,
      audit,
      pageTitle: "Configuracion | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdminDashboardV2(req, res, next) {
  try {
    const overview = await getAdminOverview();
    const summary = overview.summary || {};

    res.render("admin/dashboard", {
      overview,
      summary,
      pageTitle: "Dashboard Ejecutivo | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdminCatalog(req, res, next) {
  try {
    const [summary, inventory] = await Promise.all([
      getStoreSummary(),
      getAdminInventory(),
    ]);

    const collectionCounts = inventory.reduce((accumulator, item) => {
      const category = String(item.category || "").trim();
      if (!category) {
        return accumulator;
      }
      accumulator[category] = (accumulator[category] || 0) + 1;
      return accumulator;
    }, {});

    const productStar = {
      name: "ASUS ROG Strix G16 RTX 4070 Intel i9 32GB RAM 1TB SSD",
      priceCurrent: 2499,
      priceBefore: 2899,
      stockNotice: "Solo quedan 5 unidades disponibles",
      badges: ["🔥 Más vendido", "⚡ Oferta limitada", "🚀 Envío gratis"],
      specs: [
        ["Procesador", "Intel Core i9"],
        ["GPU", "NVIDIA RTX 4070"],
        ["Memoria", "32GB DDR5"],
        ["Almacenamiento", "1TB SSD NVMe"],
        ["Pantalla", '16" 240Hz'],
        ["Conectividad", "Wi-Fi 6E · Thunderbolt · USB-C"],
      ],
    };

    res.render("admin/catalog", {
      summary,
      inventory,
      collectionCounts,
      productStar,
      pageTitle: "Catálogo | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdminCmsLanding(req, res, next) {
  try {
    const landingBlocks = {
      hero: {
        title: "Tecnología que eleva tu universo digital",
        subtitle:
          "Aura Store reúne hardware, diseño y velocidad en una experiencia clara y premium.",
      },
      benefits: ["Envíos rápidos", "Pagos protegidos", "Garantía oficial"],
      formula: {
        problem: "Comprar tecnología se siente disperso y lento.",
        solution: "Aura centraliza catálogo, soporte y checkout.",
        benefit: "La decisión se vuelve clara y segura.",
        result: "Más conversión y mejor ticket promedio.",
      },
      categories: [
        "Laptops",
        "Smartphones",
        "Gaming",
        "Accesorios",
        "Smart Home",
      ],
      brand: "Compra con claridad. Vende con precisión. Escala con Aura.",
      newsletter:
        "Recibe lanzamientos, acceso anticipado y ofertas seleccionadas.",
    };

    res.render("admin/cms-landing", {
      landingBlocks,
      pageTitle: "CMS Landing | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function renderAdminMarketing(req, res, next) {
  try {
    const campaigns = {
      ads: [
        {
          label: "Facebook / Instagram Ads 1",
          title: "Tu próximo setup empieza aquí",
          body: "Hardware premium, entrega rápida y una experiencia de compra tan precisa como tu próximo upgrade.",
        },
        {
          label: "Facebook / Instagram Ads 2",
          title: "Potencia real para trabajo y gaming",
          body: "Descubre equipos que combinan diseño limpio, rendimiento y confianza operativa en un solo lugar.",
        },
      ],
      welcomeEmail: {
        subject: "Bienvenido a Aura Store 🚀",
        body: "Hola, gracias por unirte a Aura. Aquí encontrarás hardware premium, soporte claro y una experiencia pensada para decidir rápido.",
      },
      cartEmail: {
        subject: "Tu próximo setup todavía te está esperando 👀",
        body: "Todavía puedes retomar tu compra. Tu carrito sigue disponible con la configuración que elegiste y un equipo listo para enviarse.",
      },
    };

    res.render("admin/marketing", {
      campaigns,
      pageTitle: "Marketing | Aura Admin",
    });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = req.body || {};
    const created = await createProductRecord(product);
    return res.redirect(`/admin?created=${encodeURIComponent(created.slug)}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderHome,
  renderCatalog,
  searchCatalog,
  renderProductDetail,
  renderCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  checkout,
  renderDashboard,
  renderAdmin,
  renderAdminUsers,
  renderAdminInventory,
  renderAdminSupport,
  renderAdminSettings,
  renderAdminDashboardV2,
  renderAdminCatalog,
  renderAdminCmsLanding,
  renderAdminMarketing,
  renderAdminDevices,
  createDevice,
  updateDeviceHandler,
  deleteDeviceHandler,
  renderDeviceEdit,
  assignDeviceHandler,
  renderDeviceLogs,
  createDeviceLog,
  updateMaintenanceLogHandler,
  deleteMaintenanceLogHandler,
  createAdminUser,
  changeAdminUserRole,
  changeAdminUserStatus,
  renderAudit,
  createProduct,
};
