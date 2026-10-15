export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  source: 'gps' | 'network' | 'manual';
  timestamp: string;
}

const STORAGE_KEY = 'voxshield_calibrated_location';

// Reverse geocode coordinates to human-readable address
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'VoxShieldSafetyApp/1.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    if (data && data.display_name) {
      // Create a clean shortened address from components
      const addr = data.address || {};
      const parts = [
        addr.road || addr.suburb || addr.neighbourhood,
        addr.city || addr.town || addr.county || addr.state_district,
        addr.state,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(', ');
    }
  } catch (err) {
    console.warn('Reverse geocoding failed or timed out:', err);
  }
  return `Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

// Search locations by text query (e.g., "Salt Lake, Kolkata" or "SRM University, Chennai")
export async function searchLocation(query: string): Promise<Array<{ label: string; lat: number; lng: number }>> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'VoxShieldSafetyApp/1.0' },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (e) {
    console.error('Location search error:', e);
    return [];
  }
}

// Get stored manual/calibrated location if exists
export function getStoredLocation(): GeolocationData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

// Save calibrated location
export function saveStoredLocation(loc: GeolocationData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch (e) {}
}

// Clear stored calibration
export function clearStoredLocation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

// Acquire browser location using best available accuracy
export function getDeviceLivePosition(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 15,
        });
      },
      (err) => {
        // Retry once with lower accuracy if high precision times out
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 50,
            });
          },
          (err2) => {
            reject(err2);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
