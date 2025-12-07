import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dz.vet.vetdz',
  appName: 'VetDz',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  // Deep linking configuration for OAuth
  server: {
    androidScheme: 'https',
    hostname: 'vetdz.app'
  }
};

export default config;
