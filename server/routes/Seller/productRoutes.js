const express = require('express');
const router = express.Router();
const Product = require('../../models/Seller/Product.js');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('❌ Failed to fetch products:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
