import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2.5 rounded-2xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom duration-300">
      <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
      <div>
        <span>Offline Mode Active</span>
        <span className="block text-[10px] font-medium text-amber-100">
          Cached PWA running • SMS & on-device emergency listeners active
        </span>
      </div>
    </div>
  );
}
