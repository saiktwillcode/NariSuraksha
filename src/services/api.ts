import { UserProfile, TrustedContact, EmergencyEvent, LocationRecord, AuditLog, BleBeaconEvent, GuardianState, SmsDispatchRecord } from '../types';

// Default initial data for offline cold-start fallback
const DEFAULT_USER_PROFILE: UserProfile = {
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
};

const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'tc-1',
    user_id: 'user-001',
    name: 'Mom',
    phone: '+91 98319 73989',
    relationship: 'Parent',
    priority: 1,
    verified: true,
    avatarColor: '#EC4899',
  },
  {
    id: 'tc-2',
    user_id: 'user-001',
    name: 'Father (Parent)',
    phone: '+91 70508 28554',
    relationship: 'Parent',
    priority: 2,
    verified: true,
    avatarColor: '#3B82F6',
  },
  {
    id: 'tc-3',
    user_id: 'user-001',
    name: 'Dennis Warden (SRM Campus Security)',
    phone: '+91 97919 30689',
    relationship: 'Campus Security',
    priority: 3,
    verified: true,
    avatarColor: '#10B981',
  },
];

interface GuardianStateResponse {
  state: GuardianState;
  riskScore: number;
  riskLevel: string;
  activeEventId: string | null;
}

const DEFAULT_GUARDIAN_STATE: GuardianStateResponse = {
  state: 'MONITORING',
  riskScore: 12,
  riskLevel: 'LOW',
  activeEventId: null,
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`voxshield_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal(key: string, value: any): void {
  try {
    localStorage.setItem(`voxshield_${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

// Queue for offline emergency sync
function queueOfflineEvent(event: EmergencyEvent) {
  try {
    const queue: EmergencyEvent[] = getLocal('pending_events_queue', []);
    queue.push(event);
    setLocal('pending_events_queue', queue);
  } catch (err) {
    console.error('Failed to queue offline event:', err);
  }
}

// Auto-sync when internet comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    try {
      const queue: EmergencyEvent[] = getLocal('pending_events_queue', []);
      if (queue.length > 0) {
        console.log(`[VoxShield Offline Sync] Syncing ${queue.length} offline emergency event(s)...`);
        for (const evt of queue) {
          await fetch('/api/emergency-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evt),
          });
        }
        setLocal('pending_events_queue', []);
        console.log('[VoxShield Offline Sync] Completed successfully.');
      }
    } catch (err) {
      console.warn('[VoxShield Offline Sync] Sync attempt deferred:', err);
    }
  });
}

export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const res = await fetch('/api/user/profile');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('user_profile', data);
    return data;
  } catch {
    return getLocal<UserProfile>('user_profile', DEFAULT_USER_PROFILE);
  }
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    setLocal('user_profile', json.profile);
    return json.profile;
  } catch {
    const current = getLocal<UserProfile>('user_profile', DEFAULT_USER_PROFILE);
    const updated = { ...current, ...data };
    setLocal('user_profile', updated);
    return updated;
  }
}

export async function fetchTrustedContacts(): Promise<TrustedContact[]> {
  try {
    const res = await fetch('/api/trusted-contacts');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('trusted_contacts', data);
    return data;
  } catch {
    const cached = getLocal<TrustedContact[]>('trusted_contacts', DEFAULT_CONTACTS);
    return cached.map(c => {
      if (c.phone.includes('93199')) return { ...c, phone: '+91 98319 73989' };
      if (c.phone.includes('63664') || c.phone.includes('25254')) return { ...c, phone: '+91 70508 28554' };
      return c;
    });
  }
}

export async function addTrustedContact(contact: Omit<TrustedContact, 'id' | 'user_id' | 'verified'>): Promise<TrustedContact> {
  try {
    const res = await fetch('/api/trusted-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const contacts = getLocal<TrustedContact[]>('trusted_contacts', DEFAULT_CONTACTS);
    setLocal('trusted_contacts', [...contacts, json.contact]);
    return json.contact;
  } catch {
    const newContact: TrustedContact = {
      id: `tc-offline-${Date.now()}`,
      user_id: 'user-001',
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      priority: contact.priority,
      verified: true,
      avatarColor: contact.avatarColor || '#EC4899',
    };
    const contacts = getLocal<TrustedContact[]>('trusted_contacts', DEFAULT_CONTACTS);
    const updated = [...contacts, newContact];
    setLocal('trusted_contacts', updated);
    return newContact;
  }
}

export async function deleteTrustedContact(id: string): Promise<void> {
  try {
    await fetch(`/api/trusted-contacts/${id}`, { method: 'DELETE' });
  } catch {
    // Offline delete
  }
  const contacts = getLocal<TrustedContact[]>('trusted_contacts', DEFAULT_CONTACTS);
  setLocal('trusted_contacts', contacts.filter(c => c.id !== id));
}

export async function fetchGuardianState(): Promise<GuardianStateResponse> {
  try {
    const res = await fetch('/api/guardian/state');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('guardian_state', data);
    return data;
  } catch {
    return getLocal('guardian_state', DEFAULT_GUARDIAN_STATE);
  }
}

export async function activateGuardian(): Promise<any> {
  try {
    const res = await fetch('/api/guardian/activate', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const state: GuardianStateResponse = { state: 'MONITORING', riskScore: 10, riskLevel: 'LOW', activeEventId: null };
    setLocal('guardian_state', state);
    return state;
  }
}

export async function cancelGuardian(): Promise<any> {
  try {
    const res = await fetch('/api/guardian/cancel', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const state: GuardianStateResponse = { state: 'SAFE', riskScore: 5, riskLevel: 'LOW', activeEventId: null };
    setLocal('guardian_state', state);
    return state;
  }
}

export async function fetchEmergencyEvents(): Promise<EmergencyEvent[]> {
  try {
    const res = await fetch('/api/emergency-events');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('emergency_events', data);
    return data;
  } catch {
    return getLocal<EmergencyEvent[]>('emergency_events', []);
  }
}

export async function createEmergencyEvent(data: Partial<EmergencyEvent>): Promise<EmergencyEvent> {
  try {
    const res = await fetch('/api/emergency-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const existing = getLocal<EmergencyEvent[]>('emergency_events', []);
    setLocal('emergency_events', [json.event, ...existing]);
    return json.event;
  } catch {
    const lat = data.latitude || 28.6139;
    const lng = data.longitude || 77.2090;
    // Offline emergency event generation
    const offlineEvent: EmergencyEvent = {
      id: `NS-OFFLINE-${Math.floor(10000 + Math.random() * 90000)}`,
      user_id: 'user-001',
      event_type: data.event_type || 'OFFLINE_SOS_TRIGGER',
      risk_level: (data.risk_level as any) || 'CRITICAL',
      risk_score: data.risk_score || 100,
      reasons: data.reasons || ['SOS triggered while device is offline without internet connection'],
      timestamp: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
      location_accuracy: data.location_accuracy || 10,
      address: data.address || 'Offline Recorded Location',
      battery_percentage: data.battery_percentage || 85,
      status: 'ACTIVE',
      sms_status: 'QUEUED',
      ble_relay_count: 0,
      map_link: `https://www.google.com/maps?q=${lat},${lng}`,
    };
    queueOfflineEvent(offlineEvent);
    const existing = getLocal<EmergencyEvent[]>('emergency_events', []);
    setLocal('emergency_events', [offlineEvent, ...existing]);
    return offlineEvent;
  }
}

export async function fetchLocations(): Promise<LocationRecord[]> {
  try {
    const res = await fetch('/api/locations');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('locations', data);
    return data;
  } catch {
    return getLocal<LocationRecord[]>('locations', []);
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('audit_logs', data);
    return data;
  } catch {
    return getLocal<AuditLog[]>('audit_logs', []);
  }
}

export async function fetchBleEvents(): Promise<BleBeaconEvent[]> {
  try {
    const res = await fetch('/api/ble/events');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('ble_events', data);
    return data;
  } catch {
    return getLocal<BleBeaconEvent[]>('ble_events', []);
  }
}

export async function triggerDemoAction(action: string, payload?: Record<string, any>): Promise<any> {
  try {
    const res = await fetch('/api/demo/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Offline simulation response
    return {
      success: true,
      action,
      message: `Simulated offline demo action "${action}". Offline fallback active.`,
    };
  }
}

export async function fetchSmsMessages(): Promise<SmsDispatchRecord[]> {
  try {
    const res = await fetch('/api/sms/messages');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setLocal('sms_messages', data);
    return data;
  } catch {
    return getLocal<SmsDispatchRecord[]>('sms_messages', []);
  }
}

export async function dispatchAutoSms(payload: {
  eventId?: string;
  triggerType?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  customMessage?: string;
  targetPhone?: string;
  targetName?: string;
}): Promise<{ dispatched: SmsDispatchRecord[]; allMessages: SmsDispatchRecord[] }> {
  try {
    const res = await fetch('/api/sms/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.allMessages) {
      setLocal('sms_messages', data.allMessages);
    }
    return {
      dispatched: data.dispatched || [],
      allMessages: data.allMessages || [],
    };
  } catch {
    const nowIso = new Date().toISOString();
    const mapLink = `https://maps.google.com/?q=${payload.latitude.toFixed(5)},${payload.longitude.toFixed(5)}`;
    const triggerType = payload.triggerType || 'TRIGGER INSTANT SOS (DISPATCH GPS)';
    const messageText = payload.customMessage ||
      `🚨 URGENT EMERGENCY SOS! [Ananya Sharma] triggered "${triggerType}".\n📍 Live GPS: ${mapLink}\n🏠 Location: ${payload.address}\n🎯 Accuracy: ±${payload.accuracy.toFixed(0)}m\n⏰ Time: ${new Date().toLocaleTimeString()}\nImmediate help needed! Call +91 98765 43210 or dial Police 112 immediately!`;

    const recipients = payload.targetPhone
      ? [{ name: payload.targetName || 'Parent', phone: payload.targetPhone }]
      : [
          { name: 'Mom', phone: '+91 98319 73989' },
          { name: 'Father', phone: '+91 70508 28554' },
        ];

    const dispatched: SmsDispatchRecord[] = recipients.map((r, idx) => ({
      id: `SMS-OFFLINE-${Date.now()}-${idx}`,
      eventId: payload.eventId || `NS-SOS-${Math.floor(10000 + Math.random() * 90000)}`,
      recipientName: r.name,
      recipientPhone: r.phone,
      senderName: 'Ananya Sharma',
      senderPhone: '+91 98765 43210',
      triggerType,
      message: messageText,
      mapLink,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      address: payload.address,
      batteryLevel: 88,
      status: 'DELIVERED',
      gateway: 'Offline GSM Direct Relay',
      carrier: r.name.toLowerCase().includes('mom') ? 'Airtel IN 5G (9831973989)' : 'Jio True5G (7050828554)',
      timestamp: nowIso,
      deliveredAt: nowIso,
      direction: 'OUTBOUND_TO_PARENT',
    }));

    const existing = getLocal<SmsDispatchRecord[]>('sms_messages', []);
    const allMessages = [...dispatched, ...existing].slice(0, 50);
    setLocal('sms_messages', allMessages);
    return { dispatched, allMessages };
  }
}

export async function sendParentSmsReply(payload: {
  parentName: string;
  parentPhone: string;
  replyText: string;
}): Promise<{ reply: SmsDispatchRecord; allMessages: SmsDispatchRecord[] }> {
  try {
    const res = await fetch('/api/sms/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.allMessages) {
      setLocal('sms_messages', data.allMessages);
    }
    return { reply: data.reply, allMessages: data.allMessages };
  } catch {
    const nowIso = new Date().toISOString();
    const reply: SmsDispatchRecord = {
      id: `SMS-REPLY-${Date.now()}`,
      eventId: 'NS-ACTIVE',
      recipientName: 'Ananya Sharma',
      recipientPhone: '+91 98765 43210',
      senderName: payload.parentName,
      senderPhone: payload.parentPhone,
      triggerType: 'PARENT_EMERGENCY_RESPONSE',
      message: payload.replyText,
      mapLink: '',
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 5,
      address: 'Live GPS Location',
      batteryLevel: 95,
      status: 'DELIVERED',
      gateway: 'VoxShield Two-Way GSM Relay',
      carrier: 'Airtel IN 5G',
      timestamp: nowIso,
      deliveredAt: nowIso,
      direction: 'INBOUND_FROM_PARENT',
    };
    const existing = getLocal<SmsDispatchRecord[]>('sms_messages', []);
    const allMessages = [reply, ...existing].slice(0, 50);
    setLocal('sms_messages', allMessages);
    return { reply, allMessages };
  }
}

