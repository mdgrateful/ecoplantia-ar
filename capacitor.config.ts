import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoplantia.designer',
  appName: 'Ecoplantia',
  webDir: 'out', // Next.js static export directory
  server: {
    // For development, comment out url to use local build
    // For production, point to live website
    // url: 'https://ecoplantia.com',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1B9E31',
      showSpinner: false,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Ecoplantia',
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true
  }
};

export default config;
