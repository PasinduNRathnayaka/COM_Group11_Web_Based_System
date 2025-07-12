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
  image: String,
  gallery: [String],
});

const Product = mongoose.model('Product', productSchema);
export default Product;
