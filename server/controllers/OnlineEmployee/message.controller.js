import ContactMessage from '../../models/ContactMessage.js';
import { 
  ContactActivity, 
  EmployeeContactPerformance, 
  ContactTemplate, 
  EmployeeContactSettings 
} from '../../models/message.model.js';
import nodemailer from 'nodemailer';

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Helper function to calculate response time
const calculateResponseTime = (createdAt, repliedAt) => {
  const created = new Date(createdAt);
  const replied = new Date(repliedAt);
  return Math.abs(replied - created) / (1000 * 60 * 60); // hours
};

// Helper function to log activity
const logActivity = async (contactMessageId, employeeId, employeeName, action, details, oldValue = null, newValue = null) => {
  try {
    await ContactActivity.logActivity({
      contactMessageId,
      employeeId,
      employeeName,
      action,
      details,
      oldValue,
      newValue
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// GET /api/employee/contact-messages - Get all contact messages with advanced filtering
export const getContactMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25, 
      status, 
      priority,
      category,
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      assignedTo,
      dateFrom,
      dateTo
    } = req.query;

    // Build query
    let query = {};
    
    // Filter by status
    if (status === 'read') query.isRead = true;
    if (status === 'unread') query.isRead = false;
    if (status === 'replied') query.isReplied = true;
    if (status === 'pending') query = { ...query, isRead: true, isReplied: false };
    if (status && ['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      query.status = status;
    }

    // Filter by priority
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query.priority = priority;
    }

    // Filter by category
    if (category && ['general', 'product_inquiry', 'complaint', 'support', 'billing', 'other'].includes(category)) {
      query.category = category;
    }

    // Filter by assigned employee
    if (assignedTo) {
      query['assignedTo.employeeId'] = assignedTo;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const messages = await ContactMessage.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ContactMessage.countDocuments(query);
    
    // Get comprehensive statistics
    const stats = await ContactMessage.getStatistics();
    
    // Get category breakdown
    const categoryStats = await ContactMessage.getByCategory();
    
    // Get priority breakdown
    const priorityStats = await ContactMessage.getByPriority();

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: parseInt(limit)
      },
      stats,
      categoryStats,
      priorityStats
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
};

// GET /api/employee/contact-messages/:id - Get single contact message
export const getContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Get activity history for this message
    const activities = await ContactActivity.find({ contactMessageId: id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      message,
      activities
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message
    });
  }
};

// PUT /api/employee/contact-messages/:id/read - Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, employeeName } = req.body;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    if (!message.isRead) {
      await message.markAsRead(employeeId);
      
      // Log activity
      await logActivity(
        id, 
        employeeId, 
        employeeName, 
        'viewed', 
        'Message marked as read'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// POST /api/employee/contact-messages/:id/reply - Reply to contact message
export const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, employeeId, employeeName } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    if (!employeeId || !employeeName) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and name are required'
      });
    }

    const contactMessage = await ContactMessage.findById(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    let emailSent = false;
    let emailError = null;

    // Send email reply to customer
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: {
          name: 'KAMAL AUTO PARTS',
          address: process.env.EMAIL_USER
        },
        to: contactMessage.email,
        subject: `Re: ${contactMessage.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">KAMAL AUTO PARTS</h1>
              <p style="margin: 5px 0 0 0;">Customer Support Response</p>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <p>Dear ${contactMessage.firstName} ${contactMessage.lastName},</p>
              
              <p>Thank you for contacting us. We have received your message regarding "<strong>${contactMessage.subject}</strong>" and here is our response:</p>
              
              <div style="background-color: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              
              <div style="background-color: #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #374151;">Your Original Message:</h4>
                <p style="margin: 0; font-style: italic; color: #6b7280;">"${contactMessage.message}"</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                  Sent on: ${contactMessage.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <p>If you have any further questions or concerns, please don't hesitate to contact us.</p>
              
              <div style="border-top: 1px solid #d1d5db; padding-top: 20px; margin-top: 20px;">
                <h4 style="color: #374151; margin: 0 0 10px 0;">Contact Information:</h4>
                <p style="margin: 5px 0; color: #6b7280;">📍 No 128, Wewurukannala Road, Kekanadura, Sri Lanka</p>
                <p style="margin: 5px 0; color: #6b7280;">📞 +94 0777 555 919</p>
                <p style="margin: 5px 0; color: #6b7280;">📧 kamalautoparts@gmail.com</p>
              </div>
            </div>
            
            <div style="background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2024 KAMAL AUTO PARTS. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated response to your inquiry.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`✅ Reply email sent to ${contactMessage.email}`);

    } catch (error) {
      console.error('❌ Failed to send reply email:', error);
      emailError = error.message;
    }

    // Add reply to contact message
    const replyData = {
      message: replyMessage.trim(),
      employeeId,
      employeeName,
      emailSent,
      emailSentAt: emailSent ? new Date() : null
    };

    await contactMessage.addReply(replyData);

    // Calculate response time
    const responseTime = calculateResponseTime(contactMessage.createdAt, new Date());

    // Update employee performance stats
    await EmployeeContactPerformance.updateStats(employeeId, employeeName, {
      'monthlyStats.messagesReplied': 1,
      'monthlyStats.averageResponseTime': responseTime
    });

    // Log activity
    await logActivity(
      id, 
      employeeId, 
      employeeName, 
      'replied', 
      `Replied to customer${emailSent ? ' and email sent' : ' but email failed'}`
    );

    res.status(200).json({
      success: true,
      message: emailSent ? 'Reply sent successfully' : 'Reply saved but email delivery failed',
      reply: replyData,
      emailSent,
      emailError,
      responseTime: Math.round(responseTime * 100) / 100,
      data: contactMessage
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
};

// PUT /api/employee/contact-messages/:id/status - Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, employeeId, employeeName, note } = req.body;

    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    const oldStatus = message.status;

    // Update status
    message.status = status;
    
    if (status === 'resolved') {
      message.resolvedAt = new Date();
      message.resolvedBy = employeeId;
      if (note) message.resolutionNote = note;
      
      // Update performance stats
      await EmployeeContactPerformance.updateStats(employeeId, employeeName, {
        'monthlyStats.messagesResolved': 1
      });
    }

    await message.save();

    // Log activity
    await logActivity(
      id, 
      employeeId, 
      employeeName, 
      'status_changed', 
      `Status changed from ${oldStatus} to ${status}`,
      oldStatus,
      status
    );

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
};

// PUT /api/employee/contact-messages/:id/priority - Update message priority
export const updateMessagePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, employeeId, employeeName } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    const oldPriority = message.priority;
    message.priority = priority;
    await message.save();

    // Log activity
    await logActivity(
      id, 
      employeeId, 
      employeeName, 
      'priority_changed', 
      `Priority changed from ${oldPriority} to ${priority}`,
      oldPriority,
      priority
    );

    res.status(200).json({
      success: true,
      message: 'Priority updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Error updating message priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message priority',
      error: error.message
    });
  }
};

// PUT /api/employee/contact-messages/:id/assign - Assign message to employee
export const assignMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignToEmployeeId, assignToEmployeeName, employeeId, employeeName } = req.body;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    const oldAssignee = message.assignedTo?.employeeName || 'Unassigned';

    await message.assignTo(assignToEmployeeId, assignToEmployeeName);

    // Update performance stats for assigned employee
    await EmployeeContactPerformance.updateStats(assignToEmployeeId, assignToEmployeeName, {
      'monthlyStats.messagesHandled': 1
    });

    // Log activity
    await logActivity(
      id, 
      employeeId, 
      employeeName, 
      'assigned', 
      `Message assigned from ${oldAssignee} to ${assignToEmployeeName}`,
      oldAssignee,
      assignToEmployeeName
    );

    res.status(200).json({
      success: true,
      message: 'Message assigned successfully',
      data: message
    });

  } catch (error) {
    console.error('Error assigning message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign message',
      error: error.message
    });
  }
};

// POST /api/employee/contact-messages/:id/note - Add internal note
export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, employeeId, employeeName } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await message.addInternalNote(note.trim(), employeeId);

    // Log activity
    await logActivity(
      id, 
      employeeId, 
      employeeName, 
      'note_added', 
      `Internal note added: "${note.trim().substring(0, 50)}${note.trim().length > 50 ? '...' : ''}"`
    );

    res.status(200).json({
      success: true,
      message: 'Internal note added successfully',
      data: message
    });

  } catch (error) {
    console.error('Error adding internal note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add internal note',
      error: error.message
    });
  }
};

// DELETE /api/employee/contact-messages/:id - Delete contact message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, employeeName } = req.body;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Store message details for logging
    const messageDetails = `${message.firstName} ${message.lastName} - ${message.subject}`;

    await ContactMessage.findByIdAndDelete(id);

    // Delete related activities
    await ContactActivity.deleteMany({ contactMessageId: id });

    // Log activity (create a final log entry)
    try {
      await ContactActivity.logActivity({
        contactMessageId: id,
        employeeId,
        employeeName,
        action: 'deleted',
        details: `Message deleted: ${messageDetails}`
      });
    } catch (logError) {
      console.error('Error logging delete activity:', logError);
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
      data: { id, messageDetails }
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
};

// GET /api/employee/contact-templates - Get contact templates
export const getContactTemplates = async (req, res) => {
  try {
    const { category } = req.query;

    const templates = await ContactTemplate.getActiveTemplates(category);

    res.status(200).json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error fetching contact templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact templates',
      error: error.message
    });
  }
};

// POST /api/employee/contact-templates - Create contact template
export const createContactTemplate = async (req, res) => {
  try {
    const { templateId, name, category, subject, content, variables, employeeId } = req.body;

    if (!templateId || !name || !category || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const template = new ContactTemplate({
      templateId,
      name,
      category,
      subject,
      content,
      variables: variables || [],
      createdBy: employeeId
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Contact template created successfully',
      template
    });

  } catch (error) {
    console.error('Error creating contact template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact template',
      error: error.message
    });
  }
};

// GET /api/employee/contact-performance/:employeeId - Get employee performance stats
export const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const performance = await EmployeeContactPerformance.findOne({ employeeId });

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Performance data not found for this employee'
      });
    }

    // Get recent activities
    const recentActivities = await ContactActivity.getEmployeeActivity(employeeId, 20);

    res.status(200).json({
      success: true,
      performance,
      recentActivities
    });

  } catch (error) {
    console.error('Error fetching employee performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee performance',
      error: error.message
    });
  }
};

// GET /api/employee/contact-dashboard - Get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { employeeId } = req.query;

    // Get general statistics
    const stats = await ContactMessage.getStatistics();

    // Get messages assigned to this employee (if employeeId provided)
    let assignedStats = null;
    if (employeeId) {
      const assignedMessages = await ContactMessage.find({ 'assignedTo.employeeId': employeeId });
      assignedStats = {
        total: assignedMessages.length,
        unread: assignedMessages.filter(msg => !msg.isRead).length,
        replied: assignedMessages.filter(msg => msg.isReplied).length,
        resolved: assignedMessages.filter(msg => msg.status === 'resolved').length
      };
    }

    // Get recent messages (last 10)
    const recentMessages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email subject createdAt isRead isReplied priority status');

    // Get category breakdown
    const categoryStats = await ContactMessage.getByCategory();

    // Get priority breakdown
    const priorityStats = await ContactMessage.getByPriority();

    // Get recent activities (if employeeId provided)
    let recentActivities = [];
    if (employeeId) {
      recentActivities = await ContactActivity.getEmployeeActivity(employeeId, 10);
    }

    res.status(200).json({
      success: true,
      stats,
      assignedStats,
      recentMessages,
      categoryStats,
      priorityStats,
      recentActivities
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};