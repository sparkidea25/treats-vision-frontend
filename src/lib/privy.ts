// // import type {
// //     EIP1193Provider
// // } from '@privy-io/react-auth';
// // import { usePrivy, useWallets } from '@privy-io/react-auth';
// // import { ethers } from 'ethers';
// // import { parseEther } from 'ethers/utils';
// // import { useState } from 'react';

// // const CHAIN_ID = 1;
// // const RPC_URL = 'https://ethereum-rpc.publicnode.com';

// // export function TransferFunds() {
// //     const privy = usePrivy();
// //     const { wallets: privyWallets } = useWallets();

//     // const send = async (to: string, amount: string | bigint) => {
//     //     const from = privy.user.smartWallet?.address || privy.user.wallet?.address;
//     //     const value = parseEther(`${amount}`);

//     //     if (privy.user?.wallet) {
//     //         if (privy.user.wallet.walletClientType === 'privy') {
//     //             await sendFromPrivyEmbeddedWallet(from, to, value);
//     //         } else {
//     //             await sendFromPrivyExternalWallet(from, to, value);
//     //         }
//     //     }
//     // }

    // const sendFromPrivyEmbeddedWallet = async (from: string, to: string, value: string | bigint) => {
    //     await privy.sendTransaction(
    //         {
    //             to: to,
    //             value: value,
    //             chainId: CHAIN_ID,
    //         },
    //         {
    //             uiOptions: {
    //                 showWalletUIs: true,
    //             },
    //             address: from,
    //         }
    //     );
    //     balance.refresh();
    // };

// //     const sendFromPrivyExternalWallet = async (from: string, to: string, value: string | bigint) => {
// //         const wallet = privyWallets.find((w) => w.address === from);

// //         if (!wallet || !wallet.getEthereumProvider) {
// //             throw new Error('No external wallet found or provider not available');
// //         }

// //         const provider: EIP1193Provider = await wallet.getEthereumProvider();
// //         const proxy = getProxyProvider(provider);
// //         const ethersProvider = new ethers.BrowserProvider(proxy);
// //         const signer = await ethersProvider.getSigner();
// //         const tx = await signer.sendTransaction({
// //             to: to,
// //             value: value,
// //             chainId: CHAIN_ID,
// //         });
// //         await tx.wait();
// //     };

// //     return ( <>{/* Component UI */}</> );
// // }

// /**
//  * Privy adds query parameters to the RPC URL, which can cause issues with certain
//  * EVM network RPC endpoints. For this reason, we create a proxy provider that handles
//  * certain transaction pre-flight requests.
//  */
// // function getProxyProvider(provider: EIP1193Provider): EIP1193Provider {
// //     return {
// //         ...provider,

// //         request: async (args: { method: string; params?: unknown[] }) => {
// //             if (
// //                 ['eth_accounts', 'eth_requestAccounts', 'eth_sendTransaction'].includes(args.method)
// //             ) {
// //                 // Use the given provider's request method for these methods
// //                 return provider.request(args);
// //             }

// //             const resp = await fetch(RPC_URL, {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({
// //                     jsonrpc: '2.0',
// //                     method: args.method,
// //                     params: args.params || [],
// //                     id: ethers.hexlify(ethers.randomBytes(4)),
// //                 }),
// //             });
// //             if (!resp.ok) {
// //                 throw new Error(`RPC request failed with status ${resp.status}`);
// //             }

// //             const data = await resp.json();
// //             if (data.error) {
// //                 throw new Error(data.error.message || 'Unknown error from RPC');
// //             }

// //             return data.result;
// //         },
// //     };
// // }