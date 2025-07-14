import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mygaadi.app',
  appName: 'myGaadi',
  webDir: 'out',
  server: {
    // This is required for Next.js App Router to work correctly
    // It will point to your local dev server when running `npx cap run android`
    // For production builds, you would point this to your hosted web app URL.
    url: 'http://192.168.1.100:3000', // IMPORTANT: Replace with your computer's local IP address
    cleartext: true,
  },
};

export default config;
