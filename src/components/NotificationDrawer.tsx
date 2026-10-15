import React, { useState } from 'react';
import { GirlNotification, initialGirlNotifications } from '../data/notifications';
import { 
  Bell, CheckCircle2, Navigation, MapPin, Shield, Battery, PhoneCall, 
  Heart, X, Check, Filter, Radio, MessageCircle, ExternalLink 
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: GirlNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<GirlNotification[]>>;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  setNotifications,
}: NotificationDrawerProps) {
  const [filter, setFilter] = useState<'ALL' | 'ARRIVAL' | 'ROUTE' | 'CHECK_IN'>('ALL');
  const [reactedId, setReactedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSendReaction = (id: string) => {
    setReactedId(id);
    setTimeout(() => setReactedId(null), 2500);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ARRIVAL') return n.type === 'SAFE_ARRIVAL';
    if (filter === 'ROUTE') return n.type === 'ROUTE_SHARE';
    if (filter === 'CHECK_IN') return n.type === 'CHECK_IN';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <div className="relative w-full sm:max-w-md bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl border border-pink-100 flex flex-col max-h-[85vh] sm:mt-14 z-10 overflow-hidden animate-in slide-in-from-top-4 sm:slide-in-from-right-4 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">Safety Circle Updates</h3>
              <p className="text-[11px] text-pink-100">Live check-ins & pings from girls in your circle</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-pink-50/70 border-b border-pink-100 flex items-center space-x-1.5 overflow-x-auto text-xs shrink-0">
          {[
            { id: 'ALL', label: `All (${notifications.length})` },
            { id: 'ARRIVAL', label: 'Safe Arrivals' },
            { id: 'ROUTE', label: 'Live Routes' },
            { id: 'CHECK_IN', label: 'Check-ins' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-pink-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No notifications in this category.
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleMarkSingleRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 cursor-pointer ${
                  notif.read
                    ? 'bg-white border-pink-50 hover:border-pink-200'
                    : 'bg-pink-50/50 border-pink-200 shadow-2xs hover:bg-pink-50'
                }`}
              >
                {/* Top Row: Avatar, Name, Role, Timestamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl ${notif.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                      {notif.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-900 text-xs">{notif.name}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-pink-700 font-semibold">{notif.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                    {notif.batteryLevel && (
                      <span className="flex items-center space-x-0.5 text-gray-500 font-mono">
                        <Battery className="w-3 h-3 text-emerald-600" />
                        <span>{notif.batteryLevel}%</span>
                      </span>
                    )}
                    <span>{notif.timestamp}</span>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-gray-700 font-normal leading-relaxed pl-10">
                  {notif.message}
                </p>

                {/* Location Chip */}
                <div className="flex items-center justify-between pl-10 text-[11px] text-gray-500">
                  <div className="flex items-center space-x-1 text-pink-900/80 truncate max-w-[220px]">
                    <MapPin className="w-3 h-3 text-pink-600 shrink-0" />
                    <span className="truncate">{notif.location}</span>
                  </div>

                  {/* Type Badge */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    notif.type === 'SAFE_ARRIVAL'
                      ? 'bg-emerald-100 text-emerald-800'
                      : notif.type === 'ROUTE_SHARE'
                      ? 'bg-purple-100 text-purple-800'
                      : notif.type === 'RESOLVED_ALERT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {notif.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Interactive Action Bar */}
                <div className="pl-10 pt-1.5 flex items-center justify-between border-t border-pink-100/60">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendReaction(notif.id);
                      }}
                      className="px-2.5 py-1 bg-pink-100/70 hover:bg-pink-200 text-pink-700 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-3 h-3 ${reactedId === notif.id ? 'fill-pink-600 text-pink-600 scale-125' : ''} transition-transform`} />
                      <span>{reactedId === notif.id ? 'Sent "Stay Safe" ❤️' : 'Send Reassurance'}</span>
                    </button>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${notif.coordinates.lat},${notif.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-pink-600 hover:text-pink-800 font-bold flex items-center space-x-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-pink-50/50 border-t border-pink-100 text-center text-[10px] text-gray-500 shrink-0">
          Encrypted peer mesh • Updates sync in real-time across your safety circle
        </div>

      </div>
    </div>
  );
}
