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

  // 🎯 MAIN METHOD: Get house-level accuracy with validation
  async getHouseLevelLocation(): Promise<ExtremeLocationResult | null> {
    console.log('🔥 EXTREME LOCATION: Starting house-level precision detection...');

    // First, try the most reliable GPS method
    const gpsResult = await this.getReliableGPS();
    if (gpsResult && this.isLocationInAlgeria(gpsResult.coords)) {
      console.log(`🎯 GPS SUCCESS: ${gpsResult.coords.lat.toFixed(6)}, ${gpsResult.coords.lng.toFixed(6)} - ±${Math.round(gpsResult.accuracy)}m`);
      return gpsResult;
    }

    // If GPS fails or gives wrong location, try other methods
    const results = await Promise.allSettled([
      this.getHTML5HighAccuracy(),
      this.getAlgerianIPLocation(),
      this.getBrowserLocationAPI()
    ]);

    const validResults: ExtremeLocationResult[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        // Validate location is in Algeria
        if (this.isLocationInAlgeria(result.value.coords)) {
          validResults.push(result.value);
          console.log(`✅ Method ${index + 1} success: ${result.value.coords.lat.toFixed(6)}, ${result.value.coords.lng.toFixed(6)} - ±${Math.round(result.value.accuracy)}m`);
        } else {
          console.warn(`❌ Method ${index + 1} gave invalid location outside Algeria`);
        }
      }
    });

    if (validResults.length === 0) {
      console.log('❌ All methods failed or gave invalid locations, using Batna fallback');
      return {
        coords: { lat: 35.5559, lng: 6.1743 }, // Batna center
        accuracy: 1000,
        method: 'Batna Fallback',
        timestamp: Date.now(),
        confidence: 'LOW'
      };
    }

    // Find the most accurate result
    const bestResult = validResults.reduce((best, current) =>
      current.accuracy < best.accuracy ? current : best
    );

    console.log(`🎯 BEST RESULT: ${bestResult.method} - ${bestResult.coords.lat.toFixed(6)}, ${bestResult.coords.lng.toFixed(6)} - ±${Math.round(bestResult.accuracy)}m`);
    return bestResult;
  }

  // Validate location is in Algeria
  private isLocationInAlgeria(coords: { lat: number; lng: number }): boolean {
    // Algeria bounds: roughly 18.9°N to 37.1°N, -8.7°W to 12.0°E
    const { lat, lng } = coords;
    const isValid = lat >= 18.9 && lat <= 37.1 && lng >= -8.7 && lng <= 12.0;

    if (!isValid) {
      console.warn(`🚫 Invalid location: ${lat.toFixed(6)}, ${lng.toFixed(6)} - Outside Algeria bounds`);
    }

    return isValid;
  }

  // Method 1: Reliable GPS with multiple attempts
  private async getReliableGPS(): Promise<ExtremeLocationResult | null> {
    console.log('📡 Getting reliable GPS location...');

    try {
      // Try 3 times with different settings
      const attempts = [
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      ];

      for (let i = 0; i < attempts.length; i++) {
        try {
          console.log(`📍 GPS attempt ${i + 1}/3...`);

          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, attempts[i]);
          });

          const result = {
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: `Reliable GPS (attempt ${i + 1})`,
            timestamp: Date.now(),
            confidence: position.coords.accuracy <= 10 ? 'HIGH' : position.coords.accuracy <= 50 ? 'MEDIUM' : 'LOW'
          };

          // Validate the location is reasonable
          if (this.isLocationInAlgeria(result.coords)) {
            console.log(`✅ GPS attempt ${i + 1} success: ${result.coords.lat.toFixed(6)}, ${result.coords.lng.toFixed(6)} - ±${Math.round(result.accuracy)}m`);
            return result;
          } else {
            console.warn(`❌ GPS attempt ${i + 1} gave invalid location`);
          }

        } catch (error) {
          console.warn(`GPS attempt ${i + 1} failed:`, error);
          continue;
        }
      }

      return null;

    } catch (error) {
      console.warn('All GPS attempts failed:', error);
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

  // Method 3: Algerian-specific IP Location
  private async getAlgerianIPLocation(): Promise<ExtremeLocationResult | null> {
    console.log('🇩🇿 Getting Algeria-specific IP location...');

    try {
      // Try Algeria-aware IP location services
      const services = [
        {
          url: 'https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,lat,lon,isp',
          name: 'ip-api.com'
        },
        {
          url: 'https://ipapi.co/json/',
          name: 'ipapi.co'
        },
        {
          url: 'https://ipinfo.io/json',
          name: 'ipinfo.io'
        }
      ];

      for (const service of services) {
        try {
          console.log(`🌐 Trying ${service.name}...`);
          const response = await fetch(service.url);
          const data = await response.json();

          let lat, lng, accuracy = 5000; // Default city-level accuracy
          let city = '';

          if (service.name === 'ip-api.com') {
            if (data.status === 'success' && data.countryCode === 'DZ') {
              lat = data.lat;
              lng = data.lon;
              city = data.city || data.regionName || '';
              accuracy = 2000; // City-level for Algeria
            }
          } else if (service.name === 'ipapi.co') {
            if (data.country_code === 'DZ') {
              lat = parseFloat(data.latitude);
              lng = parseFloat(data.longitude);
              city = data.city || '';
              accuracy = data.accuracy || 2000;
            }
          } else if (service.name === 'ipinfo.io') {
            if (data.country === 'DZ') {
              const [latStr, lngStr] = data.loc?.split(',') || [];
              lat = parseFloat(latStr);
              lng = parseFloat(lngStr);
              city = data.city || '';
              accuracy = 3000;
            }
          }

          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            const result = {
              coords: { lat, lng },
              accuracy,
              method: `Algeria IP (${service.name}) - ${city}`,
              timestamp: Date.now(),
              confidence: accuracy <= 1000 ? 'MEDIUM' : 'LOW'
            };

            // Validate it's actually in Algeria
            if (this.isLocationInAlgeria(result.coords)) {
              console.log(`✅ ${service.name} success: ${city} - ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              return result;
            }
          }

        } catch (error) {
          console.warn(`${service.name} failed:`, error);
          continue;
        }
      }

      return null;

    } catch (error) {
      console.warn('All Algeria IP location services failed:', error);
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
