import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.VITE_PRIVY_APP_ID": JSON.stringify(process.env.VITE_PRIVY_APP_ID),
    "process.env.VITE_PRIVY_APP_SECRET": JSON.stringify(process.env.VITE_PRIVY_APP_SECRET),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
