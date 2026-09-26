import {  useEffect, useState } from 'react'
import './App.css'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

function App() {
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient]=useState(null);
  const [message,setMessage]=useState('');
  const [name,setName] = useState('User');
useEffect(() => {
    const socket = new SockJS('http://localhost:7070/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      // debug: (str) => {
      //   console.log(str);
      // },
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe('/topic/messages', (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
      }
      // onStompError: (frame) => {
      //   console.error('Broker reported error: ' + frame.headers['message']);
      //   console.error('Additional details: ' + frame.body);
      // },
    });
    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, []); 

  const sendMessage = () => {
    if (stompClient && message.trim() !== '') {
      const chatMessage = {
        sender: name,
        content: message,
      };
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage),
      });
      setMessage('');
    }
  };
  return (
    <>
    <h2>WebSocket Chat</h2> 
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
                                 
    </>
  )
}

export default App
