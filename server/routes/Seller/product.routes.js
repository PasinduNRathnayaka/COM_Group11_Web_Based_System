import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../../models/Seller/Product.model.js';

const router = express.Router();



// Setup __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// POST /api/products - Create Product with Main Image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      stock: Number(req.body.stock),
      regularPrice: Number(req.body.regularPrice),
      salePrice: Number(req.body.salePrice),
      image: req.file ? `/uploads/${req.file.filename}` : '',
      gallery: [], // To support later
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Failed to save product:', err.message);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// GET /api/products - Fetch All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('❌ Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET products by category
router.get("/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  try {
    const products = await Product.find({ category: categoryName });
    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products by category", err);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;
