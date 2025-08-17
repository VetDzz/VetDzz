// 🎯 SIMPLE BUT ACCURATE LOCATION SERVICE
// Focuses on reliability over complexity

export interface SimpleLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  city?: string;
}

export class SimpleAccurateLocation {
  // 🎯 Main method: Get accurate location for Algeria
  static async getAccurateLocation(): Promise<SimpleLocationResult | null> {
    console.log('🎯 Getting simple but accurate location...');

    // Method 1: Try reliable GPS first
    const gpsResult = await this.getSimpleGPS();
    if (gpsResult && this.isValidAlgerianLocation(gpsResult.coords)) {
      console.log(`✅ GPS Success: ${gpsResult.coords.lat.toFixed(6)}, ${gpsResult.coords.lng.toFixed(6)}`);
      return gpsResult;
    }

    // Method 2: Try browser geolocation with network
    const browserResult = await this.getBrowserLocation();
    if (browserResult && this.isValidAlgerianLocation(browserResult.coords)) {
      console.log(`✅ Browser Success: ${browserResult.coords.lat.toFixed(6)}, ${browserResult.coords.lng.toFixed(6)}`);
      return browserResult;
    }

    // Method 3: Fallback to Batna center
    console.log('🏠 Using Batna center as fallback');
    return {
      coords: { lat: 35.5559, lng: 6.1743 },
      accuracy: 1000,
      method: 'Batna Center Fallback',
      city: 'Batna'
    };
  }

  // Simple GPS method
  private static async getSimpleGPS(): Promise<SimpleLocationResult | null> {
    try {
      console.log('📡 Getting GPS location...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 12000, // 12 seconds
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
        method: 'GPS Location'
      };

    } catch (error) {
      console.warn('GPS failed:', error);
      return null;
    }
  }

  // Browser location method
  private static async getBrowserLocation(): Promise<SimpleLocationResult | null> {
    try {
      console.log('🌐 Getting browser location...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: false, // Use network for speed
          timeout: 8000,
          maximumAge: 120000 // Accept 2-minute old position
        };

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      return {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        method: 'Browser Network Location'
      };

    } catch (error) {
      console.warn('Browser location failed:', error);
      return null;
    }
  }

  // Validate location is in Algeria
  private static isValidAlgerianLocation(coords: { lat: number; lng: number }): boolean {
    const { lat, lng } = coords;
    
    // Algeria bounds with some tolerance
    const isInAlgeria = lat >= 18.5 && lat <= 37.5 && lng >= -9.0 && lng <= 12.5;
    
    // Additional check: not in obviously wrong places
    const isNotInEurope = lat <= 36.0 || lng >= 2.0; // Rough check to avoid European locations
    const isNotInAfrica = lat >= 19.0; // Avoid sub-Saharan Africa
    
    const isValid = isInAlgeria && isNotInEurope && isNotInAfrica;
    
    if (!isValid) {
      console.warn(`🚫 Invalid location detected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      console.warn(`   - In Algeria bounds: ${isInAlgeria}`);
      console.warn(`   - Not in Europe: ${isNotInEurope}`);
      console.warn(`   - Not in sub-Saharan Africa: ${isNotInAfrica}`);
    } else {
      console.log(`✅ Valid Algerian location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
    
    return isValid;
  }

  // Get distance between two points (in meters)
  static getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Check if location is near Batna (within 50km)
  static isNearBatna(coords: { lat: number; lng: number }): boolean {
    const batnaLat = 35.5559;
    const batnaLng = 6.1743;
    const distance = this.getDistance(coords.lat, coords.lng, batnaLat, batnaLng);
    
    const isNear = distance <= 50000; // 50km radius
    console.log(`📍 Distance from Batna: ${Math.round(distance/1000)}km - ${isNear ? 'NEAR' : 'FAR'}`);
    
    return isNear;
  }
}

// Export for easy use
export const getSimpleAccurateLocation = SimpleAccurateLocation.getAccurateLocation;
