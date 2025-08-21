import React, { useState } from 'react';

interface TipModalProps {
  open: boolean;
  onClose: () => void;
}

const presetTips = [
  { usd: 5, pol: 10 },
  { usd: 10, pol: 20 },
  { usd: 20, pol: 40 },
];

const TipModal: React.FC<TipModalProps> = ({ open, onClose }) => {
  const [customPol, setCustomPol] = useState('');

  // Calculate USD equivalent for custom POL (example: 1 POL = $10)
  const polToUsd = (pol: string) => {
    const n = parseFloat(pol);
    if (isNaN(n)) return '';
    return `$${(n * 10).toLocaleString()}`;
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      {/* <div
        className={`fixed top-1/2 left-1/2 z-50 w-[360px] -translate-y-1/2 transform transition-transform duration-500 ease-in-out
          ${open ? '-translate-x-1/2 translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      > */}
            <div
        className={`fixed top-1/2 left-1/2 z-50 w-[360px] transform transition-transform duration-500 ease-in-out
            ${open ? '-translate-x-[40%] -translate-y-[40%] opacity-100' : 'translate-x-full opacity-0'}`}
        >

        <div className="relative bg-lime-50 border-2 border-lime-300 shadow-2xl rounded-xl p-8">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-black text-lg font-bold bg-white hover:bg-gray-100 transition"
            onClick={onClose}
            aria-label="Close tip modal"
          >
            ×
          </button>

          {/* Title */}
          <div className="text-center">
            <div className="uppercase tracking-widest text-sm font-semibold text-black mb-6">
              Select or enter tip amount
            </div>

            {/* Preset Buttons */}
            <div className="flex gap-4 justify-center mb-6">
              {presetTips.map((tip) => (
                <button
                  key={tip.usd}
                  className="bg-white rounded-full border-2 border-black px-6 py-2 text-lg font-semibold shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all flex flex-col items-center min-w-[80px]"
                >
                  <span>${tip.usd}</span>
                  <span className="text-xs text-gray-500 mt-1">{tip.pol}POL</span>
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <input
              className="w-full border-2 border-black rounded px-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-transparent mb-2 text-center outline-none"
              placeholder="enter custom amount (in pol)"
              value={customPol}
              onChange={(e) =>
                setCustomPol(e.target.value.replace(/[^0-9.]/g, ''))
              }
              inputMode="decimal"
            />

            {/* USD Equivalent */}
            <div className="text-gray-400 text-sm mb-4">
              {customPol && polToUsd(customPol)}
            </div>

            {/* Send Tip Button */}
            <button className="bg-pink-50 rounded-full font-semibold border-2 border-black px-8 py-2 text-lg shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all">
              send tip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TipModal;
