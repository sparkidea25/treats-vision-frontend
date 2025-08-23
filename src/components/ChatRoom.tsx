import { useEffect, useState } from "react";
import { ApiStrings } from "@/lib/apiStrings";
import { usePrivy } from "@privy-io/react-auth";
import { io, Socket } from "socket.io-client";

interface ChatRoomProps {
  streamId: string;
  onChatToggle?: (isOpen: boolean) => void;
}

function ChatRoom({ streamId, onChatToggle }: ChatRoomProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { authenticated, user } = usePrivy();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Notify parent component when chat state changes
  useEffect(() => {
    onChatToggle?.(isOpen);
  }, [isOpen, onChatToggle]);

  const fetchUsername = async (privyId: any) => {
    try {
      const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${privyId}`);
      const data = await res.json();
      return data.name;
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  useEffect(() => {
    if (authenticated && user && user.id) {
      fetchUsername(user.id).then((uname) => {
        setUsername(uname);
      });
    }
  }, [authenticated, user]);

  // Initialize socket inside useEffect
  useEffect(() => {
    const newSocket = io("https://api.treats.vision", {
      path: "/socket.io/",
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected with ID:", newSocket.id);
      
      // Join the room when connected
      const currentUserId = username || user?.email || user?.id || "Anonymous";
      newSocket.emit("joinRoom", {
        roomId: streamId,
        userId: currentUserId
      });
    });

    // Handle when a user joins the room
    newSocket.on("userJoined", (userId: string) => {
      const joinMessage = {
        user: "System",
        message: `${userId} joined chat`,
        streamId,
        timestamp: Date.now(),
        isSystemMessage: true
      };
      setMessages((prev) => [...prev, joinMessage]);
    });

    newSocket.on("user-join", (data: { message: string; clientId: string }) => {
      setMessages((prev) => [...prev, { text: data.message, clientId: data.clientId }]);
    });

    newSocket.on("userTyping", (data) => {
      if (data.streamId !== streamId) return;
      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.username)) {
          return [...prev, data.username];
        } else if (!data.isTyping && prev.includes(data.username)) {
          return prev.filter((u) => u !== data.username);
        }
        return prev;
      });
    });

    newSocket.on("receiveMessage", (data) => {
      if (data.streamId !== streamId) return;
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [streamId, username, user]);

  const sendMessage = () => {
    if (!message.trim() || !socket || !socket.connected) return;
    
    const msgObj = {
      user: username || user?.email || "Anonymous",
      message: message.trim(),
      streamId,
      timestamp: Date.now()
    };
    
    socket.emit("sendMessage", msgObj);
    setMessages((prev) => [...prev, msgObj]);
    setMessage("");

    // Clear typing indicator after sending
    if (isTyping) {
      setIsTyping(false);
      socket.emit("typing", {
        username: username || user?.email || "Anonymous",
        isTyping: false,
        streamId,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !socket.connected) return;

    const currentUsername = username || user?.email || "Anonymous";

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        username: currentUsername,
        isTyping: true,
        streamId,
      });
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      socket.emit("typing", {
        username: currentUsername,
        isTyping: false,
        streamId,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
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
              className="w-8 h-8 border border-black rounded-full"
              onClick={() => setIsOpen(true)}
            >
              ←
            </button>
          </div>
        </div>
      )}

      {/* Expanded chat */}
      {isOpen && (
        <div className="w-80 bg-lime-50 border-l border-black flex flex-col">
          {/* Chat header */}
          <div className="p-6 border-b border-black flex items-center justify-between">
            <span className="font-semibold text-lg flex-1 text-center">tv chat</span>
            <button
              className="w-8 h-8 border border-black rounded-full"
              onClick={() => setIsOpen(false)}
            >
              →
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {messages.length === 0 ? (
              <span className="text-2xl text-gray-400 font-mono">no chat</span>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div key={`${msg.timestamp || index}-${index}`} className="flex items-start p-2">
                    <img
                      src="/assets/Icons.png"
                      alt="User"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className={`text-left text-base break-words ${msg.isSystemMessage ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                      <span className="font-bold">{msg.user || "Anonymous"}: </span>
                      <span>{msg.message || msg.text || msg}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 pb-1 text-sm text-gray-600">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-black bg-lime-50">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={message} 
                onChange={handleInputChange} 
                onKeyDown={handleKeyDown} 
                className="flex-1 text-base font-mono border border-black bg-white placeholder-gray-400 px-3 py-2 rounded-none" 
                placeholder="Type your message..."
                disabled={!socket || !socket.connected}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || !socket || !socket.connected}
                className="px-4 py-2 bg-gray-800 text-white border border-black hover:bg-gray-700"
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