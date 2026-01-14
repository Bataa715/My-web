import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.personalweb.portfolio',
  appName: 'PersonalWeb',
  webDir: 'public', // Fallback for offline assets
  server: {
    // Production URL - your deployed website
    url: 'https://myapp-rust-seven.vercel.app',
    androidScheme: 'https',
    // For local development, comment above and uncomment below:
    // url: 'http://192.168.1.X:9002',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
  },
};

export default config;
