import Product from '../../models/Seller/Product.model.js';
import { generateQR } from '../../utils/generateQR.js';

export const createProduct = async (req, res) => {
  try {
    // req.body contains product fields from the form
    // req.file contains the uploaded image file info (via multer)
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

    // Image file path (stored in uploads)
    const image = req.file ? `/uploads/employees/Product/${req.file.filename}` : null;

    // Generate QR code text (customize as needed)
    const qrText = `Product ID: ${productId}`;

    // Generate QR code image file path
    const qrFilename = `${productId}-qr.png`;
    const qrPath = await generateQR(qrText, qrFilename, 'Product');

    // Create product document with image and qrPath
    const product = new Product({
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
      image,
      qrPath,
    });

    await product.save();

    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Assuming your backend runs on localhost:4000 — adjust if different
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Map products to add full URLs for image and qrPath
    const productsWithFullPaths = products.map((product) => ({
      ...product.toObject(),
      image: product.image ? baseUrl + product.image : null,
      qrPath: product.qrPath ? baseUrl + product.qrPath : null,
    }));

    res.status(200).json(productsWithFullPaths);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
