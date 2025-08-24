import React, { useState } from 'react';
import { ApiStrings } from '@/lib/apiStrings';
import { usePrivy } from '@privy-io/react-auth';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';


interface TipModalProps {
  open: boolean;
  onClose: () => void;
}

const presetTips = [
  { usd: 5 },
  { usd: 10 },
  { usd: 20 },
];


const TipModal: React.FC<TipModalProps> = ({ open, onClose }) => {
  const [customPol, setCustomPol] = useState<string>('');
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState("");
  const {sendTransaction} = useSendTransaction();
  const {wallets} = useWallets();
  const { user, authenticated, ready } = usePrivy();

  // Fetch ETH price and receiver address on mount
  const [receiverAddress, setReceiverAddress] = useState<string | null>(null);
  React.useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const res = await fetch(`${ApiStrings.API_BASE_URL}/tips/eth-price`);
        const data = await res.json();
        setEthPrice(data?.eth_current_price || null);
      } catch (e) {
        setEthPrice(null);
      }
    };
    fetchEthPrice();

    // Fetch receiver address if user is authenticated and has a privyId
    const fetchReceiver = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${user.id}`);
          const data = await res.json();
          setReceiverAddress(data?.wallet_address || null);
        } catch (e) {
          setReceiverAddress(null);
        }
      }
    };
    fetchReceiver();
  }, [user?.id]);

  async function getBalance() {
  if (!authenticated && ready) {
    console.log("user not authenticated yet");
    return;
  }
  const provider = await wallets[0].getEthersProvider();
  const signer = provider.getSigner();  
  // Get user's Ethereum public address
  const address =   await signer.getAddress();
  console.log(address);
  
  // Get user's balance in ether
  const balance = ethers.formatEther(
    (await provider.getBalance(address)).toString() // balance is in wei
  );
  console.log(balance);
  setBalance(balance);
}

  // Convert USD to ETH
  const usdToEth = (usd: number) => {
    if (!ethPrice || ethPrice === 0) return '';
    return (usd / ethPrice).toFixed(6); // 6 decimals for ETH
  };

  // Handle sending tip
  const handleSendTip = async (usdAmount: number) => {
    if (!ethPrice) {
      setError('ETH price unavailable.');
      return;
    }
    if (!receiverAddress) {
      setError('Receiver address unavailable.');
      return;
    }
    setLoading(true);
    setError(null);
    const ethAmount = usdToEth(usdAmount);
    console.log(ethAmount, 'eth amount to send')
    try {
      const res = await fetch(`${ApiStrings.API_BASE_URL}/tips/tip-streamer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: ethAmount,
          sender: user?.wallet?.address,
          receiver: receiverAddress,
        }),
      });
      if (!res.ok) throw new Error('Failed to send tip');
      // Optionally handle success (close modal, show message, etc)
      onClose();
    } catch (e) {
      setError('Failed to send tip.');
    } finally {
      setLoading(false);
    }
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
                <div key={tip.usd} className="flex flex-col items-center">
                  <button
                    className="bg-white rounded-full border-2 border-black px-6 py-2 text-lg font-semibold shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all flex flex-col items-center min-w-[80px]"
                    onClick={() => handleSendTip(tip.usd)}
                    disabled={loading}
                  >
                    <span>${tip.usd}</span>
                  </button>
                  <span className="text-xs text-gray-500 mt-3 block">
                    {ethPrice ? `${usdToEth(tip.usd)} ETH` : 'ETH'}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Amount Input */}

            <input
              className="w-full border-2 border-black rounded px-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-transparent mb-2 text-center outline-none font-[Work_Sans]"
              placeholder="enter custom amount (in $)"
              value={customPol}
              onChange={(e) => setCustomPol(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              disabled={loading}
            />


            {/* ETH Equivalent for custom input */}
            {customPol && customPol !== '' && (
              <div className="text-gray-400 text-sm mb-4 font-[Work_Sans]">
                {ethPrice ? `${usdToEth(Number(customPol))} ETH` : '...'}
              </div>
            )}

            {/* Send Tip Button */}
            <button
              className="bg-pink-50 rounded-full font-semibold border-2 border-black px-8 py-2 text-lg shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all disabled:opacity-50"
              onClick={() => customPol && handleSendTip(Number(customPol))}
              disabled={loading || !customPol || isNaN(Number(customPol)) || Number(customPol) <= 0}
            >
              {loading ? 'Sending...' : 'send tip'}
            </button>
            {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default TipModal;
