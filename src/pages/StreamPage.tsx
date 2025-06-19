import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useState } from 'react';
import { PauseIcon, PlayIcon } from "@livepeer/react/assets";
import { getSrc } from "@livepeer/react/external";
import * as Player from "@livepeer/react/player";
// import { vodSource } from "./source";


const StreamingPage = () => {
  const [ready, setReady] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [user, setUser] = useState({ wallet: { address: '0x1234567890abcdef' } });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'adriana clouart', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
    { id: 2, user: 'steph pine', message: 'A bunch of words bla filling the chat here with soe wordsthe chat here with soe wordsthe chat here with soe wordsthe chat here with soe words', avatar: '👤' },
    { id: 3, user: 'claus gusman', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
    { id: 4, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
    { id: 5, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
    { id: 6, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
    { id: 7, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
    { id: 8, user: 'james winfred', message: 'A bunch of words bla filling the chat here with soe words', avatar: '👤' },
  ]);
  const [newMessage, setNewMessage] = useState('');



  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        user: 'You',
        message: newMessage,
        avatar: '👤'
      }]);
      setNewMessage('');
    }
  };

  const Button = ({ children, variant = 'default', className = '', onClick, ...props }) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      ghost: 'bg-transparent hover:bg-gray-100',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50'
    };
    
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Updated Header - Now fully clickable as button */}
      <Header />

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Video Stream Area */}
        <div className="flex-1 bg-black relative">
          {/* Video placeholder with futuristic overlay https://gist.github.com/sparkidea25/03209b2d179be4886737d79f45029a58 */}
          <Player.Root src={getSrc(vodSource)}>
      <Player.Container className="h-full w-full overflow-hidden bg-gray-950">
        <Player.Video title="Live stream" className="h-full w-full" />

        <Player.Controls className="flex items-center justify-center">
          <Player.PlayPauseTrigger className="w-10 h-10 hover:scale-105 flex-shrink-0">
            <Player.PlayingIndicator asChild matcher={false}>
              <PlayIcon className="w-full h-full" />
            </Player.PlayingIndicator>
            <Player.PlayingIndicator asChild>
              <PauseIcon className="w-full h-full" />
            </Player.PlayingIndicator>
          </Player.PlayPauseTrigger>
        </Player.Controls>
      </Player.Container>
    </Player.Root>

              </div>
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <button className="bg-green-50 rounded-full font-semibold backdrop-blur-sm border border-white border-opacity-30 transition-all">
                tip
              </button>
            </div>

            {/* Stream title overlay */}
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Ernie's stream - treatsvision ama</h1>
              <p className="text-gray-300">Some descriptive text about the stream here</p>
            </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-green-50 border-l border-gray-200 flex flex-col">
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

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{msg.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-900">{msg.user}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 break-words">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
                <div className="flex w-full">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-48 px-3 py-6 border border-black text-2xl font-mono rounded-none bg-transparent"
                  />
                  <button
                    // onClick={async () => {
                    //   await updateUserName(displayName);
                    //   setIsEditing(false);
                    // }}
                    className="ml-2 px-4 py-2 bg-black text-white rounded-none text-lg"
                  >
                    Send
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      {/* <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-center space-x-8">
          <button className="text-gray-600 hover:text-gray-900 text-sm">about</button>
          <button className="text-gray-600 hover:text-gray-900 text-sm">privacy policy</button>
        </div>
      </div> */}
    </div>
  );
};

export default StreamingPage;