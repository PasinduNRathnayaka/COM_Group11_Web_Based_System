import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },


  //def
  // Employee management fields
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  readBy: {
    type: String,
    default: null // Employee ID who read the message
  },
  
  isReplied: {
    type: Boolean,
    default: false
  },
  
  // Reply information
  reply: {
    message: {
      type: String,
      trim: true
    },
    employeeId: {
      type: String,
      trim: true
    },
    employeeName: {
      type: String,
      trim: true
    },
    repliedAt: {
      type: Date
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: {
      type: Date
    }
  },
  
  // Priority and category
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  category: {
    type: String,
    enum: ['general', 'product_inquiry', 'complaint', 'support', 'billing', 'other'],
    default: 'general'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  
  // Customer information
  customerPhone: {
    type: String,
    trim: true
  },
  
  // Internal notes for employees
  internalNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: String,
      required: true // Employee ID
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags for better organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Follow-up information
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNote: {
    type: String,
    trim: true
  },
  
  // Assigned employee
  assignedTo: {
    employeeId: {
      type: String,
      trim: true
    },
    employeeName: {
      type: String,
      trim: true
    },
    assignedAt: {
      type: Date
    }
  },
  
  // Resolution information
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String // Employee ID
  },
  resolutionNote: {
    type: String,
    trim: true
  },
  
  // Customer satisfaction
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerFeedback: {
    type: String,
    trim: true
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically handle createdAt and updatedAt
});

// Indexes for better query performance
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ isRead: 1 });
contactMessageSchema.index({ isReplied: 1 });
contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ priority: 1 });
contactMessageSchema.index({ category: 1 });
contactMessageSchema.index({ 'assignedTo.employeeId': 1 });

// Text index for search functionality
contactMessageSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  subject: 'text',
  message: 'text'
});

// Virtual for full name
contactMessageSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for days since created
contactMessageSchema.virtual('daysSinceCreated').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update timestamps
contactMessageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update timestamps
contactMessageSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static methods
contactMessageSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        replied: { $sum: { $cond: [{ $eq: ['$isReplied', true] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $and: [{ $eq: ['$isRead', true] }, { $eq: ['$isReplied', false] }] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    unread: 0,
    replied: 0,
    resolved: 0,
    urgent: 0,
    pending: 0
  };
};

// Static method to get messages by category
contactMessageSchema.statics.getByCategory = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get messages by priority
contactMessageSchema.statics.getByPriority = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
contactMessageSchema.methods.markAsRead = function(employeeId) {
  this.isRead = true;
  this.readAt = new Date();
  this.readBy = employeeId;
  return this.save();
};

contactMessageSchema.methods.addReply = function(replyData) {
  this.reply = {
    message: replyData.message,
    employeeId: replyData.employeeId,
    employeeName: replyData.employeeName,
    repliedAt: new Date(),
    emailSent: replyData.emailSent || false,
    emailSentAt: replyData.emailSent ? new Date() : null
  };
  this.isReplied = true;
  this.isRead = true;
  if (!this.readAt) {
    this.readAt = new Date();
    this.readBy = replyData.employeeId;
  }
  return this.save();
};

contactMessageSchema.methods.addInternalNote = function(note, employeeId) {
  this.internalNotes.push({
    note: note,
    addedBy: employeeId,
    addedAt: new Date()
  });
  return this.save();
};

contactMessageSchema.methods.assignTo = function(employeeId, employeeName) {
  this.assignedTo = {
    employeeId: employeeId,
    employeeName: employeeName,
    assignedAt: new Date()
  };
  if (this.status === 'new') {
    this.status = 'in_progress';
  }
  return this.save();
};

contactMessageSchema.methods.resolve = function(employeeId, resolutionNote) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = employeeId;
  this.resolutionNote = resolutionNote;
  return this.save();
};

// Ensure virtual fields are serialized
contactMessageSchema.set('toJSON', { virtuals: true });
contactMessageSchema.set('toObject', { virtuals: true });

//def

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
