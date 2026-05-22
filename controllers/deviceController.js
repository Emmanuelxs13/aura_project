const { getAllDevices } = require("../models/deviceModel");

async function renderHome(req, res, next) {
  try {
    const devices = await getAllDevices();
    res.render("index", { devices, pageTitle: "Aura | Apple-style inventory" });
  } catch (error) {
    next(error);
  }
}

async function renderDashboard(req, res, next) {
  try {
    const devices = await getAllDevices();
    res.render("dashboard", { devices, pageTitle: "Dashboard | Aura" });
  } catch (error) {
    next(error);
  }
}

async function renderDevicesPage(req, res, next) {
  try {
    const category =
      typeof req.query.category === "string" ? req.query.category : "";
    const devices = await getAllDevices(category);
    res.render("devices/index", {
      devices,
      category,
      pageTitle: "Devices | Aura",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderHome,
  renderDashboard,
  renderDevicesPage,
};
