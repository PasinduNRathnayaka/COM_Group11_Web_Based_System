import express from 'express';
import ContactMessage from '../models/ContactMessage.js'; // <-- Import model

const router = express.Router();

router.post('/', async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  try {
    const newMessage = new ContactMessage({
      firstName,
      lastName,
      email,
      subject,
      message
    });

    await newMessage.save(); // <-- Save to MongoDB

    res.status(200).json({ message: 'Message received and saved!' });
  } catch (err) {
    console.error('Failed to save message:', err);
    res.status(500).json({ message: 'Error saving message' });
  }
});

export default router;


