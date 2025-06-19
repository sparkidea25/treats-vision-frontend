import { useEffect, useState } from 'react';
// import { Camera } from 'lucide-react';
import { Header } from '@/components/Header';
import { usePrivy } from "@privy-io/react-auth";
import { Footer } from '@/components/Footer';
import { ApiStrings } from '@/lib/apiStrings';

export default function ProfilePage() {
  const {  user } = usePrivy();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [treetsBalance, setTreetsBalance] = useState(50);
  const [nibsBalance, setNibsBalance] = useState(50);
    const [isAdmin, setIsAdmin] = useState(false);

  //   useEffect(() => {
  //   fetchUserName();
  // }, [user]);

    useEffect(() => {
    fetchUserName();
    checkUserRole().then(setIsAdmin); // 2. Check admin status on user change
  }, [user]);


  // fetch user name from /auth/:privyId passing privyId from user object
  const fetchUserName = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/auth/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user name');
      }
      const data = await response.json();
      setDisplayName(data.name);
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  // add function to check userrole to display admin section in ui
// ...existing code...
const checkUserRole = async (role = "admin") => {
  if (!user) return false;
  try {
    const response = await fetch(`${ApiStrings.API_BASE_URL}/auth/check-role/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      throw new Error('Failed to check user role');
    }
    const data = await response.json();
    console.log(data, 'user role data');
    return data.hasRole === true;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};
// ...existing code...

  // add function to update username by privyId
  const updateUserName = async (newName: string) => {
    if (!user) return;
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/auth/update-name/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user name');
      }
      const data = await response.json();
      console.log('User name updated:', data);  
      setDisplayName(newName);
    } catch (error) {
      console.error('Error updating user name:', error);
    }
  };

type UserStatus = "banned" | "active" | "access requested";

const users: { name: string; status: UserStatus }[] = [
  { name: "Ernest", status: "banned" },
  { name: "User1", status: "active" },
  { name: "User 2", status: "access requested" },
  { name: "User 3", status: "active" },
  { name: "User 4", status: "banned" },
];

const statusColors: Record<UserStatus, string> = {
  banned: "bg-red-400 text-white",
  active: "bg-lime-200 text-black",
  "access requested": "bg-yellow-100 text-black",
};



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
    <div className="min-h-screen bg-green-50 overflow-hidden border-l border-r border-black relative z-20">
      <div className="relative z-20 min-h-screen bg-green-50 overflow-hidden border-l border-r border-black">
         <div className="absolute inset-y-0 left-6 w-px bg-black z-10"></div>
        <div className="absolute inset-y-0 right-6 w-px bg-black z-10"></div>
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
<div className="flex flex-row">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-8">
                {/* Profile Image */}
                <img
                  src='/assets/Icons.png'
                  alt="Profile"
                  className="w-100 h-100 rounded-full object-cover mb-4 border-4 border-black"
                />
                <span className="text-center text-xs tracking-widest mt-2">
                  CLICK IMAGE TO UPDATE PROFILE PHOTO
                </span>
              </div>

              {/* Display Name Section */}
              <div className="flex flex-col items-center w-full max-w-xl">
              <label className="text-1xl font-mono tracking-wide mb-2 block">display name</label>
              {isEditing ? (
                <div className="flex w-full">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-6 py-6 border border-black text-2xl font-mono rounded-none bg-transparent"
                  />
                  <button
                    onClick={async () => {
                      await updateUserName(displayName);
                      setIsEditing(false);
                    }}
                    className="ml-2 px-4 py-2 bg-black text-white rounded-none text-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  className="w-full px-6 py-6 border border-black text-2xl font-mono rounded-none bg-transparent cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  {displayName}
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
                  className="mt-6 bg-green-50 text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  claim rewards
                </button>
                
                <div className="absolute -bottom-2 -left-2 bg-cyan-50 text-black p-3 rounded text-xs max-w-xs">
                  NIBS will be transferred to the rewards factory. TREETS and POL will be transferred to your wallet
                </div>
              </div>

              {/* Current Balance */}
              <div className="bg-gray-900 text-white rounded-lg p-6 relative custom-shadow">
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
                  className="mt-6 bg-green-50 text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  get treets tokens
                </button>
                
                <div className="absolute -bottom-2 -right-2 bg-cyan-50 text-black p-3 rounded text-xs max-w-xs">
                  Buy TREETS tokens on uniswap: contract address: 0xjDcn4GHD3ZJDCjsr8
                </div>
              </div>
            </div>

            {/* Rewards Factory */}
            <div className="mt-8 bg-gradient-to-r from-green-400 to-pink-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <a href="/">
              <img
                src="/assets/par.png"
                alt="Livestream Logo"
                className="h-16 w-20"
                style={{ cursor: 'pointer' }}
              />
            </a>
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

  {isAdmin && (
      <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Admin</h2>
                    <div className="absolute top-12 left-10">
        {/* <span className="text-[72px] font-serif font-normal text-black leading-none">admin</span> */}
          </div>

        {/* Table and Note */}
          <div className="flex flex-col items-center justify-center flex-1">
        {/* Table */}
        <table className="mb-16 border border-gray-400">
          <thead>
            <tr>
              <th className="px-6 py-2 border-b border-gray-400 bg-white font-normal">streamer</th>
              <th className="px-6 py-2 border-b border-gray-400 bg-white font-normal">status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.name}>
                <td className="px-6 py-2 border-b border-gray-300 bg-white">{u.name}</td>
                <td className={`px-6 py-2 border-b border-gray-300 ${statusColors[u.status] || ""}`}>
                  {u.status}
                </td>
              </tr>
            ))}
            </tbody>
        </table>

        {/* Note Bar */}
          <div className="relative w-[480px]">
          <div className="absolute left-2 top-2 w-full h-full bg-black opacity-80 rounded shadow-lg z-0"></div>
          <div className="relative bg-yellow-200 rounded shadow-lg p-6 z-10 border-2 border-black">
            <div className="flex items-center mb-2">
              <span className="font-bold text-black mr-2">Note</span>
              <span className="ml-auto bg-yellow-300 rounded-full p-2 border border-yellow-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <rect width="14" height="18" x="5" y="3" fill="#fff8c7" stroke="#eab308" strokeWidth="2" rx="2"/>
                  <rect width="10" height="2" x="7" y="7" fill="#eab308" rx="1"/>
                  <rect width="10" height="2" x="7" y="11" fill="#eab308" rx="1"/>
                  <rect width="6" height="2" x="7" y="15" fill="#eab308" rx="1"/>
                </svg>
              </span>
                </div>
                <div className="font-bold text-xl text-black leading-tight">
              users without streaming access don’t need to show up here (users banned for shitty comments)
                </div>
                </div>
              </div>
                </div>
                </div>
                )}
        </div>
        <br />
        <div className="relative">

     
 <div className="w-screen border-t border-gray-800"></div>
<div className="container mx-auto">
  {/* Admin content */}
  <Footer />
</div>
   </div>
        {/* <div className="custom-footer-border"></div> */}
        {/* <Footer /> */}
                   
        </div>
      </div>
     </div>
  )
}