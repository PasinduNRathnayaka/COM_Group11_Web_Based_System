import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

export default mongoose.model('Employee', employeeSchema);
