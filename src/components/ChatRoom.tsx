import { ApiStrings } from "@/lib/apiStrings";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

import { io } from "socket.io-client";

// const socket = io(`${import.meta.env.VITE_API_LINK}/3001`);

// https://api.treats.vision
const socket = io("ws://localhost:5173"
  // path: "/socket.io/",
  // transports: ["websocket"],
);



interface ChatRoomProps {
  streamId: string;
  onChatToggle?: (isOpen: boolean) => void;
}

function ChatRoom({ streamId, onChatToggle }: ChatRoomProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { authenticated, user } = usePrivy();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Notify parent component when chat state changes
  useEffect(() => {
    onChatToggle?.(isOpen);
  }, [isOpen, onChatToggle]);

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const fetchUsername = async (privyId: any) => {
    try {
      const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${privyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      console.log(data, 'fetch username')
      return data.name;
    } catch (e) {
      console.log(e);
      return '';
    }
  };

  useEffect(() => {
    if (authenticated && user && user.id) {
      fetchUsername(user.id).then((uname) => {
        setUsername(uname);
      });
    }
  }, [authenticated, user]);

  useEffect(() => {
    socket.on('userTyping', (data) => {
      if (data.streamId !== streamId) return;
      setTypingUsers(prev => {
        if (data.isTyping && !prev.includes(data.username)) {
          return [...prev, data.username];
        } else if (!data.isTyping && prev.includes(data.username)) {
          return prev.filter(u => u !== data.username);
        }
        return prev;
      });
    });

    return () => {
      socket.off('userTyping');
    };
  }, [streamId]);

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      if (data.streamId !== streamId) return;
      console.log(data, 'received message');
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [streamId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const msgObj = user ? { 
      user: username || user.email || 'Anonymous', 
      message, 
      streamId 
    } : { 
      message, 
      streamId 
    };
    socket.emit('sendMessage', msgObj);
    setMessages((prevMessages) => [...prevMessages, msgObj]);
    setMessage('');
    
    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing', { 
        username: username || (user && user.email) || 'Anonymous', 
        isTyping: false, 
        streamId 
      });
    }
  };

  const handleInputChange = (e: any) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { 
        username: username || (user && user.email) || 'Anonymous', 
        isTyping: true, 
        streamId 
      });
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
      socket.emit('typing', { 
        username: username || (user && user.email) || 'Anonymous', 
        isTyping: false, 
        streamId 
      });
    }
  };

  return (
    <div className="h-screen flex">
      {/* Collapsed chat */}
      {!isOpen && (
        <div className="w-16 bg-lime-50 border-l border-black flex flex-col">
          <div className="flex-1 flex flex-col items-center pt-4">
            <div className="flex items-center mb-2">
              <img src="/assets/eyes.png" alt="Eyes" className="w-6 h-6" />
              <span className="text-lg font-bold ml-1">100</span>
            </div>
            <span className="text-sm text-gray-800 mb-4">tv chat</span>
            <button
              className="w-8 h-8 bg-transparent border border-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="Open chat"
            >
              <span className="text-sm">←</span>
            </button>
            <div className="border-t border-black w-full my-4"></div>
          </div>
        </div>
      )}

      {/* Expanded chat */}
      {isOpen && (
        <div className="w-80 bg-lime-50 border-l border-black flex flex-col">
          {/* Chat header */}
          <div className="p-6 border-b border-black flex items-center justify-between">
            <div className="flex items-center">
              <img src="/assets/eyes.png" alt="Eyes" className="w-6 h-6" />
              <span className="text-lg font-bold ml-2">100</span>
            </div>
            <span className="font-semibold text-lg flex-1 text-center">tv chat</span>
            <button
              className="w-8 h-8 bg-transparent border border-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <span className="text-sm">→</span>
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className={`flex-1 flex flex-col w-full px-4 py-2 overflow-y-auto ${messages.length === 0 ? 'items-center justify-center' : 'items-start justify-start'}`}>
              {messages.length === 0 ? (
                <span className="text-2xl text-gray-400 font-mono">no chat</span>
              ) : (
                <div className="w-full space-y-2">
                  {messages.map((msg, index) => (
                    <div key={index} className="w-full flex items-start p-2">
                      <img
                        src="/assets/Icons.png"
                        alt="User Icon"
                        className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-300 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-left text-base text-gray-800 break-words">
                          <span className="font-bold">{msg.user ? msg.user : "Anonymous"}: </span>
                          <span>{msg.message ? msg.message : msg}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4 pb-1">
                <p className="text-sm text-gray-600">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-black bg-lime-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-1 text-base font-mono border border-black bg-white placeholder-gray-400 px-3 py-2 rounded-none"
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
      )}
    </div>
  );
}

export default ChatRoom;