// models/Seller/Employee.js - FIXED VERSION with better email handling
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: String,
  about: String,
  category: String, // This can be: 'employee', 'seller', 'admin', 'online_employee', etc.
  role: String, // Alternative field for role-based distinction
  contact: String,
  rate: Number,
  address: String,
  username: { type: String, required: true, unique: true },
  password: String,
  // ✅ FIXED: Better email validation and handling
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  image: String,
  qrCode: String,
  // Password reset fields for employees
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
}, { timestamps: true });

// ✅ FIXED: Add pre-save middleware to ensure email is properly handled
employeeSchema.pre('save', function(next) {
  // Ensure email is lowercase and trimmed if provided
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Method to clear reset password fields
employeeSchema.methods.clearResetPasswordFields = function() {
  this.resetPasswordCode = null;
  this.resetPasswordToken = null;
  this.resetPasswordExpire = null;
  this.resetPasswordAttempts = 0;
  this.resetPasswordLockedUntil = null;
};

// Method to check if reset is locked
employeeSchema.methods.isResetLocked = function() {
  return this.resetPasswordLockedUntil && this.resetPasswordLockedUntil > Date.now();
};

// Method to increment failed attempts
employeeSchema.methods.incrementResetAttempts = function() {
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

// ✅ NEW: Method to check if employee can receive emails
employeeSchema.methods.canReceiveEmails = function() {
  return !!(this.email && this.email.trim());
};

// ✅ NEW: Method to get user type for email templates
employeeSchema.methods.getUserType = function() {
  if (this.category === 'seller' || this.category === 'admin') {
    return 'admin';
  } else if (this.category === 'Employee for E-com' || this.category === 'online_employee') {
    return 'online_employee';
  } else if (this.category === 'seller') {
    return 'seller';
  }
  return 'employee';
};

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;