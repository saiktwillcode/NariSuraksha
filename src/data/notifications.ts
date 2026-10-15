export interface GirlNotification {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  role: 'Sister' | 'Friend' | 'College Peer' | 'Safety Circle' | 'Hostel Mate';
  type: 'SAFE_ARRIVAL' | 'ROUTE_SHARE' | 'CHECK_IN' | 'RESOLVED_ALERT' | 'BLE_MESH';
  message: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  read: boolean;
  batteryLevel?: number;
}

export const initialGirlNotifications: GirlNotification[] = [
  {
    id: 'notif-1',
    name: 'Priya Sharma',
    avatar: 'PS',
    avatarColor: 'bg-pink-600',
    role: 'Sister',
    type: 'SAFE_ARRIVAL',
    message: 'Checked in safely at SRM Girls Hostel Block 3 via Metro feeder bus.',
    location: 'SRM Ramapuram Campus, Chennai',
    coordinates: { lat: 13.0324, lng: 80.1804 },
    timestamp: '4m ago',
    read: false,
    batteryLevel: 94,
  },
  {
    id: 'notif-2',
    name: 'Sneha Roy',
    avatar: 'SR',
    avatarColor: 'bg-purple-600',
    role: 'Safety Circle',
    type: 'ROUTE_SHARE',
    message: 'Walking home from Central Library. Live route sharing active for next 20 mins.',
    location: 'Near DLF IT Park Road',
    coordinates: { lat: 13.0298, lng: 80.1742 },
    timestamp: '12m ago',
    read: false,
    batteryLevel: 78,
  },
  {
    id: 'notif-3',
    name: 'Riya Sen',
    avatar: 'RS',
    avatarColor: 'bg-emerald-600',
    role: 'Hostel Mate',
    type: 'CHECK_IN',
    message: 'Completed scheduled 22:00 PM safety streak check-in. Guardian monitoring enabled.',
    location: 'College Avenue, Block A',
    coordinates: { lat: 13.0341, lng: 80.1821 },
    timestamp: '25m ago',
    read: false,
    batteryLevel: 88,
  },
  {
    id: 'notif-4',
    name: 'Ananya Gupta',
    avatar: 'AG',
    avatarColor: 'bg-amber-600',
    role: 'College Peer',
    type: 'RESOLVED_ALERT',
    message: 'False voice trigger cleared with security PIN: "Accidental button press in bag, all safe".',
    location: 'Campus Food Court, Block 2',
    coordinates: { lat: 13.0315, lng: 80.1795 },
    timestamp: '42m ago',
    read: false,
    batteryLevel: 65,
  },
  {
    id: 'notif-5',
    name: 'Kavita Patel',
    avatar: 'KP',
    avatarColor: 'bg-indigo-600',
    role: 'Safety Circle',
    type: 'BLE_MESH',
    message: 'Nearby VoxShield BLE Mesh node connected (Distance ~18m). Peer safety relay linked.',
    location: 'Campus Main Gate / Bus Bay',
    coordinates: { lat: 13.0332, lng: 80.1812 },
    timestamp: '1h ago',
    read: false,
    batteryLevel: 82,
  },
];
