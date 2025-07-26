import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee' // Links to Employee empId
  },
  employeeName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full', 'half'],
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  applyTo: {
    type: String,
    required: true,
    default: 'Owner'
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Leave', leaveSchema);