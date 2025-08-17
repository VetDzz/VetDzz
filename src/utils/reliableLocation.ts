// 🌍 RELIABLE LOCATION SERVICE - Using multiple APIs for accuracy
export interface ReliableLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  city?: string;
  country?: string;
}

export class ReliableLocationService {
  // Main method: Get location using the best available method
  static async getLocation(): Promise<ReliableLocationResult | null> {
    // Try methods in order of reliability
    const methods = [
      () => this.getIPLocationAPI(),
      () => this.getSimpleGPS(),
      () => this.getNetworkLocation()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result && this.isValidLocation(result.coords)) {
          return result;
        }
      } catch (error) {
        continue; // Try next method
      }
    }

    return null;
  }

  // Method 1: IP-based location (fastest and most reliable)
  private static async getIPLocationAPI(): Promise<ReliableLocationResult | null> {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('IP API failed');

      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          coords: {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude)
          },
          accuracy: 1000, // City-level accuracy
          method: 'IP Geolocation',
          city: data.city,
          country: data.country_name
        };
      }

      throw new Error('No coordinates in IP response');
    } catch (error) {
      // Try backup IP service
      try {
        const response = await fetch('https://ip-api.com/json/?fields=status,lat,lon,city,country');
        const data = await response.json();

        if (data.status === 'success' && data.lat && data.lon) {
          return {
            coords: {
              lat: data.lat,
              lng: data.lon
            },
            accuracy: 2000,
            method: 'IP Geolocation (Backup)',
            city: data.city,
            country: data.country
          };
        }
      } catch (backupError) {
        // Ignore backup error
      }

      throw error;
    }
  }

  // Method 2: Simple GPS
  private static async getSimpleGPS(): Promise<ReliableLocationResult | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'GPS'
          });
        },
        (error) => {
          reject(error);
        },
        options
      );
    });
  }

  // Method 3: Network-based location
  private static async getNetworkLocation(): Promise<ReliableLocationResult | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Network Location'
          });
        },
        (error) => {
          reject(error);
        },
        options
      );
    });
  }

  // Validate coordinates
  private static isValidLocation(coords: { lat: number; lng: number }): boolean {
    const { lat, lng } = coords;
    return lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180 && 
           !isNaN(lat) && !isNaN(lng) &&
           !(lat === 0 && lng === 0);
  }

  // Get location with automatic retry
  static async getLocationWithRetry(maxRetries: number = 2): Promise<ReliableLocationResult | null> {
    for (let i = 0; i < maxRetries; i++) {
      const result = await this.getLocation();
      if (result) {
        return result;
      }
      
      // Wait 1 second before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return null;
  }

  // Request permission explicitly
  static async requestPermission(): Promise<boolean> {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (permission.state === 'denied') {
          return false;
        }
        if (permission.state === 'granted') {
          return true;
        }
      }

      // Try to get location to trigger permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { timeout: 3000, maximumAge: 300000 }
        );
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Get user's approximate location using multiple sources
  static async getApproximateLocation(): Promise<ReliableLocationResult | null> {
    // Try IP location first (fastest)
    try {
      const ipResult = await this.getIPLocationAPI();
      if (ipResult) {
        return ipResult;
      }
    } catch (error) {
      // Continue to GPS
    }

    // Try GPS as backup
    try {
      const gpsResult = await this.getSimpleGPS();
      if (gpsResult) {
        return gpsResult;
      }
    } catch (error) {
      // Continue to network
    }

    // Try network location as last resort
    try {
      const networkResult = await this.getNetworkLocation();
      if (networkResult) {
        return networkResult;
      }
    } catch (error) {
      // All methods failed
    }

    return null;
  }

  // Get precise location (GPS preferred)
  static async getPreciseLocation(): Promise<ReliableLocationResult | null> {
    // Try GPS first for precision
    try {
      const gpsResult = await this.getSimpleGPS();
      if (gpsResult && gpsResult.accuracy <= 100) {
        return gpsResult;
      }
    } catch (error) {
      // Continue to other methods
    }

    // Fallback to other methods
    return this.getApproximateLocation();
  }
}

// Export simple functions
export const getReliableLocation = ReliableLocationService.getLocation;
export const getLocationWithRetry = ReliableLocationService.getLocationWithRetry;
export const requestLocationPermission = ReliableLocationService.requestPermission;
export const getApproximateLocation = ReliableLocationService.getApproximateLocation;
export const getPreciseLocation = ReliableLocationService.getPreciseLocation;
