// controllers/Employee/profileController.js
import Employee from '../../models/Seller/Employee.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Get employee profile
export const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    const employee = await Employee.findById(employeeId).select('-password -resetPasswordCode -resetPasswordToken');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: employee._id,
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        contact: employee.contact,
        address: employee.address,
        about: employee.about,
        category: employee.category,
        role: employee.role,
        rate: employee.rate,
        image: employee.image,
        qrCode: employee.qrCode,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update employee profile
export const updateEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { name, email, contact, address, about, password, confirmPassword } = req.body;

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Validate required fields
    if (!name || !contact || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact, and address are required'
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if email already exists for another employee
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: employeeId }
      });
      
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists for another employee'
        });
      }
    }

    // Validate contact number
    const contactRegex = /^\+?[\d\s-()]{10,15}$/;
    if (!contactRegex.test(contact)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact number'
      });
    }

    // Handle password update if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      employee.password = hashedPassword;
    }

    // Update profile fields
    employee.name = name.trim();
    employee.email = email ? email.toLowerCase().trim() : employee.email;
    employee.contact = contact.trim();
    employee.address = address.trim();
    employee.about = about ? about.trim() : employee.about;

    // Handle image upload if provided
    if (req.file) {
      // Delete old image if exists
      if (employee.image) {
        const oldImagePath = path.join(process.cwd(), employee.image.replace(/^\//, ''));
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
      
      employee.image = `/uploads/employees/${req.file.filename}`;
    }

    await employee.save();

    // Return updated profile (excluding sensitive data)
    const updatedEmployee = await Employee.findById(employeeId).select('-password -resetPasswordCode -resetPasswordToken');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedEmployee._id,
        empId: updatedEmployee.empId,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        contact: updatedEmployee.contact,
        address: updatedEmployee.address,
        about: updatedEmployee.about,
        category: updatedEmployee.category,
        role: updatedEmployee.role,
        rate: updatedEmployee.rate,
        image: updatedEmployee.image,
        qrCode: updatedEmployee.qrCode,
        createdAt: updatedEmployee.createdAt,
        updatedAt: updatedEmployee.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Upload profile image only
export const updateProfileImage = async (req, res) => {
  try {
    const employeeId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Delete old image if exists
    if (employee.image) {
      const oldImagePath = path.join(process.cwd(), employee.image.replace(/^\//, ''));
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
    }

    // Update with new image
    employee.image = `/uploads/employees/${req.file.filename}`;
    await employee.save();

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        image: employee.image
      }
    });

  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image'
    });
  }
};

// Change password only
export const changePassword = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Find employee with password
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// Get dashboard statistics for employee
export const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    const employee = await Employee.findById(employeeId).select('-password -resetPasswordCode -resetPasswordToken');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate days since joining
    const daysSinceJoining = Math.floor((new Date() - new Date(employee.createdAt)) / (1000 * 60 * 60 * 24));
    
    // Calculate profile completion percentage
    let completionPercentage = 0;
    const fields = ['name', 'email', 'contact', 'address', 'about', 'image'];
    const completedFields = fields.filter(field => employee[field] && employee[field].toString().trim() !== '');
    completionPercentage = Math.round((completedFields.length / fields.length) * 100);

    res.json({
      success: true,
      data: {
        employee: {
          _id: employee._id,
          empId: employee.empId,
          name: employee.name,
          email: employee.email,
          category: employee.category,
          image: employee.image,
          rate: employee.rate
        },
        statistics: {
          daysSinceJoining,
          profileCompletion: completionPercentage,
          lastUpdated: employee.updatedAt,
          accountStatus: 'Active'
        },
        profileTips: completionPercentage < 100 ? [
          !employee.email && 'Add your email address',
          !employee.about && 'Add information about yourself',
          !employee.image && 'Upload a profile photo'
        ].filter(Boolean) : []
      }
    });

  } catch (error) {
    console.error('Error fetching employee dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard'
    });
  }
};