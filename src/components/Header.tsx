import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { usePrivy } from "@privy-io/react-auth";
import { Menu } from '@headlessui/react';
import { ApiStrings } from '@/lib/apiStrings';
import { Dialog } from './Dialog';
import { useLocation, useNavigate } from 'react-router-dom';


export function Header({ navVariant }: { navVariant?: 'default' | '/' }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
    const [dialogOpen, setDialogOpen] = useState(false);
     const location = useLocation();
  const navigate = useNavigate();
  const isOnStreamingPage = location.pathname === '/streaming' || location.pathname.includes('/stream');


  // Move this function above useEffect
  const handlePrivyLogin = async () => {
    if (!user) return;
    try {
      const response = await axios.post(
        `${process.env.VITE_API_LINK}/v1.0/auth/connect-wallet`,
        {
          email: user.email,
          privy_id: user.id,
          wallet_address: user.wallet?.address,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('User connected:', response.data);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleEndStream = () => {
    // Navigate back to home or dashboard
    navigate('/');
    // You might want to add additional cleanup logic here
    // such as stopping the stream, disconnecting from socket, etc.
  };

  useEffect(() => {
    if (authenticated && user) {
      handlePrivyLogin();
    }
    // Only run when authenticated or user changes
  }, [authenticated, user]);


  // Helper function to shorten wallet address
  function shortenAddress(address: any) {
    if (!address) return 'User';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // const isNavUi = navVariant === '/';

  return (
    //  <Button onClick={onGoLive}>go live</Button>
    // w-full  px-6 py-3
    <header className="w-full pt-6 bg-lime-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* <div className="flex space-x-8"> */}
          <div className={`flex-1 bg-lime-50 relative pl-10 pb-8" ${navVariant === '/' ? 'bg-lime-50' : 'bg-lime-50'}`}>
            <a href="/">
              <img
                src="/assets/logo.png"
                alt="Livestream Logo"
                className="h-6 w-auto"
                style={{ cursor: 'pointer' }}
              />
            </a>
          {/* </div> */}
        </div>
        {/* <nav className={`${navVariant === '/' ? 'ml-6 mr-32' : 'ml-8 mr-80'} 'space-x-6 ml-8 mr-80' : 'space-x-6 ml-8 mr-80'`}> */}
         <nav className={`flex space-x-6 ${navVariant === '/' ? 'ml-auto' : 'ml-8 mr-80'}`}>
  <Dialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
  />
  {isOnStreamingPage ? (
    <button
      onClick={handleEndStream}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
    >
      <img src="/assets/live.png" alt="stop icon" className="w-5 h-5 object-contain" />
      end stream
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
          <p className="text-sm font-medium text-gray-900">{shortenAddress(user?.wallet?.address) ?? 'User'}</p>
        </div>
        <Menu.Item>
          {({ active }) => (
            <button
              className={`${
                active ? 'bg-gray-100' : ''
              } w-full text-left px-4 py-2 text-sm text-gray-700`}
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
                className={`${
                  active ? 'bg-gray-100' : ''
                } w-full text-left px-4 py-2 text-sm text-gray-700`}
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