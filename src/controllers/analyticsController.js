const {
  getSellerSalesSummary,
  getSellerTopProducts,
  getSellerRecentOrders,
} = require('../models/orderModel');
const { getLowStockProducts } = require('../models/productModel');

const dashboard = async (req, res) => {
  try {
    const summary = await getSellerSalesSummary(req.user.id);
    const topProducts = await getSellerTopProducts(req.user.id);
    const recentOrders = await getSellerRecentOrders(req.user.id);
    const lowStock = await getLowStockProducts(req.user.id);

    res.json({
      summary,
      topProducts,
      recentOrders,
      lowStockCount: lowStock.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { dashboard };
