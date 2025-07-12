import express from 'express';
import Product from '../../models/Seller/Product.model.js'; // ✅ Add this line

const router = express.Router();

// Create product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error in POST /api/products:", err.message);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// (Optional) Get products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("❌ Error in GET /api/products:", err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
