import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  description: String,
  category: String,
  brand: String,
  code: String,
  stock: Number,
  regularPrice: Number,
  salePrice: Number,
  tags: String,
  imagePreview: String, // main image URL
  gallery: [String],     // array of image URLs
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
