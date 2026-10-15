import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Share2, PlusSquare, Copy, Check, ExternalLink, QrCode, WifiOff } from 'lucide-react';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-edrzsoqbex74b7bs5zb3xn-36196351191.asia-southeast1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=1&data=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-1.5">
        {/* If native PWA prompt is ready on Chromium/Android */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Install VoxShield directly on your device"
          >
            <Download className="w-3.5 h-3.5 text-pink-600" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Universal "Open on Phone" button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          title="Open VoxShield on your Phone & Use Offline"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Open on Phone</span>
        </button>
      </div>

      {/* MODAL: Open on Phone & Offline Setup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-pink-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Open on Your Phone</h3>
                  <p className="text-[11px] text-gray-500">Run VoxShield natively with offline safety</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct URL Box */}
            <div className="bg-pink-50/70 border border-pink-200/80 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-pink-900 uppercase tracking-wider block">
                Website Link for Mobile Browser:
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full text-xs font-mono bg-white border border-pink-200 rounded-xl px-3 py-2 text-gray-800 select-all outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Quick Scan */}
            <div className="flex items-center space-x-4 bg-gray-50 border border-gray-200 p-3.5 rounded-2xl">
              <div className="w-24 h-24 bg-white p-1 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  src={qrCodeUrl}
                  alt="Scan QR code to open VoxShield on mobile"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="font-bold text-gray-900 flex items-center space-x-1">
                  <QrCode className="w-3.5 h-3.5 text-pink-600" />
                  <span>Scan with Phone Camera</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Open your phone's camera or Google Lens and scan this code to launch VoxShield immediately on your mobile browser.
                </p>
              </div>
            </div>

            {/* How to Work Without Internet (Offline PWA) */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                <WifiOff className="w-4 h-4 text-emerald-600" />
                <span>How to Make It Work Without Internet:</span>
              </div>
              
              <div className="text-[11px] text-emerald-900 space-y-2 leading-relaxed">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <strong className="text-gray-900">1. On Android (Chrome / Edge / Samsung Internet):</strong>
                  <p className="text-gray-600 mt-0.5">
                    Open link → tap <strong>⋮ (Menu)</strong> → tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.
                  </p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <strong className="text-gray-900">2. On iPhone (Safari):</strong>
                  <p className="text-gray-600 mt-0.5">
                    Open link in Safari → tap <strong>Share</strong> (box with arrow) → tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-emerald-100/60 text-emerald-950 font-medium text-[11px]">
                  ⚡ <strong>Offline Guarantee:</strong> Once added to your home screen, the Progressive Web App (PWA) caches the full code. You can turn off Wi-Fi and mobile data — the secret phrase engine, offline SMS trigger, and local emergency alerts will continue to work!
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
