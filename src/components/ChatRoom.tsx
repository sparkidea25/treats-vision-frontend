import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.VITE_API_LINK)

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
  const {authenticated, user} = usePrivy();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);



  // add code to return current authenticated user in page
  // useEffect(() => {
  //   if (authenticated && user) {
  //     socket.emit('createRoom', user.email);
  //     console.log('User connected:', user.email);
  //   }

  console.log(message, 'messagess')

      useEffect(() => {
            socket.on('receiveMessage', (data) => {
              console.log(data, 'received message');
                setMessages((prevMessages) => [...prevMessages, data]);
            });

            return () => {
                socket.off('receiveMessage');
            };
        }, []);

        const sendMessage = () => {
            socket.emit('sendMessage', message);
            setMessage('');
        };

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

      {/* Fill all space with chat messages or 'no chat' and input at the bottom */}
      <div className="flex-1 flex flex-col justify-between bg-green-50">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 overflow-y-auto">
          {messages.length === 0 ? (
            <span className="text-2xl text-gray-400 font-mono">no chat</span>
          ) : (
            messages.map((msg, index) => {
              // Support both string and object message formats
              if (typeof msg === 'string') {
                return (
                  <p key={index} className="w-full text-left text-base text-gray-800 mb-2 break-words">{msg}</p>
                );
              } else if (msg && typeof msg === 'object' && msg.text) {
                return (
                  <p key={index} className="w-full text-left text-base text-gray-800 mb-2 break-words">{msg.text}</p>
                );
              } else {
                return null;
              }
            })
          )}
        </div>
        <div className="w-full p-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-2xl font-mono border border-black rounded-none bg-transparent placeholder-gray-400 px-4 py-6"
            placeholder="Type your message..."
            style={{ minHeight: '80px' }}
          />
        </div>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;

