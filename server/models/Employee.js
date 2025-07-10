// Employee Mongoose schema
import User from './User.js';
const Employee = User.discriminator('employee', new mongoose.Schema({
  department: String,
}));
export default Employee;