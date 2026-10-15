import React, { useState } from 'react';
import { Shield, Smartphone, Monitor, PlayCircle, Lock, BookOpen, AlertTriangle, Bell } from 'lucide-react';
import { GirlNotification } from '../data/notifications';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEmergencyClick: () => void;
  notifications: GirlNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<GirlNotification[]>>;
}

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  onEmergencyClick,
  notifications,
  setNotifications,
}: NavbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('mobile')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
                  NARI SURAKSHYA
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">
                  VOXSHIELD
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">Hear it. Check it. Alert them.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-pink-50/70 p-1 rounded-xl border border-pink-100/60">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-white/50'
              }`}
            >
              <Smartphone className="w-4 h-4 text-pink-600" />
              <span>Android App</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-white/50'
              }`}
            >
              <Monitor className="w-4 h-4 text-pink-600" />
              <span>Web Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-white/50'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-rose-600" />
              <span>Judge Demo Center</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-white/50'
              }`}
            >
              <Lock className="w-4 h-4 text-pink-600" />
              <span>Privacy Center</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-pink-600" />
              <span>Docs & Architecture</span>
            </button>
          </nav>

          {/* Protection Status & Notification Badge */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 border border-pink-200 text-pink-700 shadow-xs hover:bg-pink-100 transition-all cursor-pointer"
              title={`${unreadCount} new alerts from girls in safety circle`}
            >
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-extrabold shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
              <Bell className="w-5 h-5 text-pink-700" />
            </button>

            <button
              onClick={onEmergencyClick}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/25 hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SOS EMERGENCY</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Subbar */}
        <div className="flex lg:hidden overflow-x-auto bg-pink-50/90 border-t border-pink-100 px-2 py-1.5 space-x-1">
          {[
            { id: 'mobile', label: 'App', icon: Smartphone },
            { id: 'dashboard', label: 'Dashboard', icon: Monitor },
            { id: 'demo', label: 'Demo', icon: PlayCircle },
            { id: 'privacy', label: 'Privacy', icon: Lock },
            { id: 'docs', label: 'Docs', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-pink-700 shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Safety Circle Notification Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </>
  );
}
