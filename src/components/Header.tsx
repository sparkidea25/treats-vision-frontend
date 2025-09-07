import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { usePrivy } from "@privy-io/react-auth";
import { Menu } from '@headlessui/react';
import { Dialog } from './Dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiStrings } from '@/lib/apiStrings';

interface HeaderProps {
  navVariant?: 'default' | '/';
  currentStreamId?: string; // Add this prop
}

export function Header({ navVariant, currentStreamId }: HeaderProps) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmEndStreamOpen, setConfirmEndStreamOpen] = useState(false); // New state for confirmation dialog
  const [isEndingStream, setIsEndingStream] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isOnStreamingPage = location.pathname === '/stream' || location.pathname.includes('/stream');

  // Move this function above useEffect
  const handlePrivyLogin = async () => {
    if (!user) return;
    try {
      const response = await axios.post(
        `${ApiStrings.API_BASE_URL}/auth/connect-wallet`,
        {
          email: user.email,
          privy_id: user.id,
          wallet_address: user.wallet?.address,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": 'true'
          },
        }
      );
      console.log('User connected:', response.data);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // New function to handle the initial end stream button click
  const handleEndStreamClick = () => {
    setConfirmEndStreamOpen(true);
  };

  // Modified function to actually end the stream (called after confirmation)
  const handleConfirmEndStream = async () => {
    console.log('handleConfirmEndStream called with streamId:', currentStreamId);
    
    // Close the confirmation dialog
    setConfirmEndStreamOpen(false);
    
    // Prevent multiple clicks
    if (isEndingStream) {
      console.log('Already ending stream, ignoring click');
      return;
    }

    setIsEndingStream(true);

    try {
      // Terminate the stream if streamId is available
      if (currentStreamId) {
        console.log('Attempting to terminate stream:', currentStreamId);
        
        const response = await fetch(
          `${ApiStrings.API_BASE_URL}/livepeer/terminate-stream/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": 'true'
            },
            body: JSON.stringify({ streamId: currentStreamId })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('Stream terminated successfully:', data);
      } else {
        console.log('No streamId provided, skipping stream termination');
      }

      // Navigate back to home or dashboard
      console.log('Navigating to home page');
      navigate('/');
      
    } catch (error) {
      console.error('Error terminating stream:', error);
      
      // Still navigate even if termination fails
      navigate('/');
    } finally {
      setIsEndingStream(false);
    }
  };

  useEffect(() => {
    if (authenticated && user) {
      handlePrivyLogin();
    }
    // Only run when authenticated or user changes
  }, [authenticated, user]);

  return (
    <header className="w-full pt-6 bg-lime-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className={`flex-1 bg-lime-50 relative pl-10 pb-8 ${navVariant === '/' ? 'bg-lime-50' : 'bg-lime-50'}`}> 
          <a href="/">
            <img
              src="/assets/logo.png"
              alt="Livestream Logo"
              className="h-6 w-auto"
              style={{ cursor: 'pointer' }}
            />
          </a>
        </div>
        {/* Nav tabs: align to extreme right except on Home page ('/'), where they remain as currently styled */}
        <nav
          className={`flex space-x-4 space-x-reverse ${navVariant === '/' ? 'ml-auto' : isOnStreamingPage ? 'ml-8 mr-80' : 'ml-auto justify-end flex-1'}`}
        >
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
          
          {/* Confirmation Dialog for End Stream */}
          {confirmEndStreamOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md mx-4 relative">
                <div className="absolute top-0 right-0 w-4 h-full bg-lime-400"></div>
                <h3 className="text-xl font-medium text-center mb-6">
                  are you sure you want to<br />end this stream?
                </h3>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleConfirmEndStream}
                    disabled={isEndingStream}
                    className={`px-8 py-3 rounded-full border-2 border-black transition-colors ${
                      isEndingStream 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    {isEndingStream ? 'ending stream...' : 'yes, end stream'}
                  </button>
                  <button
                    onClick={() => setConfirmEndStreamOpen(false)}
                    className="px-8 py-3 rounded-full border-2 border-black bg-white text-black hover:bg-gray-50"
                  >
                    cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isOnStreamingPage ? (
            <button
              onClick={handleEndStreamClick} // Changed to use the new click handler
              disabled={isEndingStream}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isEndingStream 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-800 hover:bg-red-50'
              }`}
            >
              <img 
                src="/assets/live.png" 
                alt="stop icon" 
                className={`w-5 h-5 object-contain ${isEndingStream ? 'opacity-50' : ''}`} 
              />
              {isEndingStream ? 'ending stream...' : 'end stream'}
            </button>
          ) : (
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2"
            >
              <img src="/assets/live.png" alt="live icon" className="w-5 h-5 object-contain" />
              go live
            </button>
          )}
          {ready && authenticated && (
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:bg-gray-100 text-sm font-normal flex items-center"
            >
              <img
                src="/assets/rewards.png"
                alt="Featured livestream"
                className="w-full h-full"
              />
              rewards
            </Button>
          )}
          {ready && authenticated ? (
            <Menu as="div" className="relative">
              <Menu.Button as={Button}
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 text-sm font-normal flex items-center"
              >
                <img 
                  src="/assets/account.png"
                  alt="Login icon"
                  className="w-4 h-4 mr-1"
                />
                Profile
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-cyan-100 border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.wallet?.address ?? 'User'}</p>
                </div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 text-sm text-gray-700`}
                      onClick={() => window.location.href = '/profile'}
                    >
                      Go to Profile
                    </button>
                  )}
                </Menu.Item>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? 'bg-gray-100' : ''} w-full text-left px-4 py-2 text-sm text-gray-700`}
                        onClick={logout}
                      >
                        Log Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          ) : (
            <Button onClick={login}
              variant="ghost" 
              className="text-gray-700 hover:bg-gray-100 text-sm font-normal flex items-center"
              disabled={!ready}
            >
              <img 
                src="/assets/account.png"
                alt="Login icon"
                className="w-4 h-4 mr-1"
              />
              Connect Wallet
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}