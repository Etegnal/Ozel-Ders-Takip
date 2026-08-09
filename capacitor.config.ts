import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ozelders.app',
  appName: 'Coach',
  webDir: 'dist',
  server: {
    url: 'https://etegnal.github.io/Ozel-Ders-Takip/',
    cleartext: true
  }
};

export default config;
