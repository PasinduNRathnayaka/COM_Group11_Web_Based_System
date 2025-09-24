import mongoose from 'mongoose';

// Employee Contact Activity Log Schema
const contactActivitySchema = new mongoose.Schema({
  contactMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactMessage',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    enum: [
      'viewed',
      'replied',
      'assigned',
      'status_changed',
      'priority_changed',
      'category_changed', 
      'note_added',
      'resolved',
      'closed',
      'reopened',
      'followed_up'
    ],
    required: true
  },
  details: {
    type: String,
    trim: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed // For tracking changes
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed // For tracking changes
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Employee Performance Schema for Contact Management
const employeeContactPerformanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Monthly statistics
  monthlyStats: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    messagesHandled: {
      type: Number,
      default: 0
    },
    messagesReplied: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number, // in hours
      default: 0
    },
    customerSatisfactionRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    messagesResolved: {
      type: Number,
      default: 0
    }
  },
  
  // Overall statistics
  totalStats: {
    totalMessagesHandled: {
      type: Number,
      default: 0
    },
    totalReplies: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number, // in hours
      default: 0
    },
    overallRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalResolved: {
      type: Number,
      default: 0
    }
  },
  
  // Performance metrics
  performance: {
    responseTimeTarget: {
      type: Number,
      default: 24 // hours
    },
    achievedTargetPercentage: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      }
    }
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Contact Template Schema for quick replies
const contactTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'product_inquiry', 'complaint', 'support', 'billing', 'follow_up', 'resolution'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  variables: [{
    type: String,
    trim: true
  }], // Variables that can be replaced like {{customerName}}, {{productName}}
  
  createdBy: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Employee Contact Settings Schema
const employeeContactSettingsSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    newMessageAlert: {
      type: Boolean,
      default: true
    },
    urgentMessageAlert: {
      type: Boolean,
      default: true
    },
    dailyDigest: {
      type: Boolean,
      default: false
    }
  },
  
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    },
    timezone: {
      type: String,
      default: 'Asia/Colombo'
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  
  autoResponder: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      trim: true
    },
    conditions: {
      afterHours: {
        type: Boolean,
        default: false
      },
      specificCategories: [{
        type: String
      }]
    }
  },
  
  preferences: {
    messagesPerPage: {
      type: Number,
      default: 25,
      min: 10,
      max: 100
    },
    defaultPriority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    autoAssign: {
      type: Boolean,
      default: false
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
contactActivitySchema.index({ contactMessageId: 1, timestamp: -1 });
contactActivitySchema.index({ employeeId: 1, timestamp: -1 });
contactActivitySchema.index({ action: 1, timestamp: -1 });

employeeContactPerformanceSchema.index({ employeeId: 1 });
employeeContactPerformanceSchema.index({ 'monthlyStats.year': 1, 'monthlyStats.month': 1 });

contactTemplateSchema.index({ category: 1, isActive: 1 });
contactTemplateSchema.index({ createdBy: 1 });
contactTemplateSchema.index({ usageCount: -1 });

employeeContactSettingsSchema.index({ employeeId: 1 });

// Pre-save middleware
contactTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

employeeContactSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods for ContactActivity
contactActivitySchema.statics.logActivity = async function(data) {
  const activity = new this(data);
  return await activity.save();
};

contactActivitySchema.statics.getEmployeeActivity = async function(employeeId, limit = 50) {
  return await this.find({ employeeId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('contactMessageId', 'subject firstName lastName email');
};

// Static methods for EmployeeContactPerformance
employeeContactPerformanceSchema.statics.updateStats = async function(employeeId, employeeName, statsUpdate) {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  return await this.findOneAndUpdate(
    { employeeId },
    {
      $set: {
        employeeName,
        'monthlyStats.month': month,
        'monthlyStats.year': year,
        lastUpdated: currentDate
      },
      $inc: {
        ...statsUpdate,
        'totalStats.totalMessagesHandled': statsUpdate['monthlyStats.messagesHandled'] || 0,
        'totalStats.totalReplies': statsUpdate['monthlyStats.messagesReplied'] || 0,
        'totalStats.totalResolved': statsUpdate['monthlyStats.messagesResolved'] || 0
      }
    },
    { upsert: true, new: true }
  );
};

// Static methods for ContactTemplate
contactTemplateSchema.statics.getActiveTemplates = async function(category = null) {
  const query = { isActive: true };
  if (category) query.category = category;
  
  return await this.find(query).sort({ usageCount: -1, createdAt: -1 });
};

contactTemplateSchema.statics.useTemplate = async function(templateId) {
  return await this.findOneAndUpdate(
    { templateId, isActive: true },
    {
      $inc: { usageCount: 1 },
      $set: { lastUsed: new Date() }
    },
    { new: true }
  );
};

// Create models
const ContactActivity = mongoose.model('ContactActivity', contactActivitySchema);
const EmployeeContactPerformance = mongoose.model('EmployeeContactPerformance', employeeContactPerformanceSchema);
const ContactTemplate = mongoose.model('ContactTemplate', contactTemplateSchema);
const EmployeeContactSettings = mongoose.model('EmployeeContactSettings', employeeContactSettingsSchema);

export {
  ContactActivity,
  EmployeeContactPerformance,
  ContactTemplate,
  EmployeeContactSettings
};

export default {
  ContactActivity,
  EmployeeContactPerformance,
  ContactTemplate,
  EmployeeContactSettings
};