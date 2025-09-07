import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';
import TipModal from '@/components/TipModal';
import { ApiStrings } from '@/lib/apiStrings';
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { useLocation } from 'react-router-dom';
import ChatRoom from '@/components/ChatRoom';
import { ToastContainer } from 'react-toastify';
import { usePrivy } from '@privy-io/react-auth';

const StreamingPage = () => {
    const { user } = usePrivy();
    const [streamId, setStreamId] = useState("");
    const [streamName, setStreamName] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [tipModalOpen, setTipModalOpen] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const location = useLocation();
    const form = location.state;

    const fetchUserName = async () => {
        if (!user) return null;
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
            console.log(data.name, 'fetched user name');
            setDisplayName(data.name);
            return data.name;
        } catch (error) {
            console.error('Error fetching user name:', error);
            return null;
        }
    };

    const LiveStream = async (form: any, userName: string) => {
        if (!user) return null;
        try {
            const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": 'true'
                },
                body: JSON.stringify({ 
                    name: form.title || "stream - treatsvision ama",
                    description: form.description,
                    source: form.source,
                    tokenAddress: form.tokenAddress,
                    requiredTokens: form.tokenAmount,
                    tvChat: form.tvChat,
                    tokenAccess: form.tokenAccess,
                    publicAccess: form.publicAccess,
                    privy_id: user.id,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const streamDetails = await response.json();
            return streamDetails;
        } catch (error) {
            console.error('Error creating stream:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchStreamAndUserName = async () => {
            // First fetch the user name
            const userName = await fetchUserName();
            
            if (userName) {
                // Then create the stream with the fetched user name
                const streamDetails = await LiveStream(form, userName);
                console.log(streamDetails, 'stream key details')
                if (streamDetails && streamDetails.data) {
                    setStreamId(streamDetails.data.streamKey);
                    setStreamName(streamDetails.data.name);
                } else {
                    console.error('Failed to create stream or get stream details');
                }
            } else {
                console.error('Failed to fetch user name, cannot create stream');
            }
        };

        if (user) {
            fetchStreamAndUserName();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-lime-50">
            <ToastContainer />
            
            {/* Header component */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-lime-50 border-b border-gray-800">
                <Header />
            </div>
            
            {/* Main Content Container */}
            <div className="pt-16"> {/* Add padding top to account for fixed header */}
                <div className="flex min-h-screen">
                    {/* Video Stream Area */}
                    <div className="flex-1 bg-lime-50 flex flex-col min-h-screen ml-8">
                        {/* Broadcast Component */}
                        <div className="flex-1 flex flex-col justify-center">
                            <Broadcast.Root ingestUrl={getIngest(streamId)}>
                                <Broadcast.Container className="w-full h-full">
                                    <Broadcast.Video 
                                        title={streamName} 
                                        className="w-full h-full object-contain bg-black rounded-none"  
                                        style={{
                                            objectFit: "contain",
                                            background: "#000",
                                        }} 
                                    />

                                    <Broadcast.Controls className="flex items-center justify-center">
                                        <Broadcast.EnabledTrigger className="w-10 h-10 hover:scale-105 flex-shrink-0 border-2 border-purple-500 rounded-full transition-transform duration-200">
                                            <Broadcast.EnabledIndicator asChild matcher={false}>
                                                <EnableVideoIcon
                                                    className="w-full h-full"
                                                    style={{
                                                        background: '#fff',
                                                        transition: 'background 0.2s, color 0.2s',
                                                        boxSizing: 'border-box',
                                                        cursor: 'pointer',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = '#000';
                                                        e.currentTarget.style.color = '#000';
                                                        e.currentTarget.style.border = '2px solid #a855f7';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = '#000';
                                                        e.currentTarget.style.color = '#fff';
                                                        e.currentTarget.style.border = '2px solid #a855f7';
                                                    }}
                                                />
                                            </Broadcast.EnabledIndicator>
                                            <Broadcast.EnabledIndicator asChild>
                                                <StopIcon className="w-full h-full" />
                                            </Broadcast.EnabledIndicator>
                                        </Broadcast.EnabledTrigger>
                                    </Broadcast.Controls>
                                    {/* Updated Status Indicator - Always visible */}
                                    <Broadcast.LoadingIndicator asChild matcher={false}>
                                        <div className="absolute top-1 right-1">
                                            {/* Status button - always shows current status */}
                                            <div className="overflow-hidden py-1 px-2 rounded-full bg-red-500 flex items-center backdrop-blur cursor-pointer">
                                                <Broadcast.StatusIndicator
                                                    matcher="live"
                                                    className="flex gap-2 items-center"
                                                >
                                                    <div className="bg-white animate-pulse h-1.5 w-1.5 rounded-full" />
                                                    <span className="text-xs text-white select-none font-semibold">LIVE</span>
                                                </Broadcast.StatusIndicator>
                                                <Broadcast.StatusIndicator
                                                    className="flex gap-2 items-center"
                                                    matcher="pending"
                                                >
                                                    <div className="bg-white h-1.5 w-1.5 rounded-full animate-pulse" />
                                                    <span className="text-xs text-white select-none font-semibold">LOADING</span>
                                                </Broadcast.StatusIndicator>
                                                <Broadcast.StatusIndicator
                                                    className="flex gap-2 items-center"
                                                    matcher="idle"
                                                >
                                                    <div className="bg-white h-1.5 w-1.5 rounded-full" />
                                                    <span className="text-xs text-white select-none font-semibold">IDLE</span>
                                                </Broadcast.StatusIndicator>
                                            </div>
                                        </div>
                                    </Broadcast.LoadingIndicator>
                                </Broadcast.Container>
                            </Broadcast.Root>
                        </div>
                        {/* Stream Info Overlay - now always below video */}
                        <div className="flex flex-col justify-center items-center py-4">
                            {/* <button
                                className="bg-pink-50 rounded-full font-semibold backdrop-blur-sm border-2 border-gray-800 px-6 py-2 transition-all shadow-sm"
                                onClick={() => setTipModalOpen(true)}
                            >
                                tip
                            </button> */}
                            <button className="group bg-pink-50 hover:bg-black text-black hover:text-white rounded-full font-semibold border-2 border-black hover:border-pink-500 px-2 py-2 text-lg shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all mt-2"
                            onClick={() => setTipModalOpen(true)}
                            style={{ minWidth: '100px' }}
                        >
                            <span className="font-sans">tip</span>
                            {/* <span className="font-(sans-serif, 'Work_Sans')">tip</span> */}
                        </button>
                            <h1 className="text-black text-3xl font-FiraMono text-center">{form?.title}</h1>
                            <p className="text-black text-center">{form?.description}</p>
                        </div>
                        {/* Tip Modal Overlay */}
                        <TipModal open={tipModalOpen} onClose={() => setTipModalOpen(false)} />
                    </div>
                    
                    {/* Chat Room Component */}
                    <div className="flex-shrink-0">
                        <ChatRoom streamId={streamId} onChatToggle={setIsChatOpen} />
                    </div>
                </div>
                
                {/* Divider line */}
                <div className="ml-8 border-b border-gray-800"></div>
                {/* Footer */}
                <Footer />
            </div>
            
            {/* Vertical border line that spans entire height */}
            <div className="fixed inset-y-0 left-8 w-px bg-black z-50 pointer-events-none"></div>
            
            {/* Vertical border line between stream and chat - adjusts based on chat state */}
            <div 
                className="fixed inset-y-0 w-px bg-gray-800 z-50 pointer-events-none" 
                style={{ left: isChatOpen ? 'calc(100% - 320px)' : 'calc(100% - 64px)' }}
            ></div>
        </div>
    );
};

export default StreamingPage;