import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import {PrivyProvider} from '@privy-io/react-auth';
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import {base} from 'viem/chains';
import './index.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  clientId={import.meta.env.VITE_PRIVY_CLIENT_ID}
  config={{
    defaultChain: base,
    // Create embedded wallets for users who don't have a wallet
    // embeddedWallets: {
    //   ethereum: {
    //     createOnLogin: 'users-without-wallets'
    //   }
    }
  }
>
  <App />
</PrivyProvider>
  </StrictMode>
);
