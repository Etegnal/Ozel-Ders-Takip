import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ozelders.app',
  appName: 'KOÇ',
  webDir: 'dist',
  server: {
    url: 'https://etegnal.github.io/Ozel-Ders-Takip/',
    cleartext: true
  }
};

export default config;
