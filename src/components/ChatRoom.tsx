import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.VITE_API_LINK)

function ChatRoom() {
  const [isOpen, setIsOpen] = useState(true);
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

    const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };



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
    <>
    {!isOpen && (
        <div className="h-full w-16 bg-green-50 border-l-2 border-black flex flex-col">
          {/* Top section */}
          {/* <div className="flex-1 flex flex-col items-center justify-start pt-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full mb-2"></div>
            <span className="text-xs text-gray-800">account</span>
          </div> */}
           <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center">
              <span className="text-lg">👁️</span>
              <span className="text-lg font-bold ml-1">100</span>
            </div>
            <span className="text-sm text-gray-800 mb-4">tv chat</span>
                                  {/* <div className="flex-1 flex flex-col"> */}
            <button
              className="w-8 h-8 bg-transparent border border-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="Open chat"
            >
              <span className="text-sm">←</span>
            </button>
          {/* </div> */}
            <div className="border-t border-black w-full my-4"></div>


          </div>
          
          {/* Middle section with eyes and 100 */}
          {/* <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg">👁️</span>
              <span className="text-lg font-bold ml-1">100</span>
            </div>
            <div className="border-t border-black w-full my-4"></div>
            <span className="text-sm text-gray-800 mb-4">tv chat</span>
          </div> */}
          
          {/* Bottom section with arrow button */}

        </div>
      )}

      {/* Chat panel when open */}
      {isOpen && (
        <div className="h-full w-80 bg-green-50 border-l-2 border-black flex flex-col z-40">
          {/* Chat header */}
          <div className="p-4 border-b border-black flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">👁️</span>
              <span className="text-lg font-bold mr-4">100</span>
            </div>
            <span className="font-semibold text-lg flex-1 text-center">tv chat</span>
            <button
              className="w-8 h-8 bg-transparent border border-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors ml-4"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <span className="text-sm">→</span>
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 flex flex-col justify-between bg-green-50">
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-2 overflow-y-auto">
              {messages.length === 0 ? (
                <span className="text-2xl text-gray-400 font-mono">no chat</span>
              ) : (
                <div className="w-full">
                  {messages.map((msg, index) => (
                    <p key={index} className="w-full text-left text-base text-gray-800 mb-2 break-words bg-white p-2 rounded border border-gray-300">
                      {msg}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="w-full p-4 border-t border-black">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-base font-mono border border-black bg-white placeholder-gray-400 px-3 py-2"
                  placeholder="Type your message..."
                />
                <button 
                  onClick={sendMessage}
                  className="px-4 py-2 bg-gray-800 text-white border border-black hover:bg-gray-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatRoom;

