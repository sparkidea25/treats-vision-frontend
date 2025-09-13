import { useEffect, useState, useRef } from "react";
import { ApiStrings } from "@/lib/apiStrings";
import { usePrivy } from "@privy-io/react-auth";
import { io, Socket } from "socket.io-client";

interface ChatRoomProps {
  streamId: string;
  onChatToggle?: (isOpen: boolean) => void;
  viewers?: number;
}

function ChatRoom({ streamId, onChatToggle, viewers }: ChatRoomProps) {
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
  const [socketConnected, setSocketConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isScrolledToBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 10;
  };

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
  }, [messages]);

  const handleScroll = () => {
    if (isScrolledToBottom()) setNewMsgCount(0);
  };

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


  useEffect(() => {
  if (!streamId) return;

  console.log("Fetching approved messages for:", streamId);
  fetchApprovedMessages(streamId).then((approvedMsgs) => {
    if (approvedMsgs.length > 0) {
      setMessages((prev) => [...approvedMsgs, ...prev]);
    }
  });
}, [streamId]);


  useEffect(() => {
  if (socket && socket.connected && streamId) {
    const effectiveUsername = getEffectiveUsername();
    console.log(`Username updated, rejoining room with: ${effectiveUsername}`);
    
    const joinData = {
      roomId: streamId,
      userId: effectiveUsername,
    };
    socket.emit("joinRoom", joinData);
  }
}, [username, socket, streamId]);

  useEffect(() => {
    if (!streamId || !username) {
      console.log("Waiting for streamId before connecting socket...");
      return;
    }

    const effectiveUsername = getEffectiveUsername();
    console.log(`Initializing socket for streamId: ${streamId} with username: ${effectiveUsername}`);
    
    const newSocket = io("https://bannered-nocuously-zaria.ngrok-free.app", {
      path: "/socket.io/",
      transports: ["websocket"],
      timeout: 20000,
      forceNew: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`Socket connected with ID: ${newSocket.id}`);
      setSocketConnected(true);

      const joinData = {
        roomId: streamId,
        userId: effectiveUsername,
      };
      console.log(`Joining room with data:`, joinData);
      newSocket.emit("joinRoom", joinData);
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setSocketConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error(`Socket connection error:`, error);
      setSocketConnected(false);
    });

    newSocket.on("userJoined", (data) => {
      console.log(`User joined event received:`, data);
      const joinMessage = {
        user: "System",
        message: `${data.username || data.userId || 'Someone'} joined the chat`,
        streamId,
        timestamp: Date.now(),
        isSystemMessage: true,
      };
      setMessages((prev) => [...prev, joinMessage]);
    });

    // Fixed: Handle received messages properly
    newSocket.on("receiveMessage", (data) => {
      console.log(`Message received:`, data);
      
      if (data.streamId !== streamId) {
        console.log(`Message streamId ${data.streamId} doesn't match current ${streamId}, ignoring`);
        return;
      }
      
      const frontendMessage = {
        user: data.user || "Anonymous",
        message: data.message,
        streamId: data.streamId,
        timestamp: data.timestamp || Date.now(),
        isSystemMessage: false,
      };
      
      console.log(`Adding message to state:`, frontendMessage);
      // Use functional update to prevent race conditions
      setMessages((prevMessages) => {
        // Check if message already exists (prevent duplicates)
        const exists = prevMessages.some(msg => 
          msg.message === frontendMessage.message && 
          msg.user === frontendMessage.user && 
          Math.abs((msg.timestamp || 0) - (frontendMessage.timestamp || 0)) < 1000
        );
        
        if (exists) {
          console.log('Duplicate message detected, not adding');
          return prevMessages;
        }
        
        return [...prevMessages, frontendMessage];
      });
    });

    // Fixed: Better typing indicator handling
    newSocket.on("userTyping", (data) => {
  console.log(`User typing event:`, data);
  
  if (data.streamId !== streamId) {
    console.log(`Typing event streamId ${data.streamId} doesn't match current ${streamId}, ignoring`);
    return;
  }
  
  // Don't show our own typing indicator
  const currentUsername = getEffectiveUsername();
  if (data.username === currentUsername) {
    console.log('Ignoring own typing indicator');
    return;
  }
  
  setTypingUsers((prev) => {
    if (data.isTyping) {
      // Add user to typing list if not already there
      if (!prev.includes(data.username)) {
        const newTyping = [...prev, data.username];
        console.log(`Added ${data.username} to typing users:`, newTyping);
        return newTyping;
      }
    } else {
      // Remove user from typing list if they're there
      if (prev.includes(data.username)) {
        const newTyping = prev.filter((u) => u !== data.username);
        console.log(`Removed ${data.username} from typing users:`, newTyping);
        return newTyping;
      }
    }
    return prev;
  });
});

    // newSocket.on("joinedRoom", (data) => {
    //   console.log(`Joined room confirmation:`, data);
    // });
    newSocket.on("joinedRoom", (data) => {
  console.log(`Joined room confirmation:`, data);
  const joinMessage = {
    user: "System",
    message: data.message || `You joined the chat${data.roomId ? ` (Room: ${data.roomId})` : ""}`,
    streamId,
    timestamp: Date.now(),
    isSystemMessage: true,
  };
  setMessages((prev) => [...prev, joinMessage]);
});

    newSocket.on("error", (error) => {
      console.error(`Socket error:`, error);
    });

    return () => {
      console.log("Cleaning up socket connection");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.disconnect();
      setSocketConnected(false);
    };
  }, [streamId, username, user?.email, user?.id]);

  const sendMessage = () => {
    console.log(`Attempting to send message: "${message.trim()}", connected: ${socketConnected}`);
    
    if (!message.trim()) {
      console.log("Message is empty, not sending");
      return;
    }
    
    if (!socket || !socket.connected) {
      console.log("Socket not connected, cannot send message");
      return;
    }
    
    const effectiveUsername = getEffectiveUsername();
    const msgObj = {
      user: effectiveUsername,
      message: message.trim(),
      streamId,
      timestamp: Date.now()
    };
    
    console.log(`Sending message object:`, msgObj);
    
    // Clear the input first
    setMessage("");
    
    // Send the message
    socket.emit("sendMessage", msgObj);
    console.log("Message emitted to socket");

    // Stop typing indicator immediately when sending
    if (isTyping) {
      setIsTyping(false);
      socket.emit("typing", {
        username: effectiveUsername,
        isTyping: false,
        streamId,
      });
    }
  };




  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !socket.connected) {
      return;
    }

    const effectiveUsername = getEffectiveUsername();

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length > 0 && !isTyping) {
      console.log("Starting typing indicator");
      setIsTyping(true);
      socket.emit("typing", {
        username: effectiveUsername,
        isTyping: true,
        streamId,
      });
    }

    if (value.length > 0) {
      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          console.log("Stopping typing indicator due to timeout");
          setIsTyping(false);
          if (socket && socket.connected) {
            socket.emit("typing", {
              username: effectiveUsername,
              isTyping: false,
              streamId,
            });
          }
        }
      }, 3000);
    } else if (value.length === 0 && isTyping) {
      console.log("Stopping typing indicator - empty input");
      setIsTyping(false);
      socket.emit("typing", {
        username: effectiveUsername,
        isTyping: false,
        streamId,
      });
    }
  };

  // 👇 Add this before ChatRoom component
async function fetchApprovedMessages(streamKey: string) {
  try {
    const res = await fetch(
      `${ApiStrings.API_BASE_URL}/chat/approved-messages?streamKey=${streamKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch approved messages", res.status);
      return [];
    }

    const data = await res.json();
    console.log(data, 'approved messages');

    // Transform backend messages to the same shape your ChatRoom uses
    let checK_return =  data.map((msg: any) => ({
      user: msg.username,
      message: msg.status === "PENDING" ? "Message removed by Admin" : msg.text,
      streamId: msg.streamKey,
      timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
      isSystemMessage: false,
    }));
    console.log(checK_return, 'transformed approved messages');
    return checK_return
  } catch (e) {
    console.error("Error fetching approved messages:", e);
    return [];
  }
}


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
            <div className="flex items-center">
             <img src="/assets/eyes.png" alt="Eyes" className="w-6 h-6" />
              <span className="text-lg font-bold ml-1">{viewers}</span>
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
                <span className="text-lg font-bold ml-1">{viewers}</span>
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
              <div className="text-center py-8">
                <span className="text-2xl text-gray-400 font-mono">no chat</span>
                <div className="text-xs text-gray-500 mt-2">
                  Connected: {socketConnected ? '✅' : '❌'}<br/>
                  Stream: {streamId}<br/>
                  Username: {username}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* {messages.map((msg, index) => (
                  <div key={`${msg.timestamp || index}-${index}`} className="flex items-start p-2">
                    <img
                      src="/assets/Icons.png"
                      alt="User"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <p className={`text-left text-base break-words ${msg.isSystemMessage ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                      <span className="font-bold">{msg.user || "Anonymous"}: </span>
                      <span>{msg.message}</span>
                      {msg.isLocalMessage && <span className="text-xs text-gray-400 ml-1">(offline)</span>}
                    </p>
                  </div>
                ))} */}
                {messages.map((msg, index) => (
  <div key={`${msg.timestamp || index}-${index}`} className="flex items-start p-2">
    <div className="flex flex-col">
      {/* Special styling for removed messages */}
      {msg.message === "Message removed by Admin" ? (
        <div className="flex flex-col items-start">
          <span className="text-sm text-gray-500 italic bg-red-50 px-2 py-1 rounded">
            <span className="font-bold">{msg.user || "Anonymous"}: </span>
            {msg.message}
          </span>
        </div>
      ) : (
        <p className={`text-left text-base break-words ${msg.isSystemMessage ? 'text-gray-500 italic' : 'text-gray-800'}`}>
          <span className="font-bold">{msg.user || "Anonymous"}: </span>
          <span>{msg.message}</span>
          {msg.isLocalMessage && <span className="text-xs text-gray-400 ml-1">(offline)</span>}
        </p>
      )}
    </div>
  </div>
))}
              </div>
            )}
          </div>
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 pb-1 text-sm text-gray-600">
              <span className="animate-pulse">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          )}
       
          {/* Input section */}
          <div className="p-4 border-t border-black bg-lime-50">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
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
                disabled={!message.trim() || !socketConnected}
                className={`px-4 py-2 border border-black ${
                  !message.trim() || !socketConnected
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
              {messages.length > 0 && <span className="ml-2">• {messages.length} messages</span>}
              {typingUsers.length > 0 && <span className="ml-2">• {typingUsers.length} typing</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;