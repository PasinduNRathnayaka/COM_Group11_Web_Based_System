import React, { useState } from 'react';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';

const messagesData = [
  {
    sender: 'User',
    text: 'Hi David, have you got the project report pdf?',
    time: 'Yesterday',
  },
  {
    sender: 'David',
    text: 'NO. I did not get it',
  },
  {
    sender: 'David',
    text: 'Ok, I will just send it here. Plz be sure to fill the details by today end of the day.',
  },
  {
    sender: 'David',
    file: 'project_report.pdf',
  },
  {
    sender: 'User',
    text: 'OK. Should I send it over email as well after filling the details.',
  },
  {
    sender: 'David',
    text: "Ya. I’ll be adding more team members to it.",
  },
  {
    sender: 'User',
    text: 'OK',
  },
];

const users = [
  'David Peters',
  'Lisa Roy',
  'Jamie Taylor',
  'Jason Roy',
  'Amy Frost',
  'Paul Wilson',
  'Ana Williams',
];

const CustomerReplies = () => {
  const [input, setInput] = useState('');

  return (

    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Customer Replies</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Customer Replies</p>

      <div className="flex bg-white rounded-lg shadow h-[80vh]">
        {/* Left Chat List */}
        <div className="w-1/4 border-r p-3">
          <input
            type="text"
            placeholder="Search Here..."
            className="w-full mb-4 p-2 border rounded"
          />
          <ul className="space-y-3">
            {users.map((user, i) => (
              <li key={i} className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-300" />
                <div className="text-sm">{user}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Chat Window */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messagesData.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'User' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'User'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {msg.text ? (
                    <p>{msg.text}</p>
                  ) : (
                    <div className="flex items-center">
                      📄 <span className="ml-2 underline">{msg.file}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center border-t p-3 space-x-2">
            <input
              type="text"
              placeholder="Write something..."
              className="flex-1 p-2 border rounded"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <FaPaperclip className="text-gray-500 cursor-pointer" />
            <FaPaperPlane className="text-blue-600 cursor-pointer" />
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
