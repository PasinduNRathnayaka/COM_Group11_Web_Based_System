// utils/emailService.js - FIXED VERSION
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter with better error handling
const createTransport = () => {
  // Log email config for debugging (remove in production)
  console.log('📧 Email Config:', {
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASS
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add these options for better reliability
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit verification code
export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random token for additional security
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ✅ FIXED: Enhanced sendPasswordResetEmail with better user type support
export const sendPasswordResetEmail = async (email, resetCode, userName, userType = 'user') => {
  try {
    console.log(`📧 Sending reset email to: ${email} (Type: ${userType}, User: ${userName})`);
    
    // Check if email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const transporter = createTransport();

    // Test the connection first
    console.log('🔍 Testing email connection...');
    await transporter.verify();
    console.log('✅ Email server connection verified');

    // ✅ FIXED: Enhanced email content customization based on user type
    const getEmailContent = (userType) => {
      const contentMap = {
        user: {
          title: 'Customer Account',
          greeting: 'Dear Customer',
          accountType: 'Customer Account',
          description: 'We received a request to reset your password for your customer account at Kamal Auto Parts.',
          brandColor: '#667eea'
        },
        employee: {
          title: 'Employee Account',
          greeting: `Dear ${userName}`,
          accountType: 'Employee Account',
          description: 'We received a request to reset your password for your employee account at Kamal Auto Parts.',
          brandColor: '#28a745'
        },
        admin: {
          title: 'Admin Account',
          greeting: `Dear ${userName}`,
          accountType: 'Admin Account',
          description: 'We received a request to reset your password for your admin account at Kamal Auto Parts.',
          brandColor: '#dc3545'
        },
        seller: {
          title: 'Seller Account',
          greeting: `Dear ${userName}`,
          accountType: 'Seller Account',
          description: 'We received a request to reset your password for your seller account at Kamal Auto Parts.',
          brandColor: '#fd7e14'
        },
        online_employee: {
          title: 'E-commerce Employee Account',
          greeting: `Dear ${userName}`,
          accountType: 'E-commerce Employee Account',
          description: 'We received a request to reset your password for your e-commerce employee account at Kamal Auto Parts.',
          brandColor: '#17a2b8'
        }
      };
      
      return contentMap[userType] || contentMap.user;
    };

    const emailContent = getEmailContent(userType);

    const mailOptions = {
      from: {
        name: 'Kamal Auto Parts',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: `Password Reset Request - ${emailContent.accountType} - Kamal Auto Parts`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - ${emailContent.accountType}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${emailContent.brandColor} 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔧 Kamal Auto Parts</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Password Reset Request</p>
            <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">${emailContent.accountType}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">${emailContent.greeting}!</h2>
            
            <p>${emailContent.description}</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${emailContent.brandColor}; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">🔐 Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: ${emailContent.brandColor}; letter-spacing: 3px; text-align: center; padding: 15px; background: #f8f9ff; border-radius: 5px; border: 2px dashed ${emailContent.brandColor};">
                ${resetCode}
              </div>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;">
                <strong>⏰ Important:</strong> This code will expire in 15 minutes for security reasons.
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>🛡️ Security Note:</strong> If you didn't request this password reset, please ignore this email and contact our support team.
              </p>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 0;">
                Best regards,<br>
                <strong>Kamal Auto Parts Team</strong><br>
                <span style="color: #666; font-size: 14px;">Your trusted auto parts partner</span>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>Account Type: ${emailContent.accountType} | User: ${userName}</p>
            <p>&copy; ${new Date().getFullYear()} Kamal Auto Parts. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        ${emailContent.greeting}!
        
        ${emailContent.description}
        
        Your verification code is: ${resetCode}
        
        This code will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email and secure your account.
        
        Best regards,
        Kamal Auto Parts Team
        Account Type: ${emailContent.accountType}
      `
    };

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('📧 Details:', {
      messageId: result.messageId,
      email: email,
      userType: userType,
      userName: userName,
      accountType: emailContent.accountType
    });
    
    return { 
      success: true, 
      messageId: result.messageId,
      userType: userType,
      email: email,
      accountType: emailContent.accountType
    };

  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send password reset email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your Gmail App Password settings';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Email server not found. Please check your internet connection';
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'Invalid email credentials. Please verify EMAIL_USER and EMAIL_PASS';
    } else if (error.message.includes('Invalid email format')) {
      errorMessage = 'Invalid email format provided';
    }
    
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};
// Send password reset success notification
export const sendPasswordResetSuccessEmail = async (email, userName) => {
  try {
    // FIXED: Changed from createTransporter() to createTransport()
    const transporter = createTransport();

    const mailOptions = {
      from: {
        name: 'Kamal Auto Parts',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Password Successfully Reset - Kamal Auto Parts',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Kamal Auto Parts</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Password Reset Successful</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Success!</strong> Your password has been reset successfully.
              </p>
            </div>
            
            <p>Your password for your Kamal Auto Parts account has been successfully updated. You can now log in with your new password.</p>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't make this change, please contact our support team immediately.
            </p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>Kamal Auto Parts Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Kamal Auto Parts. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset success email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending success email:', error);
    return { success: false, error: error.message };
  }
};