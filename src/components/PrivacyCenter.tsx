import React from 'react';
import { UserProfile } from '../types';
import { Lock, Mic, MapPin, Bluetooth, Camera, Shield, CheckCircle2, RefreshCw } from 'lucide-react';

interface PrivacyCenterProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export function PrivacyCenter({ userProfile, setUserProfile }: PrivacyCenterProps) {
  const togglePermission = async (key: keyof UserProfile) => {
    const updated = { ...userProfile, [key]: !userProfile[key] };
    setUserProfile(updated);
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: updated[key] }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1 bg-pink-100 text-pink-700 rounded-full">PRIVACY & SECURITY CENTER</span>
          <span className="text-xs text-gray-400 font-mono">Zero Knowledge & Local Inference</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Your Data, Your Control</h1>
        <p className="text-xs text-gray-600 leading-relaxed">
          Nari Surakshya / VoxShield is architected for absolute privacy. Raw audio is processed strictly on-device using local TFLite / YAMNet models and is never uploaded to cloud servers by default.
        </p>
      </div>

      {/* Permissions List */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Device Permissions & Privacy Toggles</h2>

        <div className="space-y-3">
          {[
            {
              key: 'secretPhraseEnabled' as const,
              title: 'On-Device Secret Phrase Listener',
              desc: 'Listens locally for your configured private phrase without cloud audio streaming.',
              icon: Mic,
              active: userProfile.secretPhraseEnabled,
            },
            {
              key: 'voiceDetectionEnabled' as const,
              title: 'Distress Audio / Scream Classifier',
              desc: 'Analyzes 16kHz audio buffers locally for screams and distress words.',
              icon: Shield,
              active: userProfile.voiceDetectionEnabled,
            },
            {
              key: 'locationEnabled' as const,
              title: 'Fused Location Provider',
              desc: 'Accesses GPS coordinates only during active emergency check-ins or user request.',
              icon: MapPin,
              active: userProfile.locationEnabled,
            },
            {
              key: 'bluetoothEnabled' as const,
              title: 'Bluetooth Low Energy (BLE) Beacon',
              desc: 'Broadcasts temporary encrypted emergency identifiers to participating safety network devices.',
              icon: Bluetooth,
              active: userProfile.bluetoothEnabled,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => togglePermission(item.key)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    item.active ? 'bg-pink-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    item.active ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
