import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';
import { ApiStrings } from '@/lib/apiStrings';
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { useLocation } from 'react-router-dom';
import ChatRoom from '@/components/ChatRoom';
import { io } from 'socket.io-client';
import { ToastContainer } from 'react-toastify';

const socket = io(process.env.VITE_API_LINK)

const StreamingPage = () => {
    const [streamId, setStreamId] = useState("");
    const [streamName, setStreamName] = useState("")
    const [isChatOpen, setIsChatOpen] = useState(true);
    const location = useLocation();
    const form = location.state;

    useEffect(() => {
        const fetchStream = async () => {
            const streamDetails = await LiveStream(form);
            if (streamDetails && streamDetails.data) {
                setStreamId(streamDetails.data.streamKey);
                setStreamName(streamDetails.data.name);
            } else {
                console.error('Failed to create stream or get stream details');
            }
        };
        fetchStream();
    }, []);

    useEffect(() => {
        if (!form.userId || !streamId) return;
        socket.emit('joinRoom', { roomId: streamId, user: form.userId });
    }, [form.userId, streamId]);

    const LiveStream = async (form: any) => {
        try {
            const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                    privy_id: form.userId,
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

    return (
        <div className="min-h-screen bg-gray-100">
            <ToastContainer />
            
            {/* Header component */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-lime-50 border-b border-gray-800">
                <Header />
            </div>
            
            {/* Main Content Container */}
            <div className="pt-16"> {/* Add padding top to account for fixed header */}
                <div className="flex min-h-screen">
                    {/* Video Stream Area */}
                    <div className="flex-1 bg-lime-50 relative pl-8 pt-4 pb-24">
                        {/* Broadcast Component */}
                        <Broadcast.Root ingestUrl={getIngest(streamId)}>
                            <Broadcast.Container className="absolute inset-0 top-4">
                                <Broadcast.Video 
                                    title={streamName} 
                                    className="h-full w-full"  
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                        objectFit: "contain",
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

                        {/* Stream Info Overlay */}
                        <div className="flex flex-col justify-center items-center absolute bottom-4 left-0 right-0">
                            <button className="bg-pink-50 rounded-full font-semibold backdrop-blur-sm border-2 border-gray-800 px-6 py-2 transition-all shadow-sm">
                                tip
                            </button>
                            <h1 className="text-black text-3xl font-FiraMono text-center">{form?.title}</h1>
                            <p className="text-black text-center">{form?.description}</p>
                        </div>
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