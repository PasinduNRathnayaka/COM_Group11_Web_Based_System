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
  
  // Soft delete fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, default: null }, // Who deleted it
  deletionReason: { type: String, default: null }, // Optional reason for deletion
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

// Method to soft delete
productSchema.methods.softDelete = function(deletedBy, reason = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deletionReason = reason;
  return this.save();
};

// Method to restore from recycle bin
productSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.deletionReason = null;
  return this.save();
};

// Static method to find non-deleted items
productSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

// Static method to find deleted items (recycle bin)
productSchema.statics.findDeleted = function(filter = {}) {
  return this.find({ ...filter, isDeleted: true });
};

const Product = mongoose.model('Product', productSchema);
export default Product;