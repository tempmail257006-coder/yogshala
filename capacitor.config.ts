import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sabari.yogshala',
  appName: 'yogshala',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
