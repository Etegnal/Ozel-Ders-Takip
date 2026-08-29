import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ozelders.app',
  appName: 'KOÇ',
  webDir: 'dist',
  server: {
    url: 'https://koc-one.vercel.app/',
    cleartext: true
  }
};

export default config;
