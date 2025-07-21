import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  productName: String,
  description: String,
  category: String,
  brand: String,
  code: String,
  stock: Number,
  regularPrice: Number,
  salePrice: Number,
  tags: String,
  image: String,
  gallery: [String],
  qrPath: String, // ← ✅ NEW FIELD
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
