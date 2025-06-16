import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Header } from '@/components/Header';
import { usePrivy } from "@privy-io/react-auth";
import { Footer } from '@/components/Footer';

export default function ProfilePage() {
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState('Ernest');
  const [isEditing, setIsEditing] = useState(false);
  const [treetsBalance, setTreetsBalance] = useState(50);
  const [nibsBalance, setNibsBalance] = useState(50);

  const handleClaimRewards = () => {
    // Simulate claiming rewards
    setTreetsBalance(prev => prev + 50);
    setNibsBalance(prev => prev + 10);
  };

  const handleGetTreetsTokens = () => {
    // Simulate purchasing tokens
    setTreetsBalance(prev => prev + 100);
  };

  console.log(user, 'user details');

  return (
    <div className="min-h-screen bg-green-50">

      <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-row-1 lg:grid-row-3 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
  <h1
    className="text-xl font-bold text-gray-900 mb-8 sm:mb-0"
    style={{ fontFamily: 'Redaction', fontWeight: 400, fontSize: 20 }}
  >
    account
  </h1>
  <div className="flex-1 flex flex-row items-center space-x-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <Camera className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              <div className="flex flex-col flex-1">
                <label className="block text-sm text-gray-600 mb-2">display name</label>
                {isEditing ? (
                  <div className="flex space-x-2 w-full">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-gray-900">{displayName}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      EDIT DISPLAY NAME
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* </div> */}

          {/* Right Column - TV Rewards */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">tv rewards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rewards Summary */}
              <div className="bg-gray-900 text-white rounded-lg p-6 relative custom-shadow">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>NIBS:</span>
                    <span>10 ($10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TREETS:</span>
                    <span>50 ($50)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>POL (TV fees):</span>
                    <span>50 ($40)</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between font-bold">
                      <span>total:</span>
                      <span>$100</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleClaimRewards}
                  className="mt-6 bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  claim rewards
                </button>
                
                <div className="absolute -bottom-2 -left-2 bg-blue-200 text-blue-800 p-3 rounded text-xs max-w-xs">
                  NIBS will be transferred to the rewards factory. TREETS and POL will be transferred to your wallet
                </div>
              </div>

              {/* Current Balance */}
              <div className="bg-gray-900 text-white rounded-lg p-6 relative">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>TREETS price:</span>
                    <span>10 ($10)</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>wallet balance:</span>
                      <div className="text-right">
                        <div>TREETS {treetsBalance} ($50)</div>
                        <div>NIBS {nibsBalance} ($50)</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>rewards factory</span>
                    <span>50 ($40)</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>$100</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleGetTreetsTokens}
                  className="mt-6 bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  get treets tokens
                </button>
                
                <div className="absolute -bottom-2 -right-2 bg-yellow-200 text-yellow-800 p-3 rounded text-xs max-w-xs">
                  Buy TREETS tokens on uniswap: contract address: 0xjDcn4GHD3ZJDCjsr8
                </div>
              </div>
            </div>

            {/* Rewards Factory */}
            <div className="mt-8 bg-gradient-to-r from-green-200 to-pink-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-16 bg-gradient-to-b from-pink-300 to-green-300 rounded-lg flex items-center justify-center relative">
                    <div className="w-12 h-12 bg-pink-400 rounded border-4 border-white flex items-center justify-center">
                      <div className="w-6 h-6 bg-black rounded-sm"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Your rewards factory</h3>
                    <p className="text-sm text-gray-700">50TREETS / 10NIBS IN FACTORY</p>
                    <p className="text-sm font-bold text-gray-900">40NIBS($500) UNLOCKED</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium border border-gray-300 hover:bg-gray-50">
                    store TREETS here to access your NIBS
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                    <span className="text-xl">?</span>
                  </button>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-100 text-blue-800 p-3 rounded text-sm">
                Connect your NIBS tokens and earn TREETS by putting your NIBS tokens in the rewards factory. The more TREETS you store here the quicker you receive your NIBS tokens :)
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}