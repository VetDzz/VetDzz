// 🇩🇿 ALGERIA-WIDE ACCURATE LOCATION SERVICE
// Works accurately for ANYONE, ANYWHERE in Algeria

export interface AlgeriaLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  city?: string;
  region?: string;
  isInAlgeria: boolean;
}

export class AlgeriaAccurateLocation {
  // Algeria geographical bounds
  private static readonly ALGERIA_BOUNDS = {
    north: 37.2,
    south: 18.8,
    east: 12.1,
    west: -8.8
  };

  // Major Algerian cities for validation
  private static readonly MAJOR_CITIES = [
    { name: 'Algiers', lat: 36.7538, lng: 3.0588 },
    { name: 'Oran', lat: 35.6969, lng: -0.6331 },
    { name: 'Constantine', lat: 36.3650, lng: 6.6147 },
    { name: 'Batna', lat: 35.5559, lng: 6.1743 },
    { name: 'Setif', lat: 36.1906, lng: 5.4130 },
    { name: 'Annaba', lat: 36.9000, lng: 7.7667 },
    { name: 'Blida', lat: 36.4203, lng: 2.8277 },
    { name: 'Tlemcen', lat: 34.8786, lng: -1.3150 },
    { name: 'Biskra', lat: 34.8481, lng: 5.7281 },
    { name: 'Ouargla', lat: 31.9539, lng: 5.3295 }
  ];

  // 🎯 Main method: Get accurate location anywhere in Algeria
  static async getAlgeriaLocation(): Promise<AlgeriaLocationResult | null> {

    // Try multiple GPS methods with different configurations
    const methods = [
      () => this.getUltraHighPrecisionGPS(),
      () => this.getHighPrecisionGPS(),
      () => this.getBalancedGPS(),
      () => this.getNetworkGPS(),
      () => this.getFastGPS()
    ];

    for (let i = 0; i < methods.length; i++) {
      try {

        const result = await methods[i]();
        
        if (result && this.validateAlgerianLocation(result.coords)) {
          const nearestCity = this.findNearestCity(result.coords);
          
          const algeriaResult: AlgeriaLocationResult = {
            ...result,
            city: nearestCity.name,
            region: this.getRegion(result.coords),
            isInAlgeria: true
          };

          return algeriaResult;
        } else {

        }
      } catch (error) {

      }
    }

    // Try IP-based location as final backup
    const ipResult = await this.getIPBasedLocation();
    if (ipResult) {
      return ipResult;
    }

    // Ultimate fallback - return null so caller can decide

    return null;
  }

  // Method 1: Ultra high precision GPS (20+ seconds, maximum accuracy)
  private static async getUltraHighPrecisionGPS(): Promise<AlgeriaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 25000, // 25 seconds for maximum precision
        maximumAge: 0 // Force completely fresh reading
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Ultra High Precision GPS',
            isInAlgeria: false // Will be set later
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 2: High precision GPS (15 seconds)
  private static async getHighPrecisionGPS(): Promise<AlgeriaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000 // Accept 10-second old position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'High Precision GPS',
            isInAlgeria: false
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 3: Balanced GPS (10 seconds, good accuracy)
  private static async getBalancedGPS(): Promise<AlgeriaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Accept 30-second old position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Balanced GPS',
            isInAlgeria: false
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 4: Network GPS (fast, network-based)
  private static async getNetworkGPS(): Promise<AlgeriaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: false, // Use network/WiFi
        timeout: 8000,
        maximumAge: 60000 // Accept 1-minute old position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Network GPS',
            isInAlgeria: false
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 5: Fast GPS (very fast, lower accuracy)
  private static async getFastGPS(): Promise<AlgeriaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // Accept 5-minute old position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Fast GPS',
            isInAlgeria: false
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // IP-based location for Algeria
  private static async getIPBasedLocation(): Promise<AlgeriaLocationResult | null> {
    try {
      const response = await fetch('https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,lat,lon');
      const data = await response.json();

      if (data.status === 'success' && data.countryCode === 'DZ') {
        return {
          coords: {
            lat: data.lat,
            lng: data.lon
          },
          accuracy: 5000, // City-level accuracy
          method: 'IP Geolocation',
          city: data.city,
          region: data.regionName,
          isInAlgeria: true
        };
      }

      return null;
    } catch (error) {

      return null;
    }
  }

  // Validate location is within Algeria bounds
  private static validateAlgerianLocation(coords: { lat: number; lng: number }): boolean {
    const { lat, lng } = coords;
    const isValid = lat >= this.ALGERIA_BOUNDS.south && 
                   lat <= this.ALGERIA_BOUNDS.north && 
                   lng >= this.ALGERIA_BOUNDS.west && 
                   lng <= this.ALGERIA_BOUNDS.east;
    
    if (!isValid) {

    }
    
    return isValid;
  }

  // Find nearest major city
  private static findNearestCity(coords: { lat: number; lng: number }): { name: string; distance: number } {
    let nearestCity = this.MAJOR_CITIES[0];
    let minDistance = this.calculateDistance(coords, nearestCity);

    for (const city of this.MAJOR_CITIES) {
      const distance = this.calculateDistance(coords, city);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return { name: nearestCity.name, distance: minDistance };
  }

  // Get region based on coordinates
  private static getRegion(coords: { lat: number; lng: number }): string {
    const { lat, lng } = coords;
    
    if (lat > 35.5) return 'Northern Algeria';
    if (lat > 32.0) return 'Central Algeria';
    return 'Southern Algeria';
  }

  // Calculate distance between two points (in meters)
  private static calculateDistance(
    point1: { lat: number; lng: number }, 
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat - point1.lat) * Math.PI/180;
    const Δλ = (point2.lng - point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

// Export for easy use
export const getAlgeriaLocation = AlgeriaAccurateLocation.getAlgeriaLocation;
