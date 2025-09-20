import { useEffect, useState } from "react";
import { Eye, PauseIcon, PlayIcon, Settings } from "lucide-react";
import * as Player from "@livepeer/react/player";
import { ApiStrings } from "@/lib/apiStrings";
import { LoadingIcon, MuteIcon, UnmuteIcon } from "@livepeer/react/assets";
import { Seek } from "@livepeer/react/player";
import { getSrc } from "@livepeer/react/external";
import { useLocation, matchPath } from "react-router-dom";


interface LiveStreamCardProps {
  title: string | React.ReactNode;
  streamer: any;
  viewers: number;
  isLive: boolean;
  playbackId: string;
  isEnded?: boolean;
}

export const LiveStreamCard = ({
  title,
  streamer,
  viewers,
  isLive,
  playbackId
}: LiveStreamCardProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const location = useLocation();
  const [streamStatus, setStreamStatus] = useState<{
    isLive: boolean;
    isEnded: boolean;
    loading: boolean;
  }>({
    isLive: isLive,
    isEnded: false,
    loading: true
  });

    // const showInfo =
    // location.pathname === "/stream" ||
    // !!matchPath("/player", location.pathname);
    // ...existing code...
  const showInfo =
    location.pathname === "/" ||
    location.pathname === "/stream" ||
    !!matchPath("/player", location.pathname);
// ...existing code...

  // Fetch stream source
  useEffect(() => {
    async function fetchSrc() {
      try {
        const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/${playbackId}`, {
          headers: {
            contentType: 'application/json',
            "ngrok-skip-browser-warning": 'true',
            "Access-Control-Allow-Origin": "*",
          }
        });
        if (!response.ok) throw new Error("Failed to fetch playback src");
        const data = await response.json();
        console.log(data.playbackInfo, 'playback src data');
        setSrc(data.playbackInfo);
      } catch (error) {
        console.error("Error fetching playback src:", error);
        setSrc(null);
      }
    }

    if (playbackId) fetchSrc();
  }, [playbackId]);

  // Check stream status periodically
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

const checkStreamStatus = async () => {
  try {
    const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream-by/${playbackId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": 'true',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Stream status check:', data);

      // Use terminate to determine status
      const isLive = data.terminate === false;
      const isEnded = data.terminate === true;

      setStreamStatus(prev => ({
        ...prev,
        isLive,
        isEnded,
        loading: false
      }));
    } else {
      // If we can't fetch status, assume it's ended
      setStreamStatus(prev => ({
        ...prev,
        isLive: false,
        isEnded: true,
        loading: false
      }));
    }
  } catch (error) {
    console.error("Error checking stream status:", error);
    setStreamStatus(prev => ({
      ...prev,
      loading: false
    }));
  }
};

    // Check immediately
    checkStreamStatus();

    // Then check every 30 seconds
    intervalId = setInterval(checkStreamStatus, 30000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [playbackId]);

  console.log(src, 'fetch src string');
  console.log('Stream status:', streamStatus);

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white">
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {src ? (
          <Player.Root src={getSrc(src)} clipLength={10}>
            <Player.Container className="w-full h-full">
              <Player.Video className="w-full h-full object-cover" />
              <Player.Controls className="absolute inset-0 flex items-center justify-center">
                <Player.PlayPauseTrigger className="w-12 h-12 bg-black/60 rounded-full text-white" />
              </Player.Controls>
              
              <Player.LoadingIndicator asChild>
                <LoadingIcon
                  style={{
                    width: "32px",
                    height: "32px",
                    animation: "spin infinite 1s linear",
                  }}
                />
              </Player.LoadingIndicator>

              <Player.ErrorIndicator matcher="all" asChild>
                <LoadingIcon
                  style={{
                    width: "32px",
                    height: "32px",
                    animation: "spin infinite 1s linear",
                  }}
                />
              </Player.ErrorIndicator>

              <Player.Controls
                style={{
                  background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6))",
                  padding: "0.5rem 1rem",
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "between",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Player.PlayPauseTrigger
                      style={{
                        width: 25,
                        height: 25,
                      }}
                    >
                      <Player.PlayingIndicator asChild matcher={false}>
                        <PlayIcon />
                      </Player.PlayingIndicator>
                      <Player.PlayingIndicator asChild>
                        <PauseIcon />
                      </Player.PlayingIndicator>
                    </Player.PlayPauseTrigger>

                    <Player.LiveIndicator
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          backgroundColor: "#ef4444",
                          height: 8,
                          width: 8,
                          borderRadius: 9999,
                        }}
                      />
                      <span style={{ fontSize: 12, userSelect: "none" }}>LIVE</span>
                    </Player.LiveIndicator>

                    <Player.MuteTrigger
                      style={{
                        width: 25,
                        height: 25,
                      }}
                    >
                      <Player.VolumeIndicator asChild matcher={false}>
                        <MuteIcon />
                      </Player.VolumeIndicator>
                      <Player.VolumeIndicator asChild matcher={true}>
                        <UnmuteIcon />
                      </Player.VolumeIndicator>
                    </Player.MuteTrigger>
                    
                    <Player.Volume
                      style={{
                        position: "relative",
                        display: "flex",
                        flexGrow: 1,
                        height: 25,
                        alignItems: "center",
                        maxWidth: 120,
                        touchAction: "none",
                        userSelect: "none",
                      }}
                    >
                      <Player.Track
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          position: "relative",
                          flexGrow: 1,
                          borderRadius: 9999,
                          height: "2px",
                        }}
                      >
                        <Player.Range
                          style={{
                            position: "absolute",
                            backgroundColor: "white",
                            borderRadius: 9999,
                            height: "100%",
                          }}
                        />
                      </Player.Track>
                      <Player.Thumb
                        style={{
                          display: "block",
                          width: 12,
                          height: 12,
                          backgroundColor: "white",
                          borderRadius: 9999,
                        }}
                      />
                    </Player.Volume>
                  </div>
                  <Settings />
                </div>
                <Seek
                  style={{
                    position: "relative",
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                />
              </Player.Controls>
            </Player.Container>
          </Player.Root>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            Loading stream...
          </div>
        )}

        {/* Live/Ended indicator based on actual stream status */}
        {!streamStatus.loading && (
          <div className={`absolute top-3 right-3 text-white text-xs font-bold px-2 py-1 rounded-sm ${
            streamStatus.isLive ? 'bg-red-500' : 'bg-gray-600'
          }`}>
            {streamStatus.isLive ? 'LIVE' : 'STREAM ENDED'}
          </div>
        )}

        {/* Loading indicator for stream status */}
        {streamStatus.loading && (
          <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
            CHECKING...
          </div>
        )}

        {/* Viewer count */}
        <div className="absolute top-3 left-3 bg-white/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{viewers} VIEWERS</span>
        </div>
      </div>

     {showInfo && (
        <div className="p-4 bg-lime-50 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm text-center underline cursor-pointer hover:text-gray-800">
            {streamer}
          </p>
        </div>
      )}
    </div>
  );
};