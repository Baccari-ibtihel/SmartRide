import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface GeoLocationPoint {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  region?: string;
}

export interface UserCurrentLocation {
  lat: number;
  lng: number;
  accuracy: number;
  cityName: string;
  displayAddress: string;
  isApproximate?: boolean;
  timestamp: Date;
}

export interface AddressSearchResult {
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private userLocationSubject = new BehaviorSubject<UserCurrentLocation | null>(null);
  userLocation$ = this.userLocationSubject.asObservable();

  // All 24 Tunisian Governorates with exact coordinates
  readonly TUNISIAN_GOVERNORATES: GeoLocationPoint[] = [
    { name: 'Tunis (Centre-Ville)', lat: 36.8008, lng: 10.1800, region: 'Tunis' },
    { name: 'Ariana (Centre / Ghazala)', lat: 36.8663, lng: 10.1647, region: 'Ariana' },
    { name: 'Les Berges du Lac 1 & 2', lat: 36.8392, lng: 10.2372, region: 'Tunis' },
    { name: 'La Marsa / Gammarth', lat: 36.8782, lng: 10.3247, region: 'Tunis' },
    { name: 'Ennasr 1 & 2', lat: 36.8620, lng: 10.1560, region: 'Ariana' },
    { name: 'Carthage / Sidi Bou Saïd', lat: 36.8528, lng: 10.3233, region: 'Tunis' },
    { name: 'Ben Arous (Mourouj / Rades)', lat: 36.7533, lng: 10.2289, region: 'Ben Arous' },
    { name: 'Manouba (Denden / Campus)', lat: 36.8080, lng: 10.0860, region: 'Manouba' },
    { name: 'Bizerte (Centre / Corniche)', lat: 37.2744, lng: 9.8739, region: 'Bizerte' },
    { name: 'Nabeul (Centre / Jarres)', lat: 36.4561, lng: 10.7376, region: 'Nabeul' },
    { name: 'Hammamet (Yasmine / Nord)', lat: 36.4000, lng: 10.6167, region: 'Nabeul' },
    { name: 'Sousse (Sahloul / Khezama)', lat: 35.8256, lng: 10.6084, region: 'Sousse' },
    { name: 'Monastir (Faculté / Marina)', lat: 35.7779, lng: 10.8261, region: 'Monastir' },
    { name: 'Mahdia (Centre / Hiboun)', lat: 35.5047, lng: 11.0622, region: 'Mahdia' },
    { name: 'Sfax (Centre / Route Téniour)', lat: 34.7406, lng: 10.7603, region: 'Sfax' },
    { name: 'Kairouan (Médina / Okba)', lat: 35.6781, lng: 10.0963, region: 'Kairouan' },
    { name: 'Béja (Centre)', lat: 36.7256, lng: 9.1817, region: 'Béja' },
    { name: 'Jendouba (Tabarka)', lat: 36.5011, lng: 8.7802, region: 'Jendouba' },
    { name: 'Le Kef (Centre)', lat: 36.1742, lng: 8.7049, region: 'Le Kef' },
    { name: 'Siliana (Centre)', lat: 36.0847, lng: 9.3708, region: 'Siliana' },
    { name: 'Zaghouan (Centre)', lat: 36.4029, lng: 10.1429, region: 'Zaghouan' },
    { name: 'Gabès (Centre / Chenini)', lat: 33.8815, lng: 10.0982, region: 'Gabès' },
    { name: 'Médenine (Djerba / Zarzis)', lat: 33.3549, lng: 10.5055, region: 'Médenine' },
    { name: 'Gafsa (Centre)', lat: 34.4250, lng: 8.7842, region: 'Gafsa' },
    { name: 'Tozeur (Palmeraie)', lat: 33.9197, lng: 8.1335, region: 'Tozeur' },
    { name: 'Kasserine (Centre)', lat: 35.1676, lng: 8.8365, region: 'Kasserine' },
    { name: 'Sidi Bouzid (Centre)', lat: 35.0382, lng: 9.4849, region: 'Sidi Bouzid' },
    { name: 'Tataouine (Centre)', lat: 32.9297, lng: 10.4518, region: 'Tataouine' },
    { name: 'Kébili (Douz)', lat: 33.7044, lng: 8.9690, region: 'Kébili' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Request real-time GPS Geolocation from the browser with real OpenStreetMap Reverse Geocoding
   */
  async requestLiveLocation(): Promise<UserCurrentLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const fallback = this.createFallbackLocation();
        this.userLocationSubject.next(fallback);
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          // Real OpenStreetMap Reverse Geocode to get real street/city
          let realName = await this.reverseGeocode(lat, lng);
          if (!realName) {
            const nearest = this.findNearestHub(lat, lng);
            realName = nearest.name;
          }

          const location: UserCurrentLocation = {
            lat,
            lng,
            accuracy,
            cityName: realName,
            displayAddress: `${realName} (Précision GPS: ~${accuracy}m)`,
            isApproximate: accuracy > 200,
            timestamp: new Date()
          };

          this.userLocationSubject.next(location);
          resolve(location);
        },
        (error) => {
          console.warn('Erreur géolocalisation navigateur:', error.message);
          const fallback = this.createFallbackLocation();
          this.userLocationSubject.next(fallback);
          resolve(fallback);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0 // Do not use stale cache
        }
      );
    });
  }

  /**
   * Real OpenStreetMap Reverse Geocoding: takes (lat, lng) and returns real street/city in Tunisia
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr,ar' } });
      const data = await res.json();

      if (data && data.address) {
        const a = data.address;
        const parts: string[] = [];
        
        // Priority 1: Road / Street
        if (a.road) parts.push(a.road);
        else if (a.pedestrian) parts.push(a.pedestrian);

        // Priority 2: Suburb / District / Neighborhood
        if (a.suburb) parts.push(a.suburb);
        else if (a.neighbourhood) parts.push(a.neighbourhood);
        else if (a.residential) parts.push(a.residential);

        // Priority 3: City / Municipality / Governorate
        if (a.city) parts.push(a.city);
        else if (a.town) parts.push(a.town);
        else if (a.village) parts.push(a.village);
        else if (a.state) parts.push(a.state);

        if (parts.length > 0) {
          return parts.slice(0, 3).join(', ');
        }
        if (data.display_name) {
          return data.display_name.split(',').slice(0, 3).join(',');
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode offline, fallback to nearest Tunisian hub');
    }
    return this.findNearestHub(lat, lng).name;
  }

  /**
   * Search places in Tunisia with OpenStreetMap Nominatim
   */
  async searchPlaces(query: string): Promise<AddressSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const encoded = encodeURIComponent(query.trim());
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=tn&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr,ar' } });
      const items = await res.json();

      if (Array.isArray(items) && items.length > 0) {
        return items.map((item: any) => ({
          displayName: item.display_name,
          shortName: item.display_name.split(',').slice(0, 2).join(',').trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
      }
    } catch (e) {
      console.warn('Nominatim search failed, using local governorates list');
    }

    // Local fallback search in Tunisian governorates
    const q = query.toLowerCase();
    return this.TUNISIAN_GOVERNORATES
      .filter(h => h.name.toLowerCase().includes(q) || h.region?.toLowerCase().includes(q))
      .map(h => ({
        displayName: `${h.name}, Tunisie`,
        shortName: h.name,
        lat: h.lat,
        lng: h.lng
      }));
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula (in km)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Estimate travel duration
   */
  estimateDuration(distanceKm: number): string {
    const minutes = Math.round((distanceKm / 55) * 60) + 5;
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins > 0 ? remainingMins + 'min' : ''}`;
  }

  findNearestHub(lat: number, lng: number): GeoLocationPoint {
    let nearest = this.TUNISIAN_GOVERNORATES[0];
    let minDistance = Infinity;

    for (const hub of this.TUNISIAN_GOVERNORATES) {
      const d = this.calculateDistance(lat, lng, hub.lat, hub.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = hub;
      }
    }
    return nearest;
  }

  private createFallbackLocation(): UserCurrentLocation {
    const defaultHub = this.TUNISIAN_GOVERNORATES[0]; // Tunis
    return {
      lat: defaultHub.lat,
      lng: defaultHub.lng,
      accuracy: 50,
      cityName: defaultHub.name,
      displayAddress: `${defaultHub.name} (Position par défaut)`,
      isApproximate: true,
      timestamp: new Date()
    };
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
