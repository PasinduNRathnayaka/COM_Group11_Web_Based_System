// models/Seller/SalaryAdjustment.js
import mongoose from 'mongoose';

const salaryAdjustmentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  empId: {
    type: String,
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/,
    index: true
  },
  // Basic salary calculated from attendance and daily rate
  basicSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  // Attendance data
  totalHours: {
    type: Number,
    default: 0,
    min: 0
  },
  presentDays: {
    type: Number,
    default: 0,
    min: 0
  },
  completeDays: {
    type: Number,
    default: 0,
    min: 0
  },
  // Allowances (additions to salary)
  allowances: {
    transport: { type: Number, default: 0, min: 0 },
    food: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    overtime: { type: Number, default: 0, min: 0 },
    medical: { type: Number, default: 0, min: 0 },
    performance: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  // Deductions (subtractions from salary)
  deductions: {
    epf: { type: Number, default: 0, min: 0 },
    etf: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    advance: { type: Number, default: 0, min: 0 },
    loan: { type: Number, default: 0, min: 0 },
    uniform: { type: Number, default: 0, min: 0 },
    damage: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  // Calculated totals (computed automatically)
  totalAllowances: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDeductions: {
    type: Number,
    default: 0,
    min: 0
  },
  grossSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft',
    index: true
  },
  // Notes and metadata
  notes: {
    type: String,
    maxlength: 500
  },
  modifiedBy: {
    type: String,
    default: 'System'
  },
  // Approval tracking
  approvedBy: String,
  approvedAt: Date,
  // Payment tracking
  paidBy: String,
  paidAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
salaryAdjustmentSchema.index({ employee: 1, month: 1 }, { unique: true });
salaryAdjustmentSchema.index({ month: 1, status: 1 });
salaryAdjustmentSchema.index({ empId: 1, month: 1 });

// Helper function to safely convert to number
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.max(0, num); // Ensure non-negative
};

// Pre-save middleware to calculate totals
salaryAdjustmentSchema.pre('save', function(next) {
  try {
    // Calculate total allowances
    this.totalAllowances = Object.values(this.allowances || {})
      .reduce((sum, val) => sum + safeNumber(val), 0);
    
    // Calculate total deductions
    this.totalDeductions = Object.values(this.deductions || {})
      .reduce((sum, val) => sum + safeNumber(val), 0);
    
    // Calculate gross salary (basic + allowances)
    this.grossSalary = safeNumber(this.basicSalary) + this.totalAllowances;
    
    // Calculate net salary (gross - deductions)
    this.netSalary = this.grossSalary - this.totalDeductions;
    
    // Ensure all monetary values are properly formatted
    this.basicSalary = safeNumber(this.basicSalary);
    this.totalAllowances = Math.round(this.totalAllowances * 100) / 100;
    this.totalDeductions = Math.round(this.totalDeductions * 100) / 100;
    this.grossSalary = Math.round(this.grossSalary * 100) / 100;
    this.netSalary = Math.round(this.netSalary * 100) / 100;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
salaryAdjustmentSchema.methods.approve = function(approvedBy = 'Admin') {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

salaryAdjustmentSchema.methods.markAsPaid = function(paidBy = 'Admin') {
  if (this.status !== 'approved') {
    throw new Error('Salary must be approved before marking as paid');
  }
  this.status = 'paid';
  this.paidBy = paidBy;
  this.paidAt = new Date();
  return this.save();
};

salaryAdjustmentSchema.methods.cancel = function(cancelledBy = 'Admin') {
  this.status = 'cancelled';
  this.modifiedBy = cancelledBy;
  return this.save();
};

// Static methods
salaryAdjustmentSchema.statics.getMonthlyReport = function(month) {
  return this.aggregate([
    {
      $match: { month: month }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employeeInfo'
      }
    },
    {
      $unwind: {
        path: '$employeeInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        empId: 1,
        month: 1,
        basicSalary: 1,
        totalHours: 1,
        presentDays: 1,
        completeDays: 1,
        allowances: 1,
        deductions: 1,
        totalAllowances: 1,
        totalDeductions: 1,
        grossSalary: 1,
        netSalary: 1,
        status: 1,
        notes: 1,
        createdAt: 1,
        updatedAt: 1,
        'employeeInfo.name': 1,
        'employeeInfo.category': 1,
        'employeeInfo.image': 1,
        'employeeInfo.rate': 1
      }
    },
    {
      $sort: { empId: 1 }
    }
  ]);
};

salaryAdjustmentSchema.statics.getEmployeeSalaryHistory = function(employeeId, limit = 12) {
  return this.find({ employee: employeeId })
    .sort({ month: -1 })
    .limit(limit)
    .populate('employee', 'empId name category')
    .lean();
};

salaryAdjustmentSchema.statics.getSalaryStatsByMonth = function(month) {
  return this.aggregate([
    {
      $match: { month: month }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBasicSalary: { $sum: '$basicSalary' },
        totalAllowances: { $sum: '$totalAllowances' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNetSalary: { $sum: '$netSalary' },
        avgNetSalary: { $avg: '$netSalary' }
      }
    },
    {
      $group: {
        _id: null,
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            totalBasicSalary: '$totalBasicSalary',
            totalAllowances: '$totalAllowances',
            totalDeductions: '$totalDeductions',
            totalNetSalary: '$totalNetSalary',
            avgNetSalary: '$avgNetSalary'
          }
        },
        totalEmployees: { $sum: '$count' },
        grandTotalBasicSalary: { $sum: '$totalBasicSalary' },
        grandTotalAllowances: { $sum: '$totalAllowances' },
        grandTotalDeductions: { $sum: '$totalDeductions' },
        grandTotalNetSalary: { $sum: '$totalNetSalary' }
      }
    }
  ]);
};

// Virtual for formatted display
salaryAdjustmentSchema.virtual('formattedNetSalary').get(function() {
  return `Rs. ${this.netSalary?.toLocaleString() || '0'}`;
});

salaryAdjustmentSchema.virtual('formattedBasicSalary').get(function() {
  return `Rs. ${this.basicSalary?.toLocaleString() || '0'}`;
});

// Validation for month format
salaryAdjustmentSchema.path('month').validate(function(value) {
  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return monthRegex.test(value);
}, 'Month must be in YYYY-MM format');

// Validation for future dates
salaryAdjustmentSchema.path('month').validate(function(value) {
  const currentDate = new Date();
  const inputDate = new Date(value + '-01');
  const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  return inputDate < maxDate;
}, 'Cannot create salary records for future months');

const SalaryAdjustment = mongoose.model('SalaryAdjustment', salaryAdjustmentSchema);

export default SalaryAdjustment;