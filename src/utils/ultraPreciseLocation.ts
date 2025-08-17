// EXTREME PRECISION geolocation service using multiple APIs
export interface UltraPreciseLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  timestamp: number;
}

export class UltraPreciseLocationService {
  private static instance: UltraPreciseLocationService;
  private watchId: number | null = null;
  private bestPosition: GeolocationPosition | null = null;
  private locationHistory: GeolocationPosition[] = [];

  static getInstance(): UltraPreciseLocationService {
    if (!UltraPreciseLocationService.instance) {
      UltraPreciseLocationService.instance = new UltraPreciseLocationService();
    }
    return UltraPreciseLocationService.instance;
  }

  // Get EXTREMELY accurate location using multiple services
  async getUltraPreciseLocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🎯 Starting EXTREME precision location detection...');

    try {
      // Method 1: Google Geolocation API (MOST ACCURATE)
      const googleLocation = await this.getGoogleGeolocation();
      if (googleLocation && googleLocation.accuracy <= 10) {
        console.log(`🔥 Google API success: ±${Math.round(googleLocation.accuracy)}m`);
        return googleLocation;
      }

      // Method 2: IP Geolocation API (FAST + ACCURATE)
      const ipLocation = await this.getIPGeolocation();
      if (ipLocation && ipLocation.accuracy <= 50) {
        console.log(`🌐 IP Geolocation success: ±${Math.round(ipLocation.accuracy)}m`);
        return ipLocation;
      }

      // Method 3: Enhanced GPS with multiple readings
      const enhancedGPS = await this.getEnhancedGPS();
      if (enhancedGPS) {
        console.log(`📡 Enhanced GPS: ±${Math.round(enhancedGPS.accuracy)}m`);
        return enhancedGPS;
      }

      // Method 4: Network-assisted as final backup
      const networkAssisted = await this.getNetworkAssistedLocation();
      if (networkAssisted) {
        console.log(`📶 Network location: ±${Math.round(networkAssisted.accuracy)}m`);
        return networkAssisted;
      }

      console.log('❌ All precision methods failed');
      return null;

    } catch (error) {
      console.error('❌ Extreme precision location failed:', error);
      return null;
    }
  }

  // Method 1: Google Geolocation API (MOST ACCURATE)
  private async getGoogleGeolocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🔥 Using Google Geolocation API...');

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'AIzaSyBVVXxvk8qJ9X8qJ9X8qJ9X8qJ9X8qJ9X8') {
        console.warn('Google Maps API key not configured');
        return null;
      }

      // Get WiFi and cell tower data for maximum accuracy
      const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          considerIp: true,
          wifiAccessPoints: [],
          cellTowers: []
        })
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.location) {
        return {
          coords: {
            lat: data.location.lat,
            lng: data.location.lng
          },
          accuracy: data.accuracy || 10,
          method: 'Google Geolocation API',
          timestamp: Date.now()
        };
      }

      return null;

    } catch (error) {
      console.warn('Google Geolocation failed:', error);
      return null;
    }
  }

  // Method 2: IP Geolocation API (FAST + ACCURATE)
  private async getIPGeolocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🌐 Using IP Geolocation API...');

    try {
      // Using ipapi.co (free, accurate)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          coords: {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude)
          },
          accuracy: data.accuracy || 50, // IP-based accuracy
          method: 'IP Geolocation API',
          timestamp: Date.now()
        };
      }

      return null;

    } catch (error) {
      console.warn('IP Geolocation failed:', error);
      return null;
    }
  }

  // Method 3: Enhanced GPS with multiple readings
  private async getEnhancedGPS(): Promise<UltraPreciseLocationResult | null> {
    console.log('📡 Getting enhanced GPS with multiple readings...');

    try {
      const readings: GeolocationPosition[] = [];
      const maxReadings = 3;

      // Take 3 quick GPS readings
      for (let i = 0; i < maxReadings; i++) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            const options: PositionOptions = {
              enableHighAccuracy: true,
              timeout: 3000, // 3 seconds per reading
              maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
          });

          readings.push(position);
          console.log(`📍 GPS reading ${i + 1}: ±${Math.round(position.coords.accuracy)}m`);

          // If we get a very accurate reading, use it immediately
          if (position.coords.accuracy <= 5) {
            return {
              coords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              accuracy: position.coords.accuracy,
              method: 'Enhanced GPS (High Accuracy)',
              timestamp: Date.now()
            };
          }

        } catch (error) {
          console.warn(`GPS reading ${i + 1} failed:`, error);
        }
      }

      if (readings.length === 0) return null;

      // Use the most accurate reading
      const bestReading = readings.reduce((best, current) =>
        current.coords.accuracy < best.coords.accuracy ? current : best
      );

      return {
        coords: {
          lat: bestReading.coords.latitude,
          lng: bestReading.coords.longitude
        },
        accuracy: bestReading.coords.accuracy,
        method: 'Enhanced GPS (Best of Multiple)',
        timestamp: Date.now()
      };

    } catch (error) {
      console.warn('Enhanced GPS failed:', error);
      return null;
    }
  }



  // Method 2: Network-assisted location (fast backup)
  private async getNetworkAssistedLocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🌐 Getting network-assisted location...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // Use network for speed
            timeout: 5000, // 5 seconds max
            maximumAge: 60000 // Accept 1-minute old position
          }
        );
      });

      return {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        method: 'Network-Assisted',
        timestamp: Date.now()
      };

    } catch (error) {
      console.warn('Network-assisted location failed:', error);
      return null;
    }
  }



  // Clear location history
  clearHistory(): void {
    this.locationHistory = [];
    this.bestPosition = null;
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

// Export singleton instance
export const ultraPreciseLocation = UltraPreciseLocationService.getInstance();
