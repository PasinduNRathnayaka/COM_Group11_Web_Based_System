import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  description: String,
  category: String,
  brand: String,
  code: String,
  stock: { type: Number, default: 0 },
  regularPrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  tags: String,
  image: String, // Main product image
  gallery: [String], // Additional product images (up to 3 more)
  qrPath: String, // QR code path
}, { timestamps: true });

// Ensure we don't exceed 4 total images
productSchema.pre('save', function(next) {
  const totalImages = (this.image ? 1 : 0) + (this.gallery ? this.gallery.length : 0);
  if (totalImages > 4) {
    const error = new Error('Maximum 4 images allowed per product');
    return next(error);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;