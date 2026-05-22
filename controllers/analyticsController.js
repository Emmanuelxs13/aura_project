const {
  getValuationAnalytics,
  getRotationAnalytics,
} = require("../models/deviceModel");

async function renderAnalytics(req, res, next) {
  try {
    const [valuation, rotation] = await Promise.all([
      getValuationAnalytics(),
      getRotationAnalytics(),
    ]);

    res.render("analytics", {
      valuation,
      rotation,
      pageTitle: "Analytics | Aura",
    });
  } catch (error) {
    next(error);
  }
}

async function getValuationReport(req, res, next) {
  try {
    const data = await getValuationAnalytics();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderAnalytics,
  getValuationReport,
};
