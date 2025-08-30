// controllers/Employee/employeeProfileController.js
import Employee from '../../models/Seller/Employee.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Get employee profile (for authenticated employee)
export const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    
    const employee = await Employee.findById(employeeId).select('-password');
    
    if (!employee || employee.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update employee profile
export const updateEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    const { name, email, contact, address, about } = req.body;

    const employee = await Employee.findById(employeeId);
    
    if (!employee || employee.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid email address' 
        });
      }

      // Check if email is already used by another employee
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: employeeId },
        isDeleted: false
      });

      if (existingEmployee) {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is already in use by another employee' 
        });
      }
    }

    // Validate contact number
    if (contact && contact.trim()) {
      const contactRegex = /^\+?[\d\s-()]{10,15}$/;
      if (!contactRegex.test(contact.trim())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid contact number' 
        });
      }
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name must be at least 2 characters long' 
      });
    }

    // Validate about section length
    if (about && about.length > 500) {
      return res.status(400).json({ 
        success: false, 
        message: 'About section must be less than 500 characters' 
      });
    }

    // Update employee fields
    employee.name = name.trim();
    employee.email = email ? email.toLowerCase().trim() : employee.email;
    employee.contact = contact ? contact.trim() : employee.contact;
    employee.address = address ? address.trim() : employee.address;
    employee.about = about ? about.trim() : employee.about;

    // Handle image upload if present
    if (req.file) {
      employee.image = `/uploads/employees/${req.file.filename}`;
    }

    await employee.save();

    // Return updated employee data without password
    const updatedEmployee = await Employee.findById(employeeId).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedEmployee
    });

  } catch (error) {
    console.error('Update employee profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile' 
    });
  }
};

// Change employee password
export const changeEmployeePassword = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const employee = await Employee.findById(employeeId);
    
    if (!employee || employee.isDeleted) {
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

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, employee.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be different from current password' 
      });
    }

    // Hash and save new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedNewPassword;
    
    await employee.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change employee password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while changing password' 
    });
  }
};

// Get employee dashboard stats (optional)
export const getEmployeeDashboardStats = async (req, res) => {
  try {
    const employeeId = req.employee.id;
    
    const employee = await Employee.findById(employeeId).select('-password');
    
    if (!employee || employee.isDeleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Calculate some basic stats
    const joinedDate = employee.createdAt;
    const daysWorking = Math.floor((Date.now() - joinedDate) / (1000 * 60 * 60 * 24));
    
    res.json({
      success: true,
      data: {
        employeeInfo: {
          name: employee.name,
          empId: employee.empId,
          category: employee.category,
          rate: employee.rate,
          joinedDate: joinedDate
        },
        stats: {
          daysWorking: daysWorking,
          profileCompleteness: calculateProfileCompleteness(employee)
        }
      }
    });

  } catch (error) {
    console.error('Get employee dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (employee) => {
  let completeness = 0;
  const fields = ['name', 'email', 'contact', 'address', 'about', 'image'];
  
  fields.forEach(field => {
    if (employee[field] && employee[field].toString().trim()) {
      completeness += 16.67; // 100/6 fields
    }
  });
  
  return Math.round(completeness);
};