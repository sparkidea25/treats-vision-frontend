import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePrivy } from "@privy-io/react-auth";
import { Dialog, DialogPanel, Listbox, Menu } from '@headlessui/react';
import { ApiStrings } from '@/lib/apiStrings';
import { Camera, X } from 'lucide-react';
// import { XMarkIcon } from '@heroicons/react/24/outline';
// import { Link } from 'react-router-dom';

export function Header() {
  const { ready, authenticated, user, login, logout } = usePrivy();
    const [showStepper, setShowStepper] = useState(false);
  const [step, setStep] = useState(1);
    const [form, setForm] = useState({
    title: '',
    description: '',
    source: 'Logitech Webcam',
    tokenAddress: '',
    tokenAmount: '',
  });

  // Move this function above useEffect
  const handlePrivyLogin = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/${ApiStrings.signUp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          privy_id: user.id,
          wallet_address: user.wallet?.address,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to connect wallet');
      }
      const data = await response.json();
      console.log('User connected:', data);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    if (authenticated && user) {
      handlePrivyLogin();
    }
    // Only run when authenticated or user changes
  }, [authenticated, user]);

  // Wait until the Privy client is ready before rendering
  // if (!ready) {
  //   return (
  //     <header className="w-full border-b border-black px-6 py-3 bg-green-50">
  //       <div className="max-w-7xl mx-auto flex items-center justify-between">
  //         <div>Loading header...</div>
  //       </div>
  //     </header>
  //   );
  // }

  // Helper function to shorten wallet address
  function shortenAddress(address: any) {
    if (!address) return 'User';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const sources = [
  { name: 'Logitech Webcam', icon: <Camera className="w-4 h-4 mr-2 inline" /> },
  { name: 'Screen Share', icon: null },
];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">Create Stream</h2>
            <div>
          <input className="border p-2 mb-2 w-full bg-white" value={form.title} placeholder="title" onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
            <textarea
              className="border p-2 mb-2 w-full bg-white"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <Listbox value={form.source} onChange={value => setForm({ ...form, source: value })}>
  <div className="relative mb-2">
    <Listbox.Button className="border p-2 w-full bg-white flex items-center">
      {sources.find(s => s.name === form.source)?.icon}
      {form.source}
    </Listbox.Button>
    <Listbox.Options className="absolute mt-1 w-full bg-white border rounded shadow-lg z-10">
      {sources.map((source) => (
        <Listbox.Option
          key={source.name}
          value={source.name}
          className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-100"
        >
          {source.icon}
          {source.name}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  </div>
</Listbox>

<div className="flex items-center mb-1">
    <input
      id="tv-chat"
      type="checkbox"
      className="mr-2 bg-green-50"
      // You can add state for this if needed
      defaultChecked
    />
    <label htmlFor="tv-chat" className="font-medium text-gray-800">tv chat</label>
  </div>
  <div className="ml-6 mb-3 text-gray-600 text-sm font-medium">ENABLE DURING STREAM</div>

  <div className="flex items-center mb-1">
    <input
      id="token-access"
      type="checkbox"
      className="mr-2 accent-black bg-green-50"
      // Add state if you want to toggle this
      defaultChecked
    />
    <label htmlFor="token-access" className="font-medium text-gray-800 mr-4">token access</label>
    <input
      id="public-access"
      type="checkbox"
      className="mr-2 accent-black"
      // Add state if you want to toggle this
    />
    <label htmlFor="public-access" className="font-medium text-gray-800">public access</label>
  </div>
  <div className="ml-6 text-gray-600 text-sm font-medium">
    SET TO PRIVATE<br />
    ONLY ACCESSIBLE TO NIBS HOLDERS
  </div>

            <button className="bg-black text-white px-4 py-2 rounded" onClick={() => setStep(2)}>
              Stream preview
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">Stream Preview</h2>
            <div className="mb-2">Title: {form.title}</div>
            <div className="mb-2">Description: {form.description}</div>
            <div className="mb-2">Source: {form.source}</div>
            <button className="bg-black text-white px-4 py-2 rounded mr-2" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="bg-black text-white px-4 py-2 rounded" onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">Token Access</h2>
            <input
              className="border p-2 mb-2 w-full"
              placeholder="Token Address"
              value={form.tokenAddress}
              onChange={e => setForm({ ...form, tokenAddress: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full"
              placeholder="Number of Tokens Required"
              value={form.tokenAmount}
              onChange={e => setForm({ ...form, tokenAmount: e.target.value })}
            />
            <button className="bg-black text-white px-4 py-2 rounded mr-2" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setShowStepper(false);
                // Navigate to /stream or handle form submit here
                window.location.href = '/stream';
              }}
            >
              Create Stream
            </button>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <header className="w-full border-b border-black px-6 py-3 bg-green-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <a href="/">
              <img
                src="/assets/logo.png"
                alt="Livestream Logo"
                className="h-6 w-auto"
                style={{ cursor: 'pointer' }}
              />
            </a>
          </div>
        </div>
        <nav className="flex items-center space-x-6">
           <Button
          variant="ghost"
          className="text-gray-700 hover:bg-gray-100 text-sm font-normal"
          onClick={() => setShowStepper(true)}
        >
          <img
            src="/assets/live.png"
            alt="Featured livestream"
            className="w-full h-full"
          />
          go live
        </Button>
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
              
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
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
   <Dialog
        open={showStepper}
        onClose={() => setShowStepper(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
        static // Prevent closing on overlay click or ESC
      >
        <div className="flex items-center justify-center min-h-screen">
          <DialogPanel className="fixed inset-0 bg-lime-100 border-2 border-lime-400 opacity-30 pointer-events-none" />
          <div className="relative bg-lime-100 border-2 border-lime-400 p-8 w-full max-w-md z-50">
            {/* X icon for closing */}
            <button
              className="absolute top-3 right-3 text-gray-700 hover:text-black"
              onClick={() => setShowStepper(false)}
              aria-label="Close"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
            {renderStepContent()}
          </div>
        </div>
      </Dialog>
    </header>
  );
}