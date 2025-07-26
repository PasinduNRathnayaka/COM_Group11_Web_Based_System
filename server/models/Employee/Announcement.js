import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true,
    default: 'Owner'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Announcement', announcementSchema);