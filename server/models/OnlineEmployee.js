import mongoose from 'mongoose';

const onlineEmployeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

export default mongoose.model('OnlineEmployee', onlineEmployeeSchema);
