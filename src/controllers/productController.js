const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductsBySeller,
  addProductImage
} = require('../models/productModel');

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;
    const image_url = req.body.image_url || req.body.imageUrl || (Array.isArray(images) && images[0]);

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const numericStock = stock !== undefined ? parseInt(stock) : 0;
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const product = await createProduct(
      req.user.id,
      name,
      description,
      numericPrice,
      numericStock,
      category,
      image_url
    );

    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await addProductImage(product.id, images[i], i);
      }
    }

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
    if (req.body.price !== undefined) {
      const numericPrice = parseFloat(req.body.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      req.body.price = numericPrice;
    }
    if (req.body.stock !== undefined) {
      const numericStock = parseInt(req.body.stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({ error: 'Stock cannot be negative' });
      }
      req.body.stock = numericStock;
    }

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
