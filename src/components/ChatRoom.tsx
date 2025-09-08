import { useEffect, useState, useRef } from "react";
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMsgCount, setNewMsgCount] = useState(0);
  
  // Enhanced debug states
  const [socketConnected, setSocketConnected] = useState(false);

  const isScrolledToBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 10;
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setNewMsgCount(0);
  };

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    if (isScrolledToBottom()) {
      scrollToBottom();
    } else {
      setNewMsgCount((c) => c + 1);
    }
    // eslint-disable-next-line
  }, [messages]);

  const handleScroll = () => {
    if (isScrolledToBottom()) setNewMsgCount(0);
  };

  // Notify parent component when chat state changes
  useEffect(() => {
    onChatToggle?.(isOpen);
  }, [isOpen, onChatToggle]);

  const fetchUsername = async (privyId: any) => {
    try {
      console.log("Fetching username for:", privyId);
      const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${privyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 'true',
        }
      });
      const data = await res.json();
      console.log("Username fetched:", data.name);
      return data.name;
    } catch (e) {
      console.error("Error fetching username:", e);
      return "";
    }
  };

  // Get effective username for display and socket communication
  const getEffectiveUsername = () => {
    return username || user?.email || `Anonymous_${user?.id?.slice(-4) || Math.random().toString(36).slice(-4)}`;
  };

  useEffect(() => {
    if (authenticated && user && user.id) {
      console.log("Authenticated user detected, fetching username...");
      fetchUsername(user.id).then((uname) => {
        setUsername(uname);
        console.log("Username set to:", uname);
      });
    }
  }, [authenticated, user]);

  // Socket connection effect - don't wait for username, connect immediately
  useEffect(() => {
    if (!streamId) {
      console.log("Waiting for streamId before connecting socket...");
      return;
    }

    const effectiveUsername = getEffectiveUsername();
    console.log("Initializing socket for streamId:", streamId, "with username:", effectiveUsername);
    
    const newSocket = io("https://api.treats.vision", {
      path: "/socket.io/",
      transports: ["websocket"],
      timeout: 20000,
      forceNew: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);
      setSocketConnected(true);

      // Join room immediately with effective username
      newSocket.emit("joinRoom", {
        roomId: streamId,
        userId: effectiveUsername,
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    newSocket.on("userJoined", (userId: string) => {
      console.log("User joined event received:", userId);
      const joinMessage = {
        user: "System",
        message: `${userId} joined the chat`,
        streamId,
        timestamp: Date.now(),
        isSystemMessage: true,
      };
      setMessages((prev) => [...prev, joinMessage]);
    });

    newSocket.on("receiveMessage", (data) => {
      if (data.streamId !== streamId) return;
      console.log("Message received:", data);
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("userTyping", (data) => {
      if (data.streamId !== streamId) return;
      console.log("User typing:", data);
      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.username)) {
          return [...prev, data.username];
        } else if (!data.isTyping && prev.includes(data.username)) {
          return prev.filter((u) => u !== data.username);
        }
        return prev;
      });
    });

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
      setSocketConnected(false);
    };
  }, [streamId, username, user?.email, user?.id]); // Include dependencies that affect username

  const sendMessage = () => {
    console.log("Attempting to send message:", { 
      message: message.trim(), 
      socketConnected, 
      socketExists: !!socket 
    });
    
    if (!message.trim()) {
      console.log("Message is empty, not sending");
      return;
    }
    
    const effectiveUsername = getEffectiveUsername();
    const msgObj = {
      user: effectiveUsername,
      message: message.trim(),
      streamId,
      timestamp: Date.now()
    };
    
    console.log("Sending message:", msgObj);
    
    // Add to local messages immediately
    setMessages((prev) => [...prev, msgObj]);
    setMessage("");
    
    // Try to send via socket if connected
    if (socket && socket.connected) {
      socket.emit("sendMessage", msgObj);
    } else {
      console.log("Socket not connected, message stored locally");
    }

    // Clear typing indicator after sending
    if (isTyping) {
      setIsTyping(false);
      if (socket && socket.connected) {
        socket.emit("typing", {
          username: effectiveUsername,
          isTyping: false,
          streamId,
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log("Input changed:", value);
    setMessage(value);

    // Only send typing indicator if socket is ready
    if (socket && socket.connected) {
      const effectiveUsername = getEffectiveUsername();

      if (value.length > 0 && !isTyping) {
        console.log("Starting typing indicator");
        setIsTyping(true);
        socket.emit("typing", {
          username: effectiveUsername,
          isTyping: true,
          streamId,
        });
      } else if (value.length === 0 && isTyping) {
        console.log("Stopping typing indicator");
        setIsTyping(false);
        socket.emit("typing", {
          username: effectiveUsername,
          isTyping: false,
          streamId,
        });
      }
    }
  };

  const handleInputClick = () => {
    console.log("Input clicked");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log("Key pressed:", e.key);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  console.log("Input status check:", { 
    socketConnected,
    username,
    streamId,
    messageLength: message.length,
    effectiveUsername: getEffectiveUsername()
  });

  return (
    <div className="h-screen flex">
      {/* Collapsed chat */}
      {!isOpen && (
        <div className="w-16 bg-lime-50 border-l border-black flex flex-col">
          <div className="flex-1 flex flex-col items-center pt-4">
            <div className="flex items-center">
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
        <div className="w-80 bg-lime-50 border-l border-black flex flex-col h-full max-h-screen">
          {/* Chat header */}
          <div className="p-4 border-b border-black bg-lime-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/assets/eyes.png" alt="Eyes" className="w-6 h-6" />
                <span className="text-lg font-bold ml-1">100</span>
                <span className="text-sm text-gray-800 ml-2">tv chat</span>
              </div>
              <button
                className="w-8 h-8 border border-black rounded-full"
                onClick={() => setIsOpen(false)}
              >
                →
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-4 py-2 relative"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {/* New messages notification */}
            {newMsgCount > 0 && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-2 z-10 bg-blue-600 text-white px-3 py-1 rounded-full shadow cursor-pointer text-xs font-semibold"
                onClick={scrollToBottom}
                style={{ userSelect: "none" }}
              >
                {newMsgCount} new message{newMsgCount > 1 ? "s" : ""}
              </div>
            )}
            
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
                      <span>{msg.message}</span>
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
       
          {/* Input section */}
          <div className="p-4 border-t border-black bg-lime-50">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="flex-1 text-base font-mono border border-black bg-white placeholder-gray-400 px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto max-h-32 min-h-[40px]"
                placeholder={
                  !streamId ? "No stream ID" :
                  !socketConnected ? "Connecting..." :
                  `Type as ${getEffectiveUsername()}...`
                }
                autoComplete="off"
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`px-4 py-2 border border-black ${
                  !message.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Send
              </button>
            </div>
            {/* Status indicator */}
            <div className="text-xs mt-1 text-gray-600">
              {!socketConnected ? "Connecting to chat..." : `Connected as ${getEffectiveUsername()}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;