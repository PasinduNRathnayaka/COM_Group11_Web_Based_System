import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import connectDB from './configs/db.js';
import productRoutes from './routes/Seller/product.routes.js';
import categoryRoutes from './routes/Seller/category.routes.js';
import employeeRoutes from './routes/Seller/employee.routes.js';
import sellerOrderRoutes from './routes/Seller/order.routes.js';
import billRoutes from './routes/Seller/bill.routes.js';

import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import productReviewRoutes from './routes/productReviewRoutes.js';
import contactRoutes from './routes/contact.js';
import userOrderRoutes from './routes/userOrder.routes.js';

import attendanceRoutes from './routes/Seller/attendance.routes.js';
import salaryRoutes from './routes/Seller/salary.routes.js';

import orderRoutes from './routes/OnlineEmployee/order.routes.js';
import messageRoutes from './routes/OnlineEmployee/message.routes.js';
import leaveRoutes from './routes/employee/leave.routes.js';

import viewAttendanceRoutes from './routes/Employee/viewattendance.routes.js';

// Employee Profile Routes
import employeeProfileRoutes from './routes/Employee/profile.routes.js';

// 🆕 Admin Routes
import adminRoutes from './routes/Admin/admin.routes.js';

import { sendPasswordResetEmail } from './utils/emailService.js';

const app = express();
dotenv.config();

// Setup __dirname (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories
const createDirectories = () => {
  const directories = [
    'uploads',
    'uploads/profiles',
    'uploads/admin', // 🆕 Admin uploads directory
    'controllers',
    'controllers/Employee',
    'controllers/Admin', // 🆕 Admin controllers directory
    'routes/Employee',
    'routes/Admin', // 🆕 Admin routes directory
    'models/Admin', // 🆕 Admin models directory
    'middlewares'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Create directories on startup
createDirectories();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ✅ Serve static images
app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res, path, stat) => {
      res.set('Access-Control-Allow-Origin', '*');
    },
  })
);

// 🔑 ADD TEST EMAIL ROUTE - REMOVE AFTER TESTING
app.get('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        error: 'Email credentials not configured in .env file',
        emailUser: process.env.EMAIL_USER,
        emailPassSet: !!process.env.EMAIL_PASS
      });
    }
    
    // Send test email
    await sendPasswordResetEmail('test@example.com', '123456', 'Test User');
    res.json({ 
      message: 'Test email sent successfully!',
      emailUser: process.env.EMAIL_USER,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      error: error.message,
      emailUser: process.env.EMAIL_USER,
      emailPassSet: !!process.env.EMAIL_PASS
    });
  }
});

// 🔧 Enhanced email debugging routes - ADD AFTER EXISTING /test-email ROUTE
app.get('/debug-employees-email', async (req, res) => {
  try {
    const Employee = (await import('./models/Seller/Employee.js')).default;
    
    const employees = await Employee.find({}, {
      empId: 1,
      name: 1,
      email: 1,
      username: 1,
      category: 1,
      role: 1
    });
    
    const emailStats = {
      total: employees.length,
      withEmail: employees.filter(emp => emp.email).length,
      withoutEmail: employees.filter(emp => !emp.email).length
    };
    
    const employeeList = employees.map(emp => ({
      empId: emp.empId,
      name: emp.name,
      email: emp.email || 'NO EMAIL SET',
      username: emp.username,
      category: emp.category,
      canReceiveEmails: !!emp.email
    }));
    
    console.log('📊 Employee email statistics:', emailStats);
    
    res.json({
      success: true,
      statistics: emailStats,
      employees: employeeList
    });
    
  } catch (error) {
    console.error('❌ Employee email debug failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Test employee email specifically
app.post('/test-employee-email', async (req, res) => {
  try {
    const { empId, email, category } = req.body;
    
    if (!empId && !email) {
      return res.status(400).json({ error: 'Either empId or email is required' });
    }
    
    const Employee = (await import('./models/Seller/Employee.js')).default;
    
    let employee;
    if (empId) {
      employee = await Employee.findOne({ empId });
    } else {
      employee = await Employee.findOne({ 
        $or: [{ email }, { username: email }] 
      });
    }
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    if (!employee.email) {
      return res.status(400).json({ 
        error: 'Employee has no email address set. Cannot send email.',
        employee: {
          empId: employee.empId,
          name: employee.name,
          username: employee.username,
          category: employee.category
        }
      });
    }
    
    // Determine user type
    let userType = 'employee';
    if (employee.category === 'seller' || employee.category === 'admin') {
      userType = 'admin';
    } else if (employee.category === 'Employee for E-com' || employee.category === 'online_employee') {
      userType = 'online_employee';
    }
    
    // Send test email
    const result = await sendPasswordResetEmail(
      employee.email, 
      '123456', 
      employee.name, 
      userType
    );
    
    res.json({ 
      success: true,
      message: 'Test email sent to employee successfully!',
      employee: {
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        category: employee.category,
        userType: userType
      },
      result: result
    });
    
  } catch (error) {
    console.error('❌ Employee email test failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Update employee email (Admin function)
app.put('/admin/employee/:empId/email', async (req, res) => {
  try {
    const { empId } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const Employee = (await import('./models/Seller/Employee.js')).default;
    
    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmployee && existingEmployee.empId !== empId) {
      return res.status(400).json({ 
        error: 'Email already exists for another employee',
        existingEmployee: {
          empId: existingEmployee.empId,
          name: existingEmployee.name
        }
      });
    }
    
    // Update employee email
    const employee = await Employee.findOneAndUpdate(
      { empId },
      { email: email.toLowerCase().trim() },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      message: 'Employee email updated successfully',
      employee: {
        empId: employee.empId,
        name: employee.name,
        email: employee.email,
        category: employee.category
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating employee email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk update employee emails
app.post('/admin/employees/bulk-update-emails', async (req, res) => {
  try {
    const { employees } = req.body; // Array of {empId, email}
    
    if (!Array.isArray(employees)) {
      return res.status(400).json({ error: 'Employees array is required' });
    }
    
    const Employee = (await import('./models/Seller/Employee.js')).default;
    const results = [];
    const errors = [];
    
    for (const empData of employees) {
      try {
        const { empId, email } = empData;
        
        // Validate email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
          errors.push({ empId, error: 'Invalid email format' });
          continue;
        }
        
        // Update employee
        const employee = await Employee.findOneAndUpdate(
          { empId },
          { email: email.toLowerCase().trim() },
          { new: true }
        );
        
        if (!employee) {
          errors.push({ empId, error: 'Employee not found' });
          continue;
        }
        
        results.push({
          empId: employee.empId,
          name: employee.name,
          email: employee.email,
          category: employee.category
        });
        
      } catch (error) {
        errors.push({ empId: empData.empId, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Updated ${results.length} employees, ${errors.length} errors`,
      results,
      errors
    });
    
  } catch (error) {
    console.error('❌ Error bulk updating employee emails:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🆕 Admin initialization endpoint
app.post('/api/admin/init', async (req, res) => {
  try {
    const Admin = (await import('./models/Admin/Admin.js')).default;
    
    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Please use login endpoint.'
      });
    }

    // Create default admin
    const defaultAdmin = await Admin.create({
      name: 'Administrator',
      email: 'admin@kamalautoparts.com',
      password: 'admin123',
      mobile: '+94771234567',
      role: 'super_admin'
    });

    console.log('✅ Default admin initialized successfully');

    res.json({
      success: true,
      message: 'Default admin initialized successfully',
      admin: defaultAdmin.getPublicProfile(),
      credentials: {
        email: 'admin@kamalautoparts.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Admin initialization failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Existing Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/seller/orders', sellerOrderRoutes); 

app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/product-reviews', productReviewRoutes);
app.use('/api/user-orders', userOrderRoutes);
app.use('/api/attendance', viewAttendanceRoutes);
app.use('/api/bills', billRoutes);

app.use('/api/leaves', leaveRoutes);


app.use('/api/contact', contactRoutes);
app.use('/api/employee', messageRoutes);

// Employee Profile Routes - using different path to avoid conflicts
app.use('/api/employee-profile', employeeProfileRoutes);

// 🆕 Admin Routes
app.use('/api/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('✅ API is Working - Admin System Ready');
});

// 🆕 Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      server: 'running',
      adminSystem: 'active'
    }
  });
});

// Start Server
connectDB();

app.listen(process.env.PORT || 4000, () => {
  console.log('🚀 Server started on port 4000');
  console.log('🔐 Admin system initialized');
  console.log('📊 Visit /health for system status');
});