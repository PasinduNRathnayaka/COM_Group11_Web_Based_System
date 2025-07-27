// scripts/addEmailsToEmployees.js - Script to add emails to existing employees
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Seller/Employee.js';

dotenv.config();

const addEmailsToEmployees = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📁 Connected to MongoDB');

    // Find all employees without email
    const employeesWithoutEmail = await Employee.find({ 
      $or: [
        { email: { $exists: false } },
        { email: null },
        { email: '' }
      ]
    });

    console.log(`📊 Found ${employeesWithoutEmail.length} employees without email addresses`);

    if (employeesWithoutEmail.length === 0) {
      console.log('✅ All employees already have email addresses');
      return;
    }

    // Display employees without emails
    console.log('\n📋 Employees without email addresses:');
    employeesWithoutEmail.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name} (${emp.empId}) - Category: ${emp.category} - Username: ${emp.username}`);
    });

    // You can manually update emails here or create a pattern
    // Example: Generate emails based on empId or username
    for (const employee of employeesWithoutEmail) {
      // ⚠️ CUSTOMIZE THIS LOGIC BASED ON YOUR NEEDS
      
      // Option 1: Generate email based on empId
      const generatedEmail = `${employee.empId.toLowerCase()}@kamalautonparts.com`;
      
      // Option 2: Generate email based on username
      // const generatedEmail = `${employee.username.toLowerCase()}@kamalautonparts.com`;
      
      // Option 3: Generate email based on name
      // const cleanName = employee.name.toLowerCase().replace(/\s+/g, '.');
      // const generatedEmail = `${cleanName}@kamalautonparts.com`;

      console.log(`📧 Adding email ${generatedEmail} to ${employee.name} (${employee.empId})`);
      
      // Update the employee
      await Employee.findByIdAndUpdate(employee._id, {
        email: generatedEmail
      });
    }

    console.log('✅ Successfully added email addresses to all employees');
    
    // Verify the update
    const updatedCount = await Employee.countDocuments({ 
      email: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`📈 Total employees with email addresses: ${updatedCount}`);

  } catch (error) {
    console.error('❌ Error adding emails to employees:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
};

// Run the script
addEmailsToEmployees();