export type GuardianState = 
  | 'SAFE'
  | 'MONITORING'
  | 'TRIGGER_DETECTED'
  | 'CHECK_IN'
  | 'USER_SAFE'
  | 'HELP_REQUESTED'
  | 'TIMEOUT'
  | 'HIGH_RISK'
  | 'ALERTING'
  | 'ACTIVE_EMERGENCY'
  | 'RESOLVED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  language: string;
  secretPhrase: string;
  secretPhraseEnabled: boolean;
  voiceDetectionEnabled: boolean;
  bluetoothEnabled: boolean;
  locationEnabled: boolean;
  checkinTimeoutSeconds: number;
  riskThreshold: number;
  batteryLevel: number;
  networkStatus: 'ONLINE' | 'OFFLINE' | 'CELLULAR_SMS';
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: 'Parent' | 'Partner' | 'Sibling' | 'Friend' | 'Guardian' | 'Campus Security' | 'Other';
  priority: 1 | 2 | 3; // 1: Primary, 2: Secondary, 3: Emergency
  verified: boolean;
  avatarColor?: string;
}

export interface EmergencyEvent {
  id: string;
  user_id: string;
  event_type: string;
  risk_level: RiskLevel;
  risk_score: number;
  reasons: string[];
  timestamp: string;
  latitude: number;
  longitude: number;
  location_accuracy: number;
  address?: string;
  status: 'PENDING_CHECKIN' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  sms_status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  ble_relay_count: number;
  battery_percentage: number;
  map_link: string;
}

export interface LocationRecord {
  id: string;
  user_id: string;
  event_id?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  timestamp: string;
  is_live: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string;
  event: string;
  details: string;
  timestamp: string;
}

export interface BleBeaconEvent {
  id: string;
  beacon_id: string;
  rssi: number;
  detected_at: string;
  relayed: boolean;
}

export interface DemoStep {
  stepNumber: number;
  title: string;
  description: string;
  actionType: string;
  expectedState: GuardianState;
  riskScore: number;
}

export interface SmsDispatchRecord {
  id: string;
  eventId: string;
  recipientName: string;
  recipientPhone: string;
  senderName: string;
  senderPhone: string;
  triggerType: string;
  message: string;
  mapLink: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  batteryLevel: number;
  status: 'DELIVERED' | 'SENT' | 'QUEUED';
  gateway: string;
  carrier: string;
  timestamp: string;
  deliveredAt: string;
  direction: 'OUTBOUND_TO_PARENT' | 'INBOUND_FROM_PARENT';
}

