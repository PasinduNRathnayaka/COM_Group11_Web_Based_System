import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
      type: String,
      required: [true, 'Please enter your name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
    },
     number: {
      type: String,
      required: [true, 'Please enter a phone number'],
      minlength: 10,
    },
     address: {
      type: String,
      required: [true, 'Please enter the address'],
    },
    profilePic: {
      type: String,
      default: '', // placeholder until user uploads
    },
     // ✅ NEW: Cart field to store user's cart items
    cart: [{
      productId: {
        type: String,
        required: true
      },
      name: String,
      price: Number,
      image: String,
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      description: String
    }]
  },
  { timestamps: true }
);

/* 🔑 Hash password before saving */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);
