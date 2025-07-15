import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
      type: String,
      required: [true, 'Please enter your name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: '', // placeholder until user uploads
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
