import express from 'express';
import ContactMessage from '../../models/ContactMessage.js';
import nodemailer from 'nodemailer';

const router = express.Router();

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

// GET /api/employee/contact-messages - Get all contact messages
router.get('/contact-messages', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    let query = {};
    
    if (status === 'read') query.isRead = true;
    if (status === 'unread') query.isRead = false;
    if (status === 'replied') query.isReplied = true;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ContactMessage.countDocuments(query);
    
    const stats = {
      total: await ContactMessage.countDocuments(),
      unread: await ContactMessage.countDocuments({ isRead: false }),
      replied: await ContactMessage.countDocuments({ isReplied: true }),
      pending: await ContactMessage.countDocuments({ isRead: true, isReplied: false })
    };

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
});

// GET /api/employee/contact-messages/:id - Get single message
router.get('/contact-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message,
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message
    });
  }
});

// PUT /api/employee/contact-messages/:id/read - Mark as read
router.put('/contact-messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
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
});

// POST /api/employee/contact-messages/:id/reply - Reply to message
router.post('/contact-messages/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, employeeId } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const contactMessage = await ContactMessage.findById(id);
    
    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    const reply = {
      message: replyMessage.trim(),
      employeeId: employeeId || 'ONLINE_EMPLOYEE',
      repliedAt: new Date()
    };

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      {
        $set: {
          isRead: true,
          isReplied: true,
          reply: reply,
          readAt: contactMessage.readAt || new Date()
        }
      },
      { new: true }
    );

    // Send email reply
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
              
              <p>Thank you for contacting us. Here is our response to your message about "<strong>${contactMessage.subject}</strong>":</p>
              
              <div style="background-color: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              
              <div style="background-color: #e5e7eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #374151;">Your Original Message:</h4>
                <p style="margin: 0; font-style: italic; color: #6b7280;">"${contactMessage.message}"</p>
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us.</p>
              
              <div style="border-top: 1px solid #d1d5db; padding-top: 20px; margin-top: 20px;">
                <h4 style="color: #374151; margin: 0 0 10px 0;">Contact Information:</h4>
                <p style="margin: 5px 0; color: #6b7280;">📍 No 128, Wewurukannala Road, Kekanadura, Sri Lanka</p>
                <p style="margin: 5px 0; color: #6b7280;">📞 +94 0777 555 919</p>
                <p style="margin: 5px 0; color: #6b7280;">📧 kamalautoparts@gmail.com</p>
              </div>
            </div>
            
            <div style="background-color: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2024 KAMAL AUTO PARTS. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Reply email sent to ${contactMessage.email}`);

    } catch (emailError) {
      console.error('❌ Failed to send reply email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      reply: reply,
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
});

// DELETE /api/employee/contact-messages/:id - Delete message
router.delete('/contact-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await ContactMessage.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
      data: deletedMessage
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
});

export default router;