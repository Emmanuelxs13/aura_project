const {
  getRevenueByMonth,
  getTopProducts,
  getCategoryMix,
  getStoreSummary,
} = require("../models/storeModel");

async function renderAnalytics(req, res, next) {
  try {
    const [sales, topProducts, categoryMix, summary] = await Promise.all([
      getRevenueByMonth(),
      getTopProducts(),
      getCategoryMix(),
      getStoreSummary(),
    ]);

    res.render("analytics", {
      sales,
      topProducts,
      categoryMix,
      summary,
      pageTitle: "Analytics | Aura Store",
    });
  } catch (error) {
    next(error);
  }
}

async function getValuationReport(req, res, next) {
  try {
    const data = await getRevenueByMonth();
    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderAnalytics,
  getValuationReport,
};
