// 🔥 EXTREME ACCURACY LOCATION SERVICE
// Uses multiple APIs and methods for house-level precision

export interface ExtremeLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  timestamp: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class ExtremeLocationService {
  private static instance: ExtremeLocationService;

  static getInstance(): ExtremeLocationService {
    if (!ExtremeLocationService.instance) {
      ExtremeLocationService.instance = new ExtremeLocationService();
    }
    return ExtremeLocationService.instance;
  }

  // 🎯 MAIN METHOD: Get house-level accuracy
  async getHouseLevelLocation(): Promise<ExtremeLocationResult | null> {
    console.log('🔥 EXTREME LOCATION: Starting house-level precision detection...');

    const results = await Promise.allSettled([
      this.getGooglePrecisionLocation(),
      this.getHTML5HighAccuracy(),
      this.getIPLocationAPI(),
      this.getBrowserLocationAPI()
    ]);

    const validResults: ExtremeLocationResult[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        validResults.push(result.value);
        console.log(`✅ Method ${index + 1} success: ±${Math.round(result.value.accuracy)}m`);
      }
    });

    if (validResults.length === 0) {
      console.log('❌ All extreme location methods failed');
      return null;
    }

    // Find the most accurate result
    const bestResult = validResults.reduce((best, current) => 
      current.accuracy < best.accuracy ? current : best
    );

    console.log(`🎯 BEST RESULT: ${bestResult.method} - ±${Math.round(bestResult.accuracy)}m`);
    return bestResult;
  }

  // Method 1: Google Geolocation API (MOST ACCURATE)
  private async getGooglePrecisionLocation(): Promise<ExtremeLocationResult | null> {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey.includes('AIzaSyBVVXxvk8qJ9X8qJ9X8qJ9X8qJ9X8qJ9X8')) {
        return null;
      }

      const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          considerIp: true,
          wifiAccessPoints: [],
          cellTowers: []
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.location) return null;

      return {
        coords: {
          lat: data.location.lat,
          lng: data.location.lng
        },
        accuracy: data.accuracy || 10,
        method: 'Google Geolocation API',
        timestamp: Date.now(),
        confidence: data.accuracy <= 10 ? 'HIGH' : data.accuracy <= 50 ? 'MEDIUM' : 'LOW'
      };

    } catch (error) {
      console.warn('Google Geolocation failed:', error);
      return null;
    }
  }

  // Method 2: HTML5 High Accuracy GPS
  private async getHTML5HighAccuracy(): Promise<ExtremeLocationResult | null> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds for maximum accuracy
          maximumAge: 0 // Force fresh reading
        };

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      return {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        method: 'HTML5 High-Accuracy GPS',
        timestamp: Date.now(),
        confidence: position.coords.accuracy <= 5 ? 'HIGH' : position.coords.accuracy <= 20 ? 'MEDIUM' : 'LOW'
      };

    } catch (error) {
      console.warn('HTML5 GPS failed:', error);
      return null;
    }
  }

  // Method 3: IP Location API (Fast + Accurate)
  private async getIPLocationAPI(): Promise<ExtremeLocationResult | null> {
    try {
      // Try multiple IP location services
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();

          let lat, lng, accuracy = 100;

          if (service.includes('ipapi.co')) {
            lat = parseFloat(data.latitude);
            lng = parseFloat(data.longitude);
            accuracy = data.accuracy || 100;
          } else if (service.includes('ip-api.com')) {
            lat = data.lat;
            lng = data.lon;
            accuracy = 50; // Estimated accuracy
          } else if (service.includes('ipinfo.io')) {
            const [latStr, lngStr] = data.loc?.split(',') || [];
            lat = parseFloat(latStr);
            lng = parseFloat(lngStr);
            accuracy = 100; // Estimated accuracy
          }

          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            return {
              coords: { lat, lng },
              accuracy,
              method: `IP Location (${service.split('/')[2]})`,
              timestamp: Date.now(),
              confidence: accuracy <= 50 ? 'MEDIUM' : 'LOW'
            };
          }

        } catch (error) {
          console.warn(`IP service ${service} failed:`, error);
          continue;
        }
      }

      return null;

    } catch (error) {
      console.warn('All IP location services failed:', error);
      return null;
    }
  }

  // Method 4: Browser Location API (Network-based)
  private async getBrowserLocationAPI(): Promise<ExtremeLocationResult | null> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: false, // Use network for speed
          timeout: 5000,
          maximumAge: 60000 // Accept 1-minute old position
        };

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      return {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        method: 'Browser Network Location',
        timestamp: Date.now(),
        confidence: position.coords.accuracy <= 100 ? 'MEDIUM' : 'LOW'
      };

    } catch (error) {
      console.warn('Browser location failed:', error);
      return null;
    }
  }

  // 🎯 CONTINUOUS MONITORING for even better accuracy
  async startContinuousAccuracy(callback: (result: ExtremeLocationResult) => void): Promise<number> {
    let bestAccuracy = Infinity;
    let attempts = 0;
    const maxAttempts = 10;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        attempts++;
        
        if (position.coords.accuracy < bestAccuracy) {
          bestAccuracy = position.coords.accuracy;
          
          const result: ExtremeLocationResult = {
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: `Continuous GPS (attempt ${attempts})`,
            timestamp: Date.now(),
            confidence: position.coords.accuracy <= 5 ? 'HIGH' : position.coords.accuracy <= 20 ? 'MEDIUM' : 'LOW'
          };

          callback(result);

          // Stop if we get house-level accuracy (≤5m) or max attempts
          if (position.coords.accuracy <= 5 || attempts >= maxAttempts) {
            navigator.geolocation.clearWatch(watchId);
          }
        }
      },
      (error) => {
        console.warn('Continuous location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return watchId;
  }
}

// Export singleton instance
export const extremeLocation = ExtremeLocationService.getInstance();
