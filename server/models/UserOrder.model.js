import mongoose from 'mongoose';

const userOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const userOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true, unique: true },
  items: [userOrderItemSchema],
  totalAmount: { type: Number, required: true },
  
  // Billing Details
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyName: { type: String },
  country: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  
  paymentMethod: { type: String, enum: ['cash', 'online'], required: true },
  orderNotes: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  
  orderDate: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date }
}, { timestamps: true });

const UserOrder = mongoose.model('UserOrder', userOrderSchema);
export default UserOrder;