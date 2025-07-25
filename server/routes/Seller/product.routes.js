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

// POST /api/products - Create Product with Multiple Images and QR code
router.post('/', upload.array('images', 4), async (req, res) => {
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

    // Validate required fields
    if (!productName || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Product name and at least one image are required' });
    }

    if (req.files.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 images allowed' });
    }

    // Convert numeric fields
    const stockNum = Number(stock) || 0;
    const regularPriceNum = Number(regularPrice) || 0;
    const salePriceNum = Number(salePrice) || 0;

    // Process uploaded images
    const imagePaths = req.files.map(file => `/uploads/employees/Product/${file.filename}`);
    
    // First image becomes the main image, rest go to gallery
    const mainImage = imagePaths[0];
    const gallery = imagePaths.length > 1 ? imagePaths.slice(1) : [];

    // Generate QR code for productId
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
      image: mainImage,
      gallery: gallery,
      qrPath,
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    console.error('❌ Failed to save product:', err);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// PUT /api/products/:id - Update Product with Multiple Images
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
    product.productId = productId;
    product.productName = productName;
    product.description = description;
    product.category = category;
    product.brand = brand;
    product.code = code;
    product.stock = Number(stock) || 0;
    product.regularPrice = Number(regularPrice) || 0;
    product.salePrice = Number(salePrice) || 0;
    product.tags = tags;

    // Set main image and gallery
    product.image = allImages[0];
    product.gallery = allImages.length > 1 ? allImages.slice(1) : [];

    // Regenerate QR if productId changed
    const newQRFilename = `${productId}-qr.png`;
    const newQRPath = await generateQR(`Product ID: ${productId}`, newQRFilename, 'Product');
    product.qrPath = newQRPath;

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

// Helper to add full URLs for images and qrPath fields
function addFullUrls(products, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return products.map((p) => {
    const obj = p.toObject ? p.toObject() : p;
    return {
      ...obj,
      image: obj.image ? baseUrl + obj.image : null,
      gallery: obj.gallery ? obj.gallery.map(img => baseUrl + img) : [],
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

// GET /api/products/:id - Get product by ID with full URLs
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productWithUrls = addFullUrls([product], req)[0];
    res.json(productWithUrls);
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/products/:id - Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete associated images
    if (product.image) {
      deleteImageFile(product.image);
    }
    
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach(imagePath => {
        deleteImageFile(imagePath);
      });
    }

    // Delete QR code
    if (product.qrPath) {
      deleteImageFile(product.qrPath);
    }

    await Product.findByIdAndDelete(productId);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;