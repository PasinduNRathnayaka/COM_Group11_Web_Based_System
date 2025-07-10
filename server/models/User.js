import User from './User.js';
// models/User.js
import mongoose from 'mongoose';

const options = { discriminatorKey: 'role', timestamps: true };

const baseUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, options);

const User = mongoose.model('User', baseUserSchema);

const Customer = User.discriminator('customer', new mongoose.Schema({
  address: String,
}));
export default User;