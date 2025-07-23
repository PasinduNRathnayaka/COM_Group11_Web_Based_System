import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';

const CustomerReplies = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  // 🔹 Load messages on component mount
  useEffect(() => {
    axios.get('http://localhost:4000/api/message')
      .then(res => {
        setMessages(res.data);
        const uniqueUsers = [...new Set(res.data.map(m => m.user))];
        setUsers(uniqueUsers);
        if (uniqueUsers.length > 0) setSelectedUser(uniqueUsers[0]);
      })
      .catch(err => console.error('Load failed:', err));
  }, []);

  // 🔹 Send new message
  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;

    axios.post('http://localhost:4000/api/message', {
      sender: 'employee',
      content: input,
      user: selectedUser,
    }).then(res => {
      setMessages([...messages, res.data]);
      setInput('');
    }).catch(err => console.error('Send failed:', err));
  };

  const filteredMessages = messages.filter(msg => msg.user === selectedUser);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Customer Replies</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Customer Replies</p>

      <div className="flex bg-white rounded-lg shadow h-[80vh]">
        {/* User list */}
        <div className="w-1/4 border-r p-3">
          <input
            type="text"
            placeholder="Search Here..."
            className="w-full mb-4 p-2 border rounded"
          />
          <ul className="space-y-3">
            {users.map((user, i) => (
              <li
                key={i}
                className={`flex items-center space-x-2 cursor-pointer ${
                  selectedUser === user ? 'font-bold text-blue-500' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-300" />
                <div className="text-sm">{user}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {filteredMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'employee' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'employee'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center border-t p-3 space-x-2">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 p-2 border rounded"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <FaPaperclip className="text-gray-500 cursor-pointer" />
            <FaPaperPlane className="text-blue-600 cursor-pointer" onClick={sendMessage} />
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
    </div>
  );
};

export default CustomerReplies;

