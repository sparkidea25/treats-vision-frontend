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
  
  // Enhanced debug states
  const [socketConnected, setSocketConnected] = useState(false);
  // const [debugInfo, setDebugInfo] = useState("");
  // const [inputReady, setInputReady] = useState(false); // NEW: Track input readiness
  // const inputRef = useRef<HTMLInputElement>(null);

  // Debug function to log current state
  // const logDebugInfo = (action: string) => {
  //   const info = `${action} - Socket: ${socket?.connected ? 'Connected' : 'Disconnected'}, Auth: ${authenticated}, User: ${!!user}, Username: ${username}`;
  //   console.log(info);
  //   setDebugInfo(info);
  // };

  // Notify parent component when chat state changes
  useEffect(() => {
    onChatToggle?.(isOpen);
  }, [isOpen, onChatToggle]);

  const fetchUsername = async (privyId: any) => {
    try {
      console.log("Fetching username for:", privyId);
      const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${privyId}`);
      const data = await res.json();
      console.log("Username fetched:", data.name);
      return data.name;
    } catch (e) {
      console.error("Error fetching username:", e);
      return "";
    }
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

  // FIX 1: Separate input readiness from socket connection
  useEffect(() => {
    // Set input as ready when we have basic requirements
    const hasBasicRequirements = streamId && (username || user?.email || user?.id);
    console.log("Checking input readiness:", { 
      streamId,
      username,
      userEmail: user?.email,
      userId: user?.id,
      hasBasicRequirements
    });
    // setInputReady(hasBasicRequirements);
  }, [streamId, username, user?.email, user?.id]);

  // Socket connection effect
  useEffect(() => {
    if (!streamId || !username) {
      console.log("Waiting for username before connecting socket...");
      return;
    }

    console.log("Initializing socket for streamId:", streamId, "with username:", username);
    
    const newSocket = io("https://d1a4f5678717.ngrok-free.app", {
      path: "/socket.io/",
      transports: ["websocket"],
      timeout: 20000,
      forceNew: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);
      setSocketConnected(true);
      // logDebugInfo("Socket Connected");

      newSocket.emit("joinRoom", {
        roomId: streamId,
        userId: username,
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
      // logDebugInfo(`Socket Disconnected: ${reason}`);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
      // logDebugInfo(`Connection Error: ${error.message}`);
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

    // newSocket.on("receiveMessage", (data) => {
    //   if (data.streamId !== streamId) return;
    //   console.log("Message received:", data);
    //   setMessages((prev) => [...prev, data]);
    // });

    // FIX 2: Add typing event handlers
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
  }, [streamId, username]);

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
    
    // FIX 3: Allow sending even if socket is not connected (store locally)
    const msgObj = {
      user: username || user?.email || "Anonymous",
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
      // logDebugInfo("Message Sent via Socket");
    } else {
      console.log("Socket not connected, message stored locally");
      // logDebugInfo("Message Stored Locally");
    }

    // Clear typing indicator after sending
    if (isTyping) {
      setIsTyping(false);
      if (socket && socket.connected) {
        socket.emit("typing", {
          username: username || user?.email || "Anonymous",
          isTyping: false,
          streamId,
        });
      }
    }
  };

  // FIX 4: Simplified input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Input changed:", value);
    setMessage(value);

    // Only send typing indicator if socket is ready
    if (socket && socket.connected) {
      const currentUsername = username || user?.email || "Anonymous";

      if (value.length > 0 && !isTyping) {
        console.log("Starting typing indicator");
        setIsTyping(true);
        socket.emit("typing", {
          username: currentUsername,
          isTyping: true,
          streamId,
        });
      } else if (value.length === 0 && isTyping) {
        console.log("Stopping typing indicator");
        setIsTyping(false);
        socket.emit("typing", {
          username: currentUsername,
          isTyping: false,
          streamId,
        });
      }
    }
  };

  // FIX 5: Simplified input click handler
  const handleInputClick = () => {
    console.log("Input clicked");
    // logDebugInfo("Input Clicked");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("Key pressed:", e.key);
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // const reconnectSocket = () => {
  //   console.log("Manual reconnection triggered");
  //   if (socket) {
  //     socket.disconnect();
  //     socket.connect();
  //   }
  // };

  // FIX 6: Updated input disable logic - only disable if we don't have basic requirements
  // const isInputDisabled = !inputReady;
  
  console.log("Input status check:", { 
    // inputReady, 
    // isInputDisabled, 
    socketConnected,
    username,
    streamId
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
          {/* Chat header with debug info */}
          <div className="p-6 border-b border-black flex items-center justify-between">
            {/* <div className="flex-1 text-center"> */}
                          <div className="flex items-center">
             <img src="/assets/eyes.png" alt="Eyes" className="w-6 h-6" />
              <span className="text-lg font-bold ml-1">100</span>
            </div>
              <span className="font-semibold text-lg block">tv chat</span>
              {/* Debug status */}
              {/* <div className="text-xs mt-1">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={socketConnected ? 'text-green-600' : 'text-red-600'}>
                  {socketConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span className={`ml-2 inline-block w-2 h-2 rounded-full mr-1 ${inputReady ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                <span className={inputReady ? 'text-blue-600' : 'text-orange-600'}>
                  {inputReady ? 'Ready' : 'Not Ready'}
                </span>
              </div> */}
            {/* </div> */}
            <div className="flex gap-1">
              {/* <button
                className="w-6 h-6 border border-black rounded text-xs"
                onClick={reconnectSocket}
                title="Reconnect"
              >
                ↻
              </button> */}
              <button
                className="w-8 h-8 border border-black rounded-full"
                onClick={() => setIsOpen(false)}
              >
                →
              </button>
            </div>
          </div>

          {/* Enhanced debug info panel */}
          {/* <div className="px-4 py-1 bg-yellow-100 border-b border-black text-xs">
            <div>Auth: {authenticated ? '✓' : '✗'} | User: {user ? '✓' : '✗'} | Username: {username || 'None'}</div>
            <div>Socket: {socket ? (socketConnected ? 'Connected' : 'Disconnected') : 'None'} | Input: {inputReady ? 'Ready' : 'Not Ready'}</div>
            <div className="truncate" title={debugInfo}>Last: {debugInfo}</div>
          </div> */}

          {/* Chat messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
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

          {/* FIX 7: Enhanced input section */}
          <div className="p-4 border-t border-black bg-lime-50">
            <div className="flex gap-2">
              <textarea
                value={message}
                onClick={handleInputClick}
                className={"flex-1 text-base font-mono border border-black bg-white placeholder-gray-400 px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto max-h-32 min-h-[40px]"}
                placeholder={
                  !streamId ? "No stream ID" :
                  !username && !user?.email && !user?.id ? "Loading user..." :
                  !socketConnected ? "Type message (will send when connected)" :
                  "Type your message..."
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
              {!socketConnected && "Messages will be stored locally until connected"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;