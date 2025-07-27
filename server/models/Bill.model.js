import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  }
});

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    default: '',
  },
  customerPhone: {
    type: String,
    default: '',
  },
  items: [billItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  itemCount: {
    type: Number,
    required: true,
    min: 1,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'paid',
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  billDate: {
    type: Date,
    default: Date.now,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  }
}, { 
  timestamps: true 
});

// Index for faster queries
billSchema.index({ billNumber: 1 });
billSchema.index({ billDate: -1 });
billSchema.index({ customerName: 1 });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;