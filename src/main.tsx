import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline functionality & home screen caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('VoxShield update available');
  },
  onOfflineReady() {
    console.log('VoxShield is ready for offline operation');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
