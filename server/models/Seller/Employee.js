// models/Seller/Employee.js - Updated with password reset fields
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
  email: { type: String, unique: true, sparse: true },
  image: String,
  qrCode: String,
  // ✅ NEW: Password reset fields for employees
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

// 🔑 Method to clear reset password fields
employeeSchema.methods.clearResetPasswordFields = function() {
  this.resetPasswordCode = null;
  this.resetPasswordToken = null;
  this.resetPasswordExpire = null;
  this.resetPasswordAttempts = 0;
  this.resetPasswordLockedUntil = null;
};

// 🔑 Method to check if reset is locked
employeeSchema.methods.isResetLocked = function() {
  return this.resetPasswordLockedUntil && this.resetPasswordLockedUntil > Date.now();
};

// 🔑 Method to increment failed attempts
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

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
export default Employee;