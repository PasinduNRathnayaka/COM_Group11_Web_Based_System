import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
