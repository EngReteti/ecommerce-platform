const {
  hasPurchasedProduct,
  createReview,
  getReviewsByProduct,
  getProductRatingSummary,
} = require('../models/reviewModel');

const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ error: 'productId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const purchased = await hasPurchasedProduct(req.user.id, productId);
    if (!purchased) {
      return res.status(403).json({ error: 'You can only review products you have purchased' });
    }

    const review = await createReview(productId, req.user.id, rating, comment);
    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }
    res.status(500).json({ error: err.message });
  }
};

const listReviews = async (req, res) => {
  try {
    const reviews = await getReviewsByProduct(req.params.productId);
    const summary = await getProductRatingSummary(req.params.productId);
    res.json({ summary, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addReview, listReviews };
