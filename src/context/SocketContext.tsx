import { ApiStrings } from '@/lib/apiStrings';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  text: string;
  user: User;
  createdAt: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  users: User[];
  messages: Message[];
  joinChat: (username: string) => void;
  sendMessage: (text: string) => void;
  currentUser: User | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  messages: [],
  joinChat: () => {},
  sendMessage: () => {},
  currentUser: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(`${ApiStrings.API_BASE_URL}`);
    setSocket(newSocket);

    // Set up event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('users', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    newSocket.on('previousMessages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('userJoined', (user: User) => {
      // Add a system message when a user joins
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `${user.username} has joined the chat`,
        user: { id: 'system', username: 'System' },
        createdAt: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    });

    newSocket.on('userLeft', (user: User) => {
      // Add a system message when a user leaves
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `${user.username} has left the chat`,
        user: { id: 'system', username: 'System' },
        createdAt: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    });

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinChat = (username: string) => {
    if (socket && username.trim()) {
      socket.emit('joinRoom', username, (response: any) => {
        if (response.status === 'success') {
          // Find the current user by socket id
          const user = users.find((u) => u.id === socket.id) || null;
          setCurrentUser(user);
        }
      });
    }
  };

  const sendMessage = (text: string) => {
    if (socket && text.trim() && currentUser) {
      socket.emit('sendMessage', text);
    }
  };

  const value = {
    socket,
    isConnected,
    users,
    messages,
    joinChat,
    sendMessage,
    currentUser,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};