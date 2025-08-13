import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: String,
  description: String,
  
  // Soft delete fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, default: null }, // Who deleted it
  deletionReason: { type: String, default: null }, // Optional reason for deletion
}, { timestamps: true });

// Method to soft delete
categorySchema.methods.softDelete = function(deletedBy, reason = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deletionReason = reason;
  return this.save();
};

// Method to restore from recycle bin
categorySchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  this.deletionReason = null;
  return this.save();
};

// Static method to find non-deleted items
categorySchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

// Static method to find deleted items (recycle bin)
categorySchema.statics.findDeleted = function(filter = {}) {
  return this.find({ ...filter, isDeleted: true });
};

const Category = mongoose.model('Category', categorySchema);
export default Category;