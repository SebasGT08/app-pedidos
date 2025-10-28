import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.pedidos',
  appName: 'app_pedidos',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ["192.168.5.3"]
  }
};

export default config;
