const express = require('express');
const router = express.Router();
const Product = require('../../models/Seller/Product.js');
const upload = require('../../middlewares/upload');

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

router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { body, files } = req;

      const mainImage = files?.image?.[0]?.filename || '';
      const galleryImages = files?.gallery?.map((f) => f.filename) || [];

      const product = new Product({
        productId: body.productId,
        productName: body.productName,
        description: body.description,
        category: body.category,
        brand: body.brand,
        code: body.code,
        stock: Number(body.stock),
        regularPrice: Number(body.regularPrice),
        salePrice: Number(body.salePrice),
        tags: body.tags,
        image: mainImage,
        gallery: galleryImages,
      });

      await product.save();
      res.status(201).json({ message: '✅ Product saved', product });
    } catch (error) {
      console.error('❌ Product save error:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

module.exports = router;

module.exports = router;
