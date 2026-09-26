import {  useEffect, useState } from 'react'
import './App.css'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

function NewApp() {
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
      <input
      placeholder="Enter your name"
      value={name}
      onChange={(e) => setName(e.target.value)}
       /> 
      <input
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <ul>
        {messages.map((m,i)=>(
          <li key={i}><strong>{m.sender}:</strong> {m.content}</li>
        ))}
        </ul>    
    </>
  )
}

export default NewApp
