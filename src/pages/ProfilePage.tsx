import { useEffect, useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { ApiStrings } from '@/lib/apiStrings';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function ProfilePage() {
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    fetchUserName();
    checkUserRole().then(setIsAdmin); // 2. Check admin status on user change
  }, [user]);


  // fetch user name from /auth/:privyId passing privyId from user object
  const fetchUserName = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/auth/${user.id}`, {
        method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": 'true',
            }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user name');
      }
      const data = await response.json();
      setDisplayName(data.name);
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  // add function to update username by privyId
  const updateUserName = async (newName: string) => {
    if (!user) return;
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/auth/update-name/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 'true'
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

  // add function to check userrole to display admin section in ui
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
    active: "bg-lime-50 text-black",
    "access requested": "bg-lime-50 text-black",
  };



  // const handleClaimRewards = () => {
  //   // Simulate claiming rewards
  //   setTreetsBalance(prev => prev + 50);
  //   setNibsBalance(prev => prev + 10);
  // };

  // const handleGetTreetsTokens = () => {
  //   // Simulate purchasing tokens
  //   setTreetsBalance(prev => prev + 100);
  // };

  // console.log(user, 'user details');

  return (
    <div className="flex flex-col min-h-screen bg-lime-50 overflow-hidden border-l border-r border-black relative z-20">
      <div className="absolute inset-y-0 left-6 w-px bg-black z-10"></div>
      <div className="absolute inset-y-0 right-6 w-px bg-black z-10"></div>
      <div className="mx-6 border-b border-gray-800">
        {/* Content container with padding inside the border */}
        {/* <div className="px-4"> */}
        <Header />
        {/* </div> */}
      </div>
      {/* < /> */}
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-row-1 lg:grid-row-3 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <h1 className="ms-2 text-7xl font-normal text-gray-900 mb-8 sm:mb-0 font-Redaction">account</h1>
            <div className="flex flex-row">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-8">
                <img src='/assets/Icons.png' alt="Profile" className="w-100 h-100 rounded-full object-cover mb-4 border-4 border-black" />
                <span className="text-center text-xs tracking-widest mt-2">CLICK IMAGE TO UPDATE PROFILE PHOTO</span>
              </div>
              {/* Display Name Section */}
              <div className="flex flex-col items-center w-full max-w-xl">
                <label className="text-1xl font-mono tracking-wide mb-2 block">display name</label>
                {isEditing ? (
                  <div className="flex w-full">
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="flex-1 px-6 py-6 border border-black text-2xl font-mono rounded-none bg-transparent" />
                    <button onClick={async () => { await updateUserName(displayName); setIsEditing(false); }} className="ml-2 px-4 py-2 bg-black text-white rounded-none text-lg">Save</button>
                  </div>
                ) : (
                  <div className="w-full px-6 py-6 border border-black text-2xl font-mono rounded-none bg-transparent cursor-pointer" onClick={() => setIsEditing(true)}>{displayName}</div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column - TV Rewards */}
          {/* https://gist.github.com/sparkidea25/235437a6da2f819c435afab81d938175 */}
          {isAdmin && (
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Admin</h2>
              <div className="absolute top-12 left-10"></div>
              {/* Table and Note */}
              <div className="flex flex-col items-center justify-center flex-1">
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
                        <td className={`px-6 py-2 border-b border-gray-300 ${statusColors[u.status] || ""}`}>{u.status}</td>
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
                          <rect width="14" height="18" x="5" y="3" fill="#fff8c7" stroke="#eab308" strokeWidth="2" rx="2" />
                          <rect width="10" height="2" x="7" y="7" fill="#eab308" rx="1" />
                          <rect width="10" height="2" x="7" y="11" fill="#eab308" rx="1" />
                          <rect width="6" height="2" x="7" y="15" fill="#eab308" rx="1" />
                        </svg>
                      </span>
                    </div>
                    <div className="font-bold text-xl text-black leading-tight">users without streaming access don’t need to show up here (users banned for shitty comments)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Leave space open above footer */}
      <div className="w-screen border-t border-gray-800"></div>
      <Footer />
    </div>
  );
}

