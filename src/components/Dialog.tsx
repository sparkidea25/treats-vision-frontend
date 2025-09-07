import React, { useEffect, useRef, useState } from 'react';
import { Dialog as HeadlessDialog, DialogPanel } from '@headlessui/react';
import { X, Camera } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { getUserUserId } from '@/lib/utils';
import { Listbox } from './ui/Listbox';
import { StreamPreviewButton } from './ui/streamPreviewButton';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, className }) => {
  const { user, authenticated } = usePrivy();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    source: 'Logitech Webcam',
    tokenAddress: '',
    tokenAmount: 0,
    tvChat: true,
    tokenAccess: true,
    publicAccess: true,
    privy_id: '',
  });

  const sources = [
    { name: 'Logitech Webcam', icon: <Camera className="w-4 h-4 mr-2 inline" /> },
    { 
      name: 'Built-in Camera', 
      icon: <Camera className="w-5 h-5 text-gray-400" /> 
    },
  ];

  useEffect(() => {
    const fetchUserId = async () => {
        if (authenticated && user) {
            console.log(user, 'user in dialog');
            const getId = await getUserUserId(user.id);
            console.log(getId, 'setGetId');
            
            setUserId(getId.id);
            setForm(prev => ({ ...prev, privy_id: getId.id }));
            console.log('User authenticated:', user.id);
        } else {
            console.log('User not authenticated');
        }
    };
    fetchUserId();
}, [user, authenticated]);

  useEffect(() => {
    if (step === 2 && form.source === 'Logitech Webcam') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => {
          setCameraError('Unable to access camera');
        });
      
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  }, [step, form.source]);

  // Reset step and form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setCameraError(null);
      setForm(() => ({
        title: '',
        description: '',
        source: 'Logitech Webcam',
        tokenAddress: '',
        tokenAmount: 0,
        tvChat: true,
        tokenAccess: true,
        publicAccess: true,
        privy_id: userId,
      }));
    } else {
      // Clean up camera stream when dialog closes
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [open, userId]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-lg font-thin mb-2 font-sans">create stream</h2>
            <div>
              <label className="block text-gray-700 font-sans">TITLE</label>
              <input
                className="border p-2 mb-2 w-full bg-white"
                value={form.title}
                placeholder="add a title that describes your stream"
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <br />
            <label className="block text-gray-700 font-sans">DESCRIPTION</label>
            <textarea
              className="border p-2 mb-2 w-full bg-white"
              placeholder="tell viewers more about your stream, you can include links here"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <label className="block text-gray-700 font-sora">SELECT STREAM SOURCE</label>
            <Listbox value={form.source} onChange={value => setForm({ ...form, source: value })}>
              <Listbox.Button>
                {sources.find(s => s.name === form.source)?.icon}
                <span className="text-gray-700">{form.source}</span>
              </Listbox.Button>
              
              <Listbox.Options>
                {sources.map((source) => (
                  <Listbox.Option
                    key={source.name}
                    value={source.name}
                  >
                    {source.icon}
                    <span className="text-gray-700">{source.name}</span>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>

            <div className="flex items-center mb-1">
              <input
                id="tv-chat"
                type="checkbox"
                className="mr-2 bg-lime-50"
                checked={form.tvChat}
                onChange={e => setForm({ ...form, tvChat: e.target.checked })}
              />
              <label htmlFor="tv-chat" className="font-medium text-gray-800">tv chat</label>
            </div>
            <div className="ml-6 mb-3 text-gray-600 text-sm font-medium">ENABLE DURING STREAM</div>

            <div className="flex items-center mb-1">
              <input
                id="token-access"
                type="checkbox"
                className="mr-2 accent-black bg-lime-50"
                checked={form.tokenAccess}
                onChange={e => setForm({ ...form, tokenAccess: e.target.checked })}
              />
              <label htmlFor="token-access" className="font-medium text-gray-800 mr-4">token access</label>
              <input
                id="public-access"
                type="checkbox"
                className="mr-2 accent-black"
                checked={form.publicAccess}
                onChange={e => setForm({ ...form, publicAccess: e.target.checked })}
              />
              <label htmlFor="public-access" className="font-medium text-gray-800">public access</label>
            </div>
            <div className="ml-6 text-gray-600 text-sm font-medium">
              SET TO PRIVATE<br />
              ONLY ACCESSIBLE TO NIBS HOLDERS
            </div>
            <br />

            <StreamPreviewButton onClick={() => setStep(2)} title="stream preview" />
          </div>
        );
      
      case 2:
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">Stream Preview</h2>
            <div className="mb-2">Title: {form.title}</div>
            <div className="mb-2">Description: {form.description}</div>
            <div className="mb-2">Source: {form.source}</div>
            {form.source === 'Logitech Webcam' && (
              <div className="mb-4 flex justify-center">
                <div className="w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-gray-300">
                  {cameraError ? (
                    <span className="text-red-600 text-sm">{cameraError}</span>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                  )}
                </div>
              </div>
            )}
            <StreamPreviewButton onClick={() => setStep(1)} title="go back" />
            <StreamPreviewButton 
              onClick={async () => {
                // Check if user has a name before proceeding to go live
                if (authenticated && user) {
                  const getId = await getUserUserId(user.id);
                  if (!getId.name) {
                    Notify.warning('Please complete your profile setup to continue streaming', {
                      timeout: 5000,
                    });
                    navigate('/profile?from=stream', { state: { from: 'stream' } });
                    onClose();
                    return;
                  }
                }
                setStep(3);
              }} 
              title="go live" 
            />
          </div>
        );
      
      case 3:
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">Token Access</h2>
            <input
              className="border p-2 mb-2 w-full bg-lime-50"
              placeholder="Token Address"
              value={form.tokenAddress}
              onChange={e => setForm({ ...form, tokenAddress: e.target.value })}
            />
            <input
              className="border p-2 mb-2 w-full bg-lime-50"
              placeholder="Number of Tokens Required"
              type="number"
              value={form.tokenAmount}
              onChange={e => setForm({ ...form, tokenAmount: parseInt(e.target.value, 10) || 0 })}
            />
            <StreamPreviewButton onClick={() => setStep(2)} title="back" />
            <StreamPreviewButton 
              onClick={() => {
                navigate('/stream', {state: form});
                onClose();
              }} 
              title="Create Stream" 
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className={`fixed z-50 inset-0 overflow-y-auto ${className || ''}`}
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" onClick={onClose} />
        <DialogPanel className="border-r-4 border-lime-400 shadow-[0_0_16px_4px_rgba(163,230,53,0.15)] bg-lime-50 border-4 border-gray-950 p-0 w-full max-w-md rounded-lg relative z-10">
          <div className="flex items-center justify-between p-4 border-b border-lime-300">
            <div className="flex flex-col gap-2 w-full">
              {/* Stepper */}
              <div className="flex items-center justify-center mb-2">
                {[1, 2, 3].map((s, idx) => (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center rounded-full w-8 h-8 border-2 
                          ${step === s ? 'bg-lime-400 border-lime-600 text-white font-bold shadow-lg' : 'bg-white border-lime-400 text-lime-600'}
                          transition-all duration-200`}
                      >
                        {s}
                      </div>
                      <span className={`text-xs mt-1 ${step === s ? 'text-lime-700 font-semibold' : 'text-gray-500'}`}>
                        {s === 1 ? 'Create' : s === 2 ? 'Preview' : 'Token'}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className="w-8 h-1 bg-lime-300 mx-1 rounded-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button
              className="text-gray-700 hover:text-black ml-4"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            {renderStepContent()}
          </div>
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};