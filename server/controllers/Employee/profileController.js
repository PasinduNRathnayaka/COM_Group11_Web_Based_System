import Employee from '../../models/Seller/Employee.js';
import jwt from 'jsonwebtoken';

// @desc    Get employee profile by empId
// @route   GET /api/employees/:empId
// @access  Private (Employee)
export const getEmployeeProfile = async (req, res) => {
  try {
    const { empId } = req.params;
    
    // Verify that the requesting employee can only access their own profile
    // or if they have admin privileges
    if (req.empId !== empId && req.employee.role !== 'admin' && req.employee.category !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const employee = await Employee.findOne({ empId })
      .select('-password -__v'); // Exclude sensitive fields

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Format response to match frontend expectations
    const employeeData = {
      empid: employee.empId,
      employeeId: employee.empId,
      name: employee.name,
      firstName: employee.firstName || employee.name?.split(' ')[0],
      lastName: employee.lastName || employee.name?.split(' ').slice(1).join(' '),
      email: employee.email,
      mobile: employee.mobile || employee.phone,
      phone: employee.mobile || employee.phone,
      department: employee.department,
      position: employee.position || employee.role,
      bio: employee.bio || `${employee.name} is a dedicated employee in the ${employee.department || 'company'} department.`,
      profileImage: employee.profileImage || employee.image,
      image: employee.profileImage || employee.image,
      category: employee.category,
      role: employee.role,
      joinDate: employee.createdAt || employee.joinDate,
      status: employee.status || 'active'
    };

    res.status(200).json({
      success: true,
      data: employeeData
    });

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current employee's own profile
// @route   GET /api/employees/profile/me
// @access  Private (Employee)
// @desc    Get current employee's own profile
// @route   GET /api/employees/profile/me
// @access  Private (Employee)
// @desc    Get current employee's own profile
// @route   GET /api/employees/profile/me
// @access  Private (Employee)
export const getMyProfile = async (req, res) => {
  try {
    console.log('🔍 getMyProfile called');
    console.log('🔍 req.empId:', req.empId);
    console.log('🔍 req.employee:', req.employee ? 'exists' : 'missing');
    
    // Import Employee model dynamically - correct path
    const Employee = (await import('../../models/Seller/Employee.js')).default;
    console.log('🔍 Employee model imported successfully');
    
    const employee = await Employee.findOne({ empId: req.empId })
      .select('-password -__v');

    console.log('🔍 Database query result:', employee ? 'found' : 'not found');
    console.log('🔍 Employee data:', employee);

    if (!employee) {
      console.log('❌ Employee not found in database');
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
        debug: {
          searchedEmpId: req.empId,
          requestEmployee: req.employee
        }
      });
    }

    // Format response to match frontend expectations
    const employeeData = {
      empid: employee.empId,
      employeeId: employee.empId,
      name: employee.name,
      firstName: employee.firstName || employee.name?.split(' ')[0],
      lastName: employee.lastName || employee.name?.split(' ').slice(1).join(' '),
      email: employee.email,
      mobile: employee.mobile || employee.phone,
      phone: employee.mobile || employee.phone,
      department: employee.department,
      position: employee.position || employee.role,
      bio: employee.bio || `${employee.name} is a dedicated employee in the ${employee.department || 'company'} department.`,
      profileImage: employee.profileImage || employee.image,
      image: employee.profileImage || employee.image,
      category: employee.category,
      role: employee.role,
      joinDate: employee.createdAt || employee.joinDate,
      status: employee.status || 'active'
    };

    console.log('✅ Sending employee data:', employeeData);

    res.status(200).json({
      success: true,
      data: employeeData
    });

  } catch (error) {
    console.error('❌ Error fetching my profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: {
        empId: req.empId,
        hasEmployee: !!req.employee,
        errorName: error.name,
        errorMessage: error.message
      }
    });
  }
};
export const updateEmployeeProfile = async (req, res) => {
  try {
    const { 
      name, 
      firstName, 
      lastName, 
      email, 
      mobile, 
      phone, 
      bio, 
      department, 
      position 
    } = req.body;

    // Find current employee
    const employee = await Employee.findOne({ empId: req.empId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase(),
        empId: { $ne: req.empId } // Exclude current employee
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists for another employee'
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email.toLowerCase();
    if (mobile || phone) updateData.mobile = mobile || phone;
    if (bio) updateData.bio = bio;
    if (department) updateData.department = department;
    if (position) updateData.position = position;

    // Update employee
    const updatedEmployee = await Employee.findOneAndUpdate(
      { empId: req.empId },
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    // Format response
    const employeeData = {
      empid: updatedEmployee.empId,
      employeeId: updatedEmployee.empId,
      name: updatedEmployee.name,
      firstName: updatedEmployee.firstName || updatedEmployee.name?.split(' ')[0],
      lastName: updatedEmployee.lastName || updatedEmployee.name?.split(' ').slice(1).join(' '),
      email: updatedEmployee.email,
      mobile: updatedEmployee.mobile || updatedEmployee.phone,
      phone: updatedEmployee.mobile || updatedEmployee.phone,
      department: updatedEmployee.department,
      position: updatedEmployee.position || updatedEmployee.role,
      bio: updatedEmployee.bio,
      profileImage: updatedEmployee.profileImage || updatedEmployee.image,
      image: updatedEmployee.profileImage || updatedEmployee.image,
      category: updatedEmployee.category,
      role: updatedEmployee.role
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: employeeData
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload employee profile image
// @route   POST /api/employees/profile/upload-image
// @access  Private (Employee)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update employee profile image
    const updatedEmployee = await Employee.findOneAndUpdate(
      { empId: req.empId },
      { 
        profileImage: imageUrl,
        image: imageUrl // For backward compatibility
      },
      { new: true }
    ).select('-password -__v');

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: updatedEmployee.profileImage,
        image: updatedEmployee.profileImage
      }
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};