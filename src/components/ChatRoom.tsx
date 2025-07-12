import { useState } from 'react';
import { io } from "socket.io-client";

const socket = io('http://localhost:3000');

function ChatRoom() {
  //   const [chatMessages] = useState([
  //   // { id: 1, user: 'adriana clouart', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  //   // { id: 2, user: 'steph pine', message: 'A bunch of words bla filling the chat here with soe wordsthe chat here with soe wordsthe chat here with soe wordsthe chat here with soe words', avatar: '👤' },
  //   // { id: 3, user: 'claus gusman', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  //   // { id: 4, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  //   // { id: 5, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  //   // { id: 6, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  //   // { id: 7, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  //   // { id: 8, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  // ]);
  // const [newMessage, setNewMessage] = useState('');
  // const [messages, setMessages] = useState([]);
  // const [messageText, setMessageText] = useState('');
  // const [user, setUser] = useState(null);

  // Join a chat room
  // const joinChatRoom = (userDetails) => {
  //   setUser(userDetails);
  //   socket.emit('join', userDetails);
  // };

  // Leave a chat room
  // const leaveChatRoom = () => {
  //   socket.emit('leave', user);
  //   setUser(null);
  // };

  // More code will go here

  return (
    <div className="h-full w-80 bg-green-50 border-l border-gray-200 flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">100</span>
          </div>
          <span className="font-semibold">tv chat</span>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <span className="text-xl">×</span>
        </button>
      </div>

      {/* Fill all space with 'no chat' and input at the bottom */}
      <div className="flex-1 flex flex-col justify-between bg-green-50">
        <div className="flex-1 flex items-center justify-center">
          <span className="text-2xl text-gray-400 font-mono">no chat</span>
        </div>
        <div className="w-full p-4">
          <input
            type="text"
            className="w-full text-2xl font-mono border border-black rounded-none bg-transparent placeholder-gray-400 px-4 py-6"
            placeholder="Type your message..."
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;

