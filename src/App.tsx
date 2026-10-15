import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileSimulator } from './components/MobileSimulator';
import { WebDashboard } from './components/WebDashboard';
import { JudgeDemoCenter } from './components/JudgeDemoCenter';
import { PrivacyCenter } from './components/PrivacyCenter';
import { DocumentationView } from './components/DocumentationView';
import { UserProfile, TrustedContact, EmergencyEvent, LocationRecord, AuditLog, GuardianState, SmsDispatchRecord } from './types';
import { 
  fetchUserProfile, fetchTrustedContacts, fetchGuardianState, 
  fetchEmergencyEvents, fetchLocations, fetchAuditLogs, triggerDemoAction, createEmergencyEvent, fetchSmsMessages 
} from './services/api';
import { 
  GeolocationData, getStoredLocation, saveStoredLocation, getDeviceLivePosition, reverseGeocode 
} from './services/location';
import { GirlNotification, initialGirlNotifications } from './data/notifications';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('mobile');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-001',
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    email: 'ananya.sharma@example.com',
    language: 'English (IN)',
    secretPhrase: 'Mummy, blue dress le aana.',
    secretPhraseEnabled: true,
    voiceDetectionEnabled: true,
    bluetoothEnabled: true,
    locationEnabled: true,
    checkinTimeoutSeconds: 120,
    riskThreshold: 75,
    batteryLevel: 88,
    networkStatus: 'ONLINE',
  });

  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [guardianState, setGuardianState] = useState<any>({
    state: 'MONITORING',
    riskScore: 12,
    riskLevel: 'LOW',
    activeEventId: null,
  });
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [smsMessages, setSmsMessages] = useState<SmsDispatchRecord[]>([]);

  // Safety Circle Notifications from Girls
  const [girlNotifications, setGirlNotifications] = useState<GirlNotification[]>(initialGirlNotifications);

  // Real-time Global Live Location State
  const [currentLocation, setCurrentLocation] = useState<GeolocationData>(() => {
    const saved = getStoredLocation();
    if (saved) return saved;
    return {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 15,
      address: 'Connaught Place, New Delhi',
      source: 'manual',
      timestamp: new Date().toISOString(),
    };
  });

  // Load initial backend data
  const loadData = async () => {
    try {
      const [profileData, contactsData, guardianData, eventsData, locData, logsData, smsData] = await Promise.all([
        fetchUserProfile(),
        fetchTrustedContacts(),
        fetchGuardianState(),
        fetchEmergencyEvents(),
        fetchLocations(),
        fetchAuditLogs(),
        fetchSmsMessages(),
      ]);
      setUserProfile(profileData);
      setTrustedContacts(contactsData);
      setGuardianState(guardianData);
      setEmergencyEvents(eventsData);
      setLocations(locData);
      setAuditLogs(logsData);
      setSmsMessages(smsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-detect browser device location on first load if not manually calibrated
    const saved = getStoredLocation();
    if (!saved) {
      getDeviceLivePosition()
        .then(async (pos) => {
          const addr = await reverseGeocode(pos.latitude, pos.longitude);
          const newLoc: GeolocationData = {
            latitude: pos.latitude,
            longitude: pos.longitude,
            accuracy: pos.accuracy,
            address: addr,
            source: pos.accuracy > 500 ? 'network' : 'gps',
            timestamp: new Date().toISOString(),
          };
          setCurrentLocation(newLoc);
          saveStoredLocation(newLoc);
        })
        .catch((err) => {
          console.warn('Initial device location detection notice:', err.message);
        });
    }
  }, []);

  const handleUpdateLocation = (newLoc: GeolocationData) => {
    setCurrentLocation(newLoc);
    saveStoredLocation(newLoc);
  };

  const handleGlobalEmergencySOS = async () => {
    const momPhone = '+919831973989';
    const fatherPhone = '+917050828554';
    const liveMapUrl = `https://maps.google.com/?q=${currentLocation.latitude.toFixed(5)},${currentLocation.longitude.toFixed(5)}`;
    const urgentMessage = `🚨 URGENT EMERGENCY SOS! [${userProfile.name}] needs immediate help!\n📍 Live GPS: ${liveMapUrl}\n🏠 Location: ${currentLocation.address}\n🎯 Accuracy: ±${currentLocation.accuracy.toFixed(0)}m\n⏰ Time: ${new Date().toLocaleTimeString()}\nZero-Click Auto-Dispatch: Please call or dial Police 112 immediately!`;

    // 1. Direct Server-Side Auto-Dispatch (Zero Clicks Required)
    try {
      await fetch('/api/sms/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: 'Global Emergency SOS Button',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy,
          address: currentLocation.address,
          customMessage: urgentMessage,
        }),
      });
    } catch (e) {
      console.warn('Backend auto-dispatch notice:', e);
    }

    const androidBridge = (window as any).AndroidSmsBridge || (window as any).Android;
    if (androidBridge && typeof androidBridge.sendEmergencySms === 'function') {
      try {
        androidBridge.sendEmergencySms(`${momPhone},${fatherPhone}`, urgentMessage);
      } catch (e) {
        console.warn('Native AndroidSmsBridge error:', e);
      }
    }

    await createEmergencyEvent({
      event_type: 'SOS_BUTTON_TRIGGER',
      risk_level: 'CRITICAL',
      risk_score: 100,
      reasons: [
        'User pressed immediate SOS button',
        'Direct automated SMS dispatched instantly to Mom (+91 98319 73989) & Father (+91 70508 28554) with zero clicks required',
        `Live GPS: ${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)} (${currentLocation.address})`,
      ],
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      location_accuracy: currentLocation.accuracy,
      address: currentLocation.address,
    });
    await loadData();
    setActiveTab('mobile');
  };

  const handleTriggerDemo = async (action: string) => {
    await triggerDemoAction(action, {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      address: currentLocation.address,
    });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#FFF7FA] text-[#24131B] flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEmergencyClick={handleGlobalEmergencySOS}
        notifications={girlNotifications}
        setNotifications={setGirlNotifications}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'mobile' && (
          <MobileSimulator
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            trustedContacts={trustedContacts}
            setTrustedContacts={setTrustedContacts}
            guardianState={guardianState}
            setGuardianState={setGuardianState}
            emergencyEvents={emergencyEvents}
            currentLocation={currentLocation}
            onUpdateLocation={handleUpdateLocation}
            onTriggerDemo={handleTriggerDemo}
            onRefreshData={loadData}
            notifications={girlNotifications}
            setNotifications={setGirlNotifications}
            onNavigateTab={(tab) => setActiveTab(tab)}
            smsMessages={smsMessages}
            setSmsMessages={setSmsMessages}
          />
        )}

        {activeTab === 'dashboard' && (
          <WebDashboard
            emergencyEvents={emergencyEvents}
            locations={locations}
            auditLogs={auditLogs}
            trustedContacts={trustedContacts}
            currentLocation={currentLocation}
            onUpdateLocation={handleUpdateLocation}
            onRefreshData={loadData}
            smsMessages={smsMessages}
          />
        )}

        {activeTab === 'demo' && (
          <JudgeDemoCenter
            onTriggerDemo={handleTriggerDemo}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyCenter
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}

        {activeTab === 'docs' && (
          <DocumentationView />
        )}
      </main>

      {/* Real-time Offline Connectivity Toast Banner */}
      <OfflineIndicator />

    </div>
  );
}
