import { useEffect, useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { ApiStrings } from '@/lib/apiStrings';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';


type ModerationCategory =
  | "hate"
  | "sexual"
  | "violence"
  | "self-harm"
  | "harassment"
  | "sexual/minors"
  | "hate/threatening"
  | "self-harm/intent"
  | "violence/graphic"
  | "harassment/threatening"
  | "self-harm/instructions";

type ModerationResult = {
  flagged: boolean;
  categories: Record<ModerationCategory, boolean>;
  category_scores: Record<ModerationCategory, number>;
};


type PendingMessage = {
  id: number;
  streamKey: string;
  username: string;
  text: string;
  images: string[];
  moderationScore: number | null;
  status: string;
  moderationResult: ModerationResult;
  createdAt: string;
  updatedAt: string;
};

export default function ProfilePage() {
  const { user } = usePrivy();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
    const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);


  useEffect(() => {
    fetchUserName();
    fetchPendingMessages()
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

  const fetchPendingMessages = async () => {
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/chat/pending-messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 'true',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending messages');
      }
      const data = await response.json();
      // Only keep messages with status "PENDING" and flagged moderationResult
      const filtered = (data as PendingMessage[]).filter(
        (msg) => msg.status === "PENDING" && msg.moderationResult?.flagged
      );
      setPendingMessages(filtered);
      return filtered;
    } catch (e) {
      console.error(e);
    }
  };

    const getViolation = (categories: Record<ModerationCategory, boolean>) => {
    const mapping: Record<ModerationCategory, string> = {
      "hate": "Hate Speech",
      "sexual": "NSFW Content",
      "violence": "Violence",
      "self-harm": "Self-Harm",
      "harassment": "Harassment",
      "sexual/minors": "Minor NSFW",
      "hate/threatening": "Threatening Hate",
      "self-harm/intent": "Self-Harm Intent",
      "violence/graphic": "Graphic Violence",
      "harassment/threatening": "Threatening Harassment",
      "self-harm/instructions": "Self-Harm Instructions",
    };
    // Return first true category as violation
    const found = Object.entries(categories).find(([_, v]) => v);
    return found ? mapping[found[0] as ModerationCategory] : "Unknown";
  };


  const getAIConfidence = (category_scores: Record<ModerationCategory, number>, categories: Record<ModerationCategory, boolean>) => {
    // Only show the score for the first true category
    const found = Object.entries(categories).find(([_, v]) => v);
    if (found) {
      return Math.round((category_scores[found[0] as ModerationCategory] || 0) * 100);
    }
    return 0;
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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
 <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-row-1 lg:grid-row-3 gap-8">
          {/* ...existing code... */}
          {isAdmin && (
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Admin</h2>
              {/* Flagged Content Table */}
              <div className="mb-12">
                <div className="border-b border-gray-300 flex space-x-8 mb-4">
                  <span className="text-green-700 font-semibold border-b-2 border-green-700 pb-2">Flagged Content</span>
                  <span className="text-gray-400 pb-2">User Reports</span>
                  <span className="text-gray-400 pb-2">Ban List</span>
                </div>
                <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-left">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 font-normal">Stream</th>
                      <th className="px-4 py-2 font-normal">Violation</th>
                      <th className="px-4 py-2 font-normal">Time</th>
                      <th className="px-4 py-2 font-normal">AI Confidence</th>
                      <th className="px-4 py-2 font-normal">Status</th>
                      <th className="px-4 py-2 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMessages.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">No flagged content</td>
                      </tr>
                    )}
                    {pendingMessages.map((msg) => {
                      const violation = getViolation(msg.moderationResult.categories);
                      const aiConfidence = getAIConfidence(msg.moderationResult.category_scores, msg.moderationResult.categories);
                      return (
                        <tr key={msg.id} className="border-t border-gray-200">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center">
                              <span className="w-7 h-7 rounded-full bg-lime-100 border border-lime-400 text-lime-700 font-bold flex items-center justify-center mr-2 uppercase">
                                {msg.username[0]}
                              </span>
                              <span>{msg.username}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded font-medium text-sm">{violation}</span>
                          </td>
                          <td className="px-4 py-3">{timeAgo(msg.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-28 h-3 bg-gray-200 rounded-full mr-2">
                                <div className="h-3 bg-green-500 rounded-full" style={{ width: `${aiConfidence}%` }}></div>
                              </div>
                              <span className="text-green-700 font-semibold text-xs">{aiConfidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded font-medium text-sm">Pending Review</span>
                          </td>
                          <td className="px-4 py-3 space-x-2">
                            <button className="bg-red-100 text-red-600 border border-red-300 px-3 py-1 rounded text-sm font-medium hover:bg-red-200">Ban</button>
                            <button className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">Ignore</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* ...existing admin table and note... */}
              {/* ...existing code... */}

              <div>
              <div className="absolute top-12 left-10"></div>
              {/* Table and Note */}
              <div className="flex flex-col items-center justify-center flex-1">
                <table className="mb-16 border border-gray-400">
                  <thead>
                    <tr>
                      <th className="px-6 py-2 border-b border-gray-400 bg-lime-100 font-normal">streamer</th>
                      <th className="px-6 py-2 border-b border-gray-400 bg-lime-100 font-normal">status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.name}>
                        <td className="px-6 py-2 border-b border-gray-300 bg-lime-100">{u.name}</td>
                        <td className={`px-6 py-2 border-b border-gray-300 ${statusColors[u.status] || ""}`}>{u.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            
          )}
        </div>
      </div>
        </div>
      </div>
      {/* Leave space open above footer */}
      <div className="w-screen border-t border-gray-800"></div>
      <Footer />
    </div>
  );
}

