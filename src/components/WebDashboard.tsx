import React, { useState } from 'react';
import { EmergencyEvent, LocationRecord, AuditLog, TrustedContact, SmsDispatchRecord } from '../types';
import { LiveMap } from './LiveMap';
import { useSystemTime } from '../utils/time';
import { GeolocationData, reverseGeocode, searchLocation, getDeviceLivePosition } from '../services/location';
import { dispatchAutoSms } from '../services/api';
import { 
  Monitor, MapPin, Shield, AlertTriangle, CheckCircle2, Battery, Wifi, 
  Clock, Activity, Users, Search, Navigation, X, Info, Send, ExternalLink, MessageSquare 
} from 'lucide-react';

interface WebDashboardProps {
  emergencyEvents: EmergencyEvent[];
  locations: LocationRecord[];
  auditLogs: AuditLog[];
  trustedContacts: TrustedContact[];
  currentLocation: GeolocationData;
  onUpdateLocation: (loc: GeolocationData) => void;
  onRefreshData: () => void;
  smsMessages?: SmsDispatchRecord[];
}

export function WebDashboard({ 
  emergencyEvents, 
  locations, 
  auditLogs, 
  trustedContacts,
  currentLocation,
  onUpdateLocation,
  onRefreshData,
  smsMessages = [],
}: WebDashboardProps) {
  const activeEvent = emergencyEvents.find(e => e.status === 'ACTIVE') || emergencyEvents[0];
  const { timeString, dateString } = useSystemTime();

  // Location Calibration Modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Map click calibration handler
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    const addr = await reverseGeocode(lat, lng);
    onUpdateLocation({
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      address: addr,
      source: 'manual',
      timestamp: new Date().toISOString(),
    });
    showToast(`📍 Map Pin adjusted: ${addr}`);
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingLocation(true);
    const results = await searchLocation(searchQuery);
    setSearchResults(results);
    setIsSearchingLocation(false);
  };

  const handleSelectSearchedLocation = async (item: { label: string; lat: number; lng: number }) => {
    const addr = await reverseGeocode(item.lat, item.lng);
    onUpdateLocation({
      latitude: item.lat,
      longitude: item.lng,
      accuracy: 10,
      address: addr,
      source: 'manual',
      timestamp: new Date().toISOString(),
    });
    setShowLocationModal(false);
    setSearchQuery('');
    setSearchResults([]);
    showToast(`📍 Location calibrated: ${addr}`);
  };

  const handleDetectBrowserGps = async () => {
    setIsDetectingGps(true);
    try {
      const pos = await getDeviceLivePosition();
      const addr = await reverseGeocode(pos.latitude, pos.longitude);
      onUpdateLocation({
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        address: addr,
        source: pos.accuracy > 500 ? 'network' : 'gps',
        timestamp: new Date().toISOString(),
      });
      setShowLocationModal(false);
      showToast(`📍 Device location detected: ${addr} (±${pos.accuracy.toFixed(0)}m)`);
    } catch (err: any) {
      showToast(`Could not acquire GPS: ${err.message || 'Permission denied'}`);
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleDirectSmsBroadcast = async (contactPhone: string, contactName: string) => {
    const cleanPhone = contactPhone.replace(/[^\d+]/g, '');
    const liveMapUrl = `https://maps.google.com/?q=${currentLocation.latitude.toFixed(5)},${currentLocation.longitude.toFixed(5)}`;
    const smsMessage = `🚨 URGENT EMERGENCY SOS! Live Location: ${liveMapUrl} (${currentLocation.address}). Accuracy: ±${currentLocation.accuracy.toFixed(0)}m. Please assist or contact police 112 immediately!`;

    const androidBridge = (window as any).AndroidSmsBridge || (window as any).Android;
    if (androidBridge && typeof androidBridge.sendEmergencySms === 'function') {
      try {
        androidBridge.sendEmergencySms(cleanPhone, smsMessage);
      } catch (e) {
        console.warn('Native AndroidSmsBridge error:', e);
      }
    }

    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
    const smsUri = isIOS
      ? `sms:/open?addresses=${cleanPhone}&body=${encodeURIComponent(smsMessage)}`
      : `sms:${cleanPhone}?body=${encodeURIComponent(smsMessage)}`;

    try {
      const a = document.createElement('a');
      a.href = smsUri;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 300);
    } catch (e) {
      console.warn('Phone SMS URI trigger notice:', e);
    }

    await dispatchAutoSms({
      triggerType: `Dashboard Instant Dispatch to ${contactName}`,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      address: currentLocation.address,
      customMessage: smsMessage,
      targetPhone: contactPhone,
      targetName: contactName,
    });
    onRefreshData();
    showToast(`📲 Launched phone SMS application for ${contactName} (${contactPhone}) with Live GPS!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl z-50 flex items-center space-x-2">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white rounded-3xl p-6 border border-pink-100 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1 bg-pink-100 text-pink-700 rounded-full">WEB DASHBOARD</span>
            <span className="text-xs text-gray-400 font-mono">System Time: {dateString} • {timeString}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Nari Surakshya Safety Command</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time emergency event tracking, live Leaflet GPS telemetry, and audit history.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 bg-pink-50 border border-pink-200 rounded-2xl flex items-center space-x-2 text-pink-800 text-xs">
            <MapPin className="w-4 h-4 text-pink-600 animate-pulse shrink-0" />
            <div className="truncate max-w-[220px]">
              <div className="font-bold truncate">{currentLocation.address}</div>
              <div className="text-[10px] text-pink-600 font-mono">±{currentLocation.accuracy.toFixed(0)}m • {currentLocation.source.toUpperCase()}</div>
            </div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-2 py-1 bg-pink-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-pink-700 cursor-pointer shrink-0"
            >
              Calibrate
            </button>
          </div>

          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-700 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>SYSTEM HEALTH: 100% SECURE</span>
          </div>
        </div>
      </div>

      {/* Geolocation Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start space-x-3 text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Device Geolocation Accuracy Info: </span>
            <span className="text-amber-800">
              On desktop computers and laptops, browser location is determined via Wi-Fi/ISP routing (often resolving to regional gateways like SRM Ramapuram, Chennai). If this does not match your real physical location, click anywhere on the map or tap <b>Calibrate GPS</b> to set your true location.
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowLocationModal(true)}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs shrink-0 cursor-pointer"
        >
          Set Exact Location
        </button>
      </div>

      {/* Main Grid: Active Emergency / Status & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Emergency Status Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Active Emergency Status</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              activeEvent?.status === 'ACTIVE' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {activeEvent?.status || 'NORMAL'}
            </span>
          </div>

          {activeEvent ? (
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Event ID:</span>
                  <span className="font-mono text-pink-600">{activeEvent.id}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Risk Level:</span>
                  <span className="text-rose-600">{activeEvent.risk_level} ({activeEvent.risk_score}/100)</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Verified Address:</span>
                  <span className="text-gray-900 text-right truncate max-w-[180px] font-medium">
                    {activeEvent.address || currentLocation.address}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Coordinates:</span>
                  <span className="font-mono text-[11px] text-gray-600">
                    {activeEvent.latitude.toFixed(4)}° N, {activeEvent.longitude.toFixed(4)}° E
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>SMS Fallback:</span>
                  <span className="text-emerald-600">{activeEvent.sms_status}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>BLE Mesh Relays:</span>
                  <span className="text-indigo-600">{activeEvent.ble_relay_count} devices</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700">Risk Assessment Reasons:</div>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {activeEvent.reasons?.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-600 mt-1.5 shrink-0"></span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700">Notified Trusted Contacts ({trustedContacts.length}):</div>
                <div className="space-y-2">
                  {trustedContacts.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-xs border border-gray-100">
                      <div>
                        <div className="font-bold text-gray-800">{c.name}</div>
                        <div className="text-[10px] text-gray-500">{c.phone}</div>
                      </div>
                      <button
                        onClick={() => handleDirectSmsBroadcast(c.phone, c.name)}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>SMS Link</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              No active emergency events. Guardian monitoring is active.
            </div>
          )}
        </div>

        {/* Live Leaflet Map & Location Telemetry */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-pink-600" />
              <span>Interactive Leaflet GPS Map & Telemetry</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 font-mono">Accuracy: ±{currentLocation.accuracy.toFixed(1)}m</span>
              <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">
                Click map to reposition
              </span>
            </div>
          </div>

          <div className="relative flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-pink-200">
            <LiveMap 
              latitude={currentLocation.latitude} 
              longitude={currentLocation.longitude} 
              accuracy={currentLocation.accuracy}
              address={currentLocation.address}
              onLocationSelect={handleMapLocationSelect}
            />
          </div>

          <div className="bg-pink-50/80 p-3.5 rounded-2xl border border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <Clock className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="truncate">Live GPS streaming active • {currentLocation.address}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-3 py-1.5 bg-white border border-pink-200 text-pink-700 font-bold rounded-xl shadow-2xs hover:bg-pink-50 cursor-pointer"
              >
                Search / Calibrate
              </button>
              <a
                href={`https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-pink-600 text-white font-bold rounded-xl shadow-xs hover:bg-pink-700 flex items-center space-x-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Logs & System Activity */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
          <Activity className="w-4 h-4 text-pink-600" />
          <span>Audit Logs & State Timeline</span>
        </h2>

        <div className="space-y-2">
          {auditLogs.slice(0, 6).map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-pink-600 shrink-0"></span>
                <div>
                  <span className="font-bold text-gray-900">{log.event}</span>
                  <p className="text-gray-500 text-[11px]">{log.details}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LOCATION CALIBRATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-pink-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-pink-600" />
                <h3 className="font-extrabold text-gray-900 text-base">Calibrate Live GPS Telemetry</h3>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200 text-xs space-y-1">
              <div className="font-bold text-pink-900">Current Location:</div>
              <div className="text-gray-900 font-medium">{currentLocation.address}</div>
              <div className="text-gray-500 font-mono text-[11px]">
                {currentLocation.latitude.toFixed(5)}° N, {currentLocation.longitude.toFixed(5)}° E • ±{currentLocation.accuracy.toFixed(0)}m
              </div>
            </div>

            {/* Re-detect Device GPS Button */}
            <button
              onClick={handleDetectBrowserGps}
              disabled={isDetectingGps}
              className="w-full py-2.5 bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Querying device GPS...' : 'Re-detect Device Browser GPS'}</span>
            </button>

            {/* Search Location Input Form */}
            <form onSubmit={handleSearchLocation} className="space-y-2">
              <div className="text-xs font-bold text-gray-800">Search City, Campus, or Exact Address:</div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Salt Lake Kolkata, Connaught Place Delhi, Anna Nagar Chennai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={isSearchingLocation}
                  className="px-4 py-2 bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-pink-700 cursor-pointer"
                >
                  {isSearchingLocation ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-100 rounded-xl p-1.5">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchedLocation(res)}
                    className="w-full text-left p-2.5 hover:bg-pink-50 rounded-xl text-xs text-gray-700 flex items-start space-x-2 cursor-pointer transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <span className="truncate">{res.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-500">Quick City Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Kolkata, WB', lat: 22.5726, lng: 88.3639 },
                  { name: 'New Delhi, NCR', lat: 28.6139, lng: 77.2090 },
                  { name: 'Bengaluru, KA', lat: 12.9716, lng: 77.5946 },
                  { name: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
                  { name: 'SRM Ramapuram', lat: 13.0324, lng: 80.1804 },
                  { name: 'Mumbai, MH', lat: 19.0760, lng: 72.8777 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectSearchedLocation({ label: preset.name, lat: preset.lat, lng: preset.lng })}
                    className="px-3 py-1 bg-gray-100 hover:bg-pink-100 text-gray-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
