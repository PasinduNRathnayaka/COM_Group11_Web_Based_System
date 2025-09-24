// models/Admin/Admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please add a valid mobile number']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Enhanced password reset fields
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
  }
}, { 
  timestamps: true,
  collection: 'test_admin' // Store under test/admin collection
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Clear password reset fields
adminSchema.methods.clearResetPasswordFields = function() {
  this.resetPasswordCode = null;
  this.resetPasswordToken = null;
  this.resetPasswordExpire = null;
  this.resetPasswordAttempts = 0;
  this.resetPasswordLockedUntil = null;
};

// Method to check if reset is locked
adminSchema.methods.isResetLocked = function() {
  return this.resetPasswordLockedUntil && this.resetPasswordLockedUntil > Date.now();
};

// Method to increment failed attempts
adminSchema.methods.incrementResetAttempts = function() {
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

// Method to check if admin can receive emails
adminSchema.methods.canReceiveEmails = function() {
  return !!(this.email && this.email.trim());
};

// Method to get user type for email templates
adminSchema.methods.getUserType = function() {
  if (this.role === 'super_admin') {
    return 'super_admin';
  }
  return 'admin';
};

// Get admin without password
adminSchema.methods.getPublicProfile = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  delete adminObject.resetPasswordToken;
  delete adminObject.resetPasswordExpire;
  return adminObject;
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;