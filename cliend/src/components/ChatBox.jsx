import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/api/message')
      .then(res => setMessages(res.data));
  }, []);

  const sendMessage = () => {
    axios.post('http://localhost:4000/api/message', {
      sender: "employee",
      content: input,
      user: "David Peters"
    }).then(res => {
      setMessages([...messages, res.data]);
      setInput('');
    });
  };

return (
<div style={{ padding: 20 }}>
      
      {/*<div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'employee' ? 'right' : 'left' }}>
            <p><strong>{msg.user}:</strong> {msg.content}</p>
          </div>
        ))}
      </div>*/}
      
    </div>
  );
};

export default ChatBox;