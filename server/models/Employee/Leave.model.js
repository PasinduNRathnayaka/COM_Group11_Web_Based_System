// models/Leave.model.js
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  employeeName: { type: String, required: true },
  employeeEmpId: { type: String, required: true },
  leaveType: { 
    type: String, 
    enum: ['full-day', 'half-day'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminComment: { type: String, maxlength: 300 },
  appliedDate: { type: Date, default: Date.now },
  reviewedDate: { type: Date },
  reviewedBy: { type: String }, // Admin name who reviewed
}, { timestamps: true });

// Calculate total leave days
leaveSchema.virtual('totalDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  
  if (this.leaveType === 'half-day') {
    return daysDiff * 0.5;
  }
  return daysDiff;
});

leaveSchema.set('toJSON', { virtuals: true });
leaveSchema.set('toObject', { virtuals: true });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;