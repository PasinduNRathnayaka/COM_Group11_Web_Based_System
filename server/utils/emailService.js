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

// Send password reset email with better error handling
export const sendPasswordResetEmail = async (email, resetCode, userName) => {
  try {
    console.log(`📧 Attempting to send reset email to: ${email}`);
    
    // Check if email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    }

    // FIXED: Changed from createTransporter() to createTransport()
    const transporter = createTransport();

    // Test the connection first
    await transporter.verify();
    console.log('✅ Email server connection verified');

    const mailOptions = {
      from: {
        name: 'Kamal Auto Parts',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Password Reset Request - Kamal Auto Parts',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Kamal Auto Parts</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; text-align: center; padding: 15px; background: #f8f9ff; border-radius: 5px; border: 2px dashed #667eea;">
                ${resetCode}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 15 minutes for security reasons.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Security Tip:</strong> If you didn't request this password reset, please secure your account immediately by logging in and changing your password.
              </p>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
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
      `,
      text: `
        Hello ${userName}!
        
        We received a request to reset your password for your Kamal Auto Parts account.
        
        Your verification code is: ${resetCode}
        
        This code will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        Kamal Auto Parts Team
      `
    };

    console.log('📧 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    console.log('📧 Email sent to:', email);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your email credentials in .env file');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Email server not found. Please check your internet connection');
    } else if (error.message.includes('Invalid login')) {
      throw new Error('Invalid email credentials. Please check EMAIL_USER and EMAIL_PASS in .env file');
    }
    
    throw new Error(`Failed to send password reset email: ${error.message}`);
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