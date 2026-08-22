const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductsBySeller,
} = require('../models/productModel');

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await createProduct(
      req.user.id,
      name,
      description,
      price,
      stock || 0,
      category,
      imageUrl
    );

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.user.id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found or not yours to edit' });
    }
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    const product = await deleteProduct(req.params.id, req.user.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found or not yours to delete' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const myProducts = async (req, res) => {
  try {
    const products = await getProductsBySeller(req.user.id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const lowStockAlerts = async (req, res) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : 5;
    const products = await getLowStockProducts(req.user.id, threshold);
    res.json({ threshold, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addProduct, listProducts, getProduct, editProduct, removeProduct, lowStockAlerts, myProducts };
