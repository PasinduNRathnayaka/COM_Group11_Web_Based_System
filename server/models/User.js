// models/User.js - Updated with password reset fields
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
    // ✅ NEW: Password reset fields
    resetPasswordCode: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpire: {
      type: Date,
      default: null
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0
    },
    resetPasswordLockedUntil: {
      type: Date,
      default: null
    },
     // ✅ Cart field to store user's cart items
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

// 🔑 Method to clear reset password fields
userSchema.methods.clearResetPasswordFields = function() {
  this.resetPasswordCode = null;
  this.resetPasswordToken = null;
  this.resetPasswordExpire = null;
  this.resetPasswordAttempts = 0;
  this.resetPasswordLockedUntil = null;
};

// 🔑 Method to check if reset is locked
userSchema.methods.isResetLocked = function() {
  return this.resetPasswordLockedUntil && this.resetPasswordLockedUntil > Date.now();
};

// 🔑 Method to increment failed attempts
userSchema.methods.incrementResetAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.resetPasswordLockedUntil && this.resetPasswordLockedUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        resetPasswordLockedUntil: 1,
      },
      $set: {
        resetPasswordAttempts: 1,
      }
    });
  }
  
  const updates = { $inc: { resetPasswordAttempts: 1 } };
  
  // If we have max attempts and aren't locked yet, lock the account
  if (this.resetPasswordAttempts + 1 >= 5 && !this.isResetLocked()) {
    updates.$set = {
      resetPasswordLockedUntil: Date.now() + 30 * 60 * 1000, // Lock for 30 minutes
    };
  }
  
  return this.updateOne(updates);
};

export default mongoose.model('User', userSchema);
