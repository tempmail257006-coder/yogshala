import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sabari.yogshala',
  appName: 'YOGSHALA',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
      skipNativeAuth: true
    }
  }
};

export default config;
