import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Employee', 'Employee for E-com']
  },
  contact: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For future login integration
  role: {
    type: String,
    default: 'employee'
  }
}, {
  timestamps: true
});

export default mongoose.model('Employee', employeeSchema);