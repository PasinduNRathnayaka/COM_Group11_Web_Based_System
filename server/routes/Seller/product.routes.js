import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Product from '../../models/Seller/Product.model.js';
import { generateQR } from '../../utils/generateQR.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to store product images and QR codes
const uploadDir = path.resolve(__dirname, '../../uploads/employees/Product');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + file.fieldname + ext;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// POST /api/products - Create Product with Main Image and QR code
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      productId,
      productName,
      description,
      category,
      brand,
      code,
      stock,
      regularPrice,
      salePrice,
      tags,
    } = req.body;

    // Convert numeric fields
    const stockNum = Number(stock);
    const regularPriceNum = Number(regularPrice);
    const salePriceNum = Number(salePrice);

    // Image path relative to /uploads
    const imagePath = req.file ? `/uploads/employees/Product/${req.file.filename}` : '';

    // Generate QR code for productId, saved inside same folder
    const qrFilename = `${productId}-qr.png`;
    const qrPath = await generateQR(`Product ID: ${productId}`, qrFilename, 'Product');

    const newProduct = new Product({
      productId,
      productName,
      description,
      category,
      brand,
      code,
      stock: stockNum,
      regularPrice: regularPriceNum,
      salePrice: salePriceNum,
      tags,
      image: imagePath,
      qrPath,
    });

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('❌ Failed to save product:', err);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// PUT /api/products/:id - Update Product with optional new image
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productId,
      productName,
      description,
      category,
      brand,
      code,
      stock,
      regularPrice,
      salePrice,
      tags,
      imageRemoved
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (imageRemoved === 'true' && product.image) {
      const imagePath = path.join(process.cwd(), 'uploads', product.image.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      product.image = null;
    }

    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(process.cwd(), 'uploads', product.image.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = `/uploads/employees/Product/${req.file.filename}`;
    }

    product.productId = productId;
    product.productName = productName;
    product.description = description;
    product.category = category;
    product.brand = brand;
    product.code = code;
    product.stock = Number(stock);
    product.regularPrice = Number(regularPrice);
    product.salePrice = Number(salePrice);
    product.tags = tags;

    await product.save();

    res.status(200).json({ message: 'Product updated', product });
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Helper to add full URLs for images and qrPath fields
function addFullUrls(products, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return products.map((p) => {
    const obj = p.toObject ? p.toObject() : p;
    return {
      ...obj,
      image: obj.image ? baseUrl + obj.image : null,
      qrPath: obj.qrPath ? baseUrl + obj.qrPath : null,
    };
  });
}

// GET /api/products - Fetch all products with full URLs for images & QR codes
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(addFullUrls(products, req));
  } catch (err) {
    console.error('❌ Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/category/:categoryName - Fetch products by category with full URLs
router.get('/category/:categoryName', async (req, res) => {
  const { categoryName } = req.params;
  try {
    const products = await Product.find({ category: categoryName });
    res.json(addFullUrls(products, req));
  } catch (err) {
    console.error('❌ Failed to fetch products by category:', err);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});


// DELETE /api/products/:id - Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });

  }
});

export default router;
