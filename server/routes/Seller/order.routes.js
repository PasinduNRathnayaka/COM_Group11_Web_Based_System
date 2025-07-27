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
    const filename = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + ext;
    cb(null, filename);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete image file
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  
  try {
    const fullPath = path.join(process.cwd(), 'uploads', imagePath.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('✅ Deleted image:', fullPath);
    }
  } catch (error) {
    console.error('❌ Error deleting image:', error);
  }
};

// PUT /api/products/:id - Enhanced update with stock management
router.put('/:id', upload.array('images', 4), async (req, res) => {
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
      removedImageIndices
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get existing images (combine main image and gallery)
    let existingImages = [];
    if (product.image) existingImages.push(product.image);
    if (product.gallery && product.gallery.length > 0) {
      existingImages = existingImages.concat(product.gallery);
    }

    // Handle removed images
    let removedIndices = [];
    if (removedImageIndices) {
      try {
        removedIndices = JSON.parse(removedImageIndices);
      } catch (error) {
        console.error('Error parsing removedImageIndices:', error);
      }
    }

    // Delete removed images from filesystem
    if (removedIndices.length > 0) {
      removedIndices.forEach(index => {
        if (existingImages[index]) {
          deleteImageFile(existingImages[index]);
        }
      });
    }

    // Filter out removed images
    const remainingImages = existingImages.filter((img, index) => !removedIndices.includes(index));

    // Add new uploaded images
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
      newImagePaths = req.files.map(file => `/uploads/employees/Product/${file.filename}`);
    }

    // Combine remaining and new images
    const allImages = [...remainingImages, ...newImagePaths];

    // Validate total image count
    if (allImages.length === 0) {
      // Clean up newly uploaded files if no images will remain
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(uploadDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      return res.status(400).json({ error: 'At least one image is required' });
    }

    if (allImages.length > 4) {
      // Clean up newly uploaded files if limit exceeded
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(uploadDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      return res.status(400).json({ error: 'Maximum 4 images allowed' });
    }

    // Update product fields
    product.productId = productId || product.productId;
    product.productName = productName || product.productName;
    product.description = description !== undefined ? description : product.description;
    product.category = category !== undefined ? category : product.category;
    product.brand = brand !== undefined ? brand : product.brand;
    product.code = code !== undefined ? code : product.code;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.regularPrice = regularPrice !== undefined ? Number(regularPrice) : product.regularPrice;
    product.salePrice = salePrice !== undefined ? Number(salePrice) : product.salePrice;
    product.tags = tags !== undefined ? tags : product.tags;

    // Set main image and gallery
    product.image = allImages[0];
    product.gallery = allImages.length > 1 ? allImages.slice(1) : [];

    // Regenerate QR if productId changed
    if (productId && productId !== product.productId) {
      const newQRFilename = `${productId}-qr.png`;
      const newQRPath = await generateQR(`Product ID: ${productId}`, newQRFilename, 'Product');
      product.qrPath = newQRPath;
    }

    await product.save();

    res.status(200).json({ 
      message: 'Product updated successfully', 
      product 
    });
  } catch (err) {
    console.error('❌ Error updating product:', err);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// PATCH /api/products/:id/stock - Update only stock quantity
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body; // operation: 'set', 'increment', 'decrement'

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Valid stock quantity is required' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let newStock;
    switch (operation) {
      case 'increment':
        newStock = product.stock + Number(stock);
        break;
      case 'decrement':
        newStock = Math.max(0, product.stock - Number(stock));
        break;
      default: // 'set'
        newStock = Number(stock);
    }

    product.stock = newStock;
    await product.save();

    res.json({
      message: 'Stock updated successfully',
      product: {
        _id: product._id,
        productId: product.productId,
        productName: product.productName,
        stock: product.stock
      }
    });

  } catch (error) {
    console.error('❌ Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// GET /api/products/low-stock - Get products with low stock
router.get('/reports/low-stock', async (req, res) => {
  try {
    const { threshold = 5 } = req.query;
    
    const lowStockProducts = await Product.find({
      stock: { $lte: Number(threshold) }
    }).sort({ stock: 1 });

    res.json({
      message: `Products with stock <= ${threshold}`,
      count: lowStockProducts.length,
      products: lowStockProducts
    });

  } catch (error) {
    console.error('❌ Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// All other existing routes remain the same...
// (POST, GET, DELETE routes from your original product.routes.js)

export default router;