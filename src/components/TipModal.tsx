import React, { useEffect, useState } from "react";
import { ApiStrings } from "@/lib/apiStrings";
// import {
//   EIP1193Provider,
//   usePrivy,
//   useSendTransaction,
//   useWallets,
// } from "@privy-io/react-auth";
// import { ethers } from "ethers";

interface TipModalProps {
  open: boolean;
  onClose: () => void;
}

const presetTips = [{ usd: 5 }, { usd: 10 }, { usd: 20 }];

// Replace with your RPC URL
// const RPC_URL = "https://mainnet.base.org"; 

const TipModal: React.FC<TipModalProps> = ({ open, onClose }) => {
  const [customPol, setCustomPol] = useState<string>("");
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [receiverAddress] = useState<string | null>(null);
  // const [setBalance] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const { sendTransaction } = useSendTransaction();
  // const { wallets: privyWallets } = useWallets();
  // const { user } = usePrivy();

  // Fetch ETH price + receiver wallet
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${ApiStrings.API_BASE_URL}/tips/eth-price`);
        const data = await res.json();
        setEthPrice(data?.eth_current_price || null);
      } catch {
        setEthPrice(null);
      }

      // if (user?.id) {
      //   try {
      //     const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${user.id}`);
      //     const data = await res.json();
      //     setReceiverAddress(data?.wallet_address || null);
      //   } catch {
      //     setReceiverAddress(null);
      //   }
      // }
    }
    fetchData();
  }, []);

  /** ============== Wallet Helpers ============== */
  // const sendFromPrivyEmbeddedWallet = async (
  //   from: string,
  //   to: string,
  //   value: string | bigint
  // ) => {
  //   await sendTransaction(
  //     { to, value, chainId: 8453 },
  //     {
  //       uiOptions: { showWalletUIs: true },
  //       address: from,
  //     }
  //   );
  // };

  // const sendFromPrivyExternalWallet = async (
  //   from: string,
  //   to: string,
  //   value: string | bigint
  // ) => {
  //   const wallet = privyWallets.find((w) => w.address === from);
  //   if (!wallet || !wallet.getEthereumProvider) {
  //     throw new Error("No external wallet found or provider not available");
  //   }

  //   const provider: EIP1193Provider = await wallet.getEthereumProvider();
  //   const proxy = getProxyProvider(provider);
  //   const ethersProvider = new ethers.BrowserProvider(proxy);
  //   const signer = await ethersProvider.getSigner();

  //   const tx = await signer.sendTransaction({ to, value, chainId: 8453 });
  //   await tx.wait();
  // };

  // function getProxyProvider(provider: EIP1193Provider): EIP1193Provider {
  //   return {
  //     ...provider,
  //     request: async (args: { method: string; params?: unknown[] }) => {
  //       if (
  //         ["eth_accounts", "eth_requestAccounts", "eth_sendTransaction"].includes(
  //           args.method
  //         )
  //       ) {
  //         return provider.request(args);
  //       }

  //       const resp = await fetch(RPC_URL, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           jsonrpc: "2.0",
  //           method: args.method,
  //           params: args.params || [],
  //           id: ethers.hexlify(ethers.randomBytes(4)),
  //         }),
  //       });

  //       if (!resp.ok) throw new Error(`RPC failed with ${resp.status}`);

  //       const data = await resp.json();
  //       if (data.error) throw new Error(data.error.message || "Unknown RPC error");

  //       return data.result;
  //     },
  //   };
  // }

  // async function getBalance() {
  //   if (!authenticated || !ready) return;
  //   const provider = await privyWallets[0].getEthersProvider();
  //   const signer = provider.getSigner();
  //   const address = await signer.getAddress();
  //   const bal = ethers.formatEther(await provider.getBalance(address));
  //   setBalance(bal);
  // }

  /** ============== Utility ============== */
  const usdToEth = (usd: number) => {
    if (!ethPrice || ethPrice === 0) return "";
    return (usd / ethPrice).toFixed(6);
  };

  /** ============== Handle Tip Sending ============== */
  const handleSendTip = async (usdAmount: number) => {
    if (!ethPrice) return setError("ETH price unavailable.");
    if (!receiverAddress) return setError("Receiver address unavailable.");

    setLoading(true);
    setError(null);

    const ethAmount = usdToEth(usdAmount);
    try {
      const res = await fetch(`${ApiStrings.API_BASE_URL}/tips/tip-streamer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: ethAmount,
          // sender: user?.wallet?.address,
          receiver: receiverAddress,
        }),
      });

      if (!res.ok) throw new Error("Failed to send tip");
      onClose();
    } catch {
      setError("Failed to send tip.");
    } finally {
      setLoading(false);
    }
  };

  /** ============== UI ============== */
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
      <div
        className={`fixed top-1/2 left-1/2 z-50 w-[360px] transform transition-transform duration-500 ease-in-out ${
          open
            ? "-translate-x-[40%] -translate-y-[40%] opacity-100"
            : "translate-x-full opacity-0"
        }`}
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
                    {ethPrice ? `${usdToEth(tip.usd)} ETH` : "ETH"}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Input */}
            <input
              className="w-full border-2 border-black rounded px-4 py-3 text-base text-gray-700 placeholder-gray-400 bg-transparent mb-2 text-center outline-none font-[Work_Sans]"
              placeholder="enter custom amount (in $)"
              value={customPol}
              onChange={(e) =>
                setCustomPol(e.target.value.replace(/[^0-9.]/g, ""))
              }
              inputMode="decimal"
              disabled={loading}
            />

            {customPol && (
              <div className="text-gray-400 text-sm mb-4 font-[Work_Sans]">
                {ethPrice ? `${usdToEth(Number(customPol))} ETH` : "..."}
              </div>
            )}

            {/* Send Tip */}
            <button
              className="bg-pink-50 rounded-full font-semibold border-2 border-black px-8 py-2 text-lg shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all disabled:opacity-50"
              onClick={() => customPol && handleSendTip(Number(customPol))}
              disabled={
                loading ||
                !customPol ||
                isNaN(Number(customPol)) ||
                Number(customPol) <= 0
              }
            >
              {loading ? "Sending..." : "Send Tip"}
            </button>
            {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default TipModal;
