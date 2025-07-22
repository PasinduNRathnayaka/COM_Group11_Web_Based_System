import Message from '../../models/OnlineEmployee/message.model.js';

export const getMessages = async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
};

export const createMessage = async (req, res) => {
  const { sender, content, attachment, user } = req.body;
  const newMsg = new Message({ sender, content, attachment, user });
  await newMsg.save();
  res.status(201).json(newMsg);
};
