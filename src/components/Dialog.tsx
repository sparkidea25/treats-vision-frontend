import React, { useEffect, useRef, useState } from 'react';
import { Dialog as HeadlessDialog, DialogPanel, Listbox } from '@headlessui/react';
import { X, Camera } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { getUserUserId } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, className }) => {
  const { user, authenticated } = usePrivy();
  const [step, setStep] = useState(1);
  const [userId, setUserId]= useState("")
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
    privy_id: userId,
  });

  const sources = [
    { name: 'Logitech Webcam', icon: <Camera className="w-4 h-4 mr-2 inline" /> },
    { name: 'Screen Share', icon: null },
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      if (authenticated && user) {
        console.log(user, 'user in dialog');
        const getId = await getUserUserId(user.id);
        setUserId(getId.id);
        console.log('User authenticated:', user.id);
      } else {
        console.log('User not authenticated');
      }
    };
    fetchUserId();
  }, [user]);

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
      setForm({
        title: '',
        description: '',
        source: 'Logitech Webcam',
        tokenAddress: '',
        tokenAmount: 0,
        tvChat: true,
         tokenAccess: true,
    publicAccess: true,
    privy_id: userId, // Ensure privy_id is set correctly 
      });
    }
  }, [open]);

  if (!open) return null;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-lg font-bold mb-2">Create Stream</h2>
            <div>
              <input
                className="border p-2 mb-2 w-full bg-white"
                value={form.title}
                placeholder="title"
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
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
                defaultChecked
              />
              <label htmlFor="token-access" className="font-medium text-gray-800 mr-4">token access</label>
              <input
                id="public-access"
                type="checkbox"
                className="mr-2 accent-black"
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
              onChange={e => setForm({ ...form, tokenAmount: parseInt(e.target.value, 10) || 0 } )}
            />
            <button className="bg-black text-white px-4 py-2 rounded mr-2" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => {
                navigate('/stream', { state: form });
                onClose();
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
    <HeadlessDialog
      open={open}
      onClose={onClose}
      className={`fixed z-50 inset-0 overflow-y-auto ${className || ''}`}
      static
    >
      <div className="flex items-center justify-center min-h-screen relative">
        <div className="fixed inset-0 bg-lime-50 border-2 border-lime-400 opacity-30" aria-hidden="true" />
        <DialogPanel className="border-r-4 border-lime-400 shadow-[0_0_16px_4px_rgba(163,230,53,0.15)] bg-lime-50 border-6 border-gray-950 p-0 w-full max-w-md rounded-lg relative z-10">
          <div className="flex items-center justify-between p-4 border-b border-lime-300">
            {/* <h2 className="text-lg font-semibold text-gray-800">Step-by-Step Process</h2> */}
            <div className="flex flex-col gap-2 w-full">
  {/* <h2 className="text-lg font-semibold text-gray-800 text-center">Step-by-Step Process</h2> */}
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
              className="text-gray-700 hover:text-black"
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

export default Dialog;