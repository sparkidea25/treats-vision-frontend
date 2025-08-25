import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useStreamPresence({ playbackId, streamId }: { playbackId: string; streamId: string }) {
  const [ended, setEnded] = useState(false);
  const socket = io(import.meta.env.VITE_API_URL, { path: '/socket.io/' });

  useEffect(() => {
    socket.emit('stream:join', playbackId);
    socket.on('stream:ended', () => setEnded(true));
    return () => {
      socket.emit('stream:leave', playbackId);
      socket.off('stream:ended');
      socket.close();
    };
  }, [playbackId]);

  // “End Stream” button (graceful): tell your backend to terminate
  const endStream = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/livepeer/${streamId}/terminate-stream`, { method: 'POST', credentials: 'include' });
  };

  // Rude exit protection: send a beacon on unload/navigation
  useEffect(() => {
    const onUnload = () => {
      const data = JSON.stringify({ streamId, reason: 'unload' });
      navigator.sendBeacon(`${import.meta.env.VITE_API_URL}/streams/end-beacon`, data);
    };
    window.addEventListener('pagehide', onUnload);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('pagehide', onUnload);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [streamId]);

  // Fallback polling (in case sockets miss or user closed tab): ask backend if stream is still active
  useEffect(() => {
    const i = setInterval(async () => {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/streams/${playbackId}/status`, { credentials: 'include' });
      const { isActive } = await r.json();
      if (!isActive) setEnded(true);
    }, 8000);
    return () => clearInterval(i);
  }, [playbackId]);

  return { ended, endStream };
}
