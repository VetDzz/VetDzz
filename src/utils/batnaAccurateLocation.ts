// 🎯 BATNA-SPECIFIC ACCURATE LOCATION SERVICE
// Designed specifically for accurate location detection in Batna, Algeria

export interface BatnaLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  isInBatna: boolean;
  distanceFromBatnaCenter: number;
}

export class BatnaAccurateLocation {
  private static readonly BATNA_CENTER = { lat: 35.5559, lng: 6.1743 };
  private static readonly BATNA_BOUNDS = {
    north: 35.6200,
    south: 35.4900,
    east: 6.2500,
    west: 6.0900
  };

  // 🎯 Main method: Get your exact location in Batna
  static async getBatnaLocation(): Promise<BatnaLocationResult | null> {
    console.log('🏠 Getting your exact location in Batna...');

    // Try multiple GPS methods in sequence
    const methods = [
      () => this.getHighPrecisionGPS(),
      () => this.getStandardGPS(),
      () => this.getNetworkGPS(),
      () => this.getQuickGPS()
    ];

    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`📡 Trying GPS method ${i + 1}/${methods.length}...`);
        const result = await methods[i]();
        
        if (result) {
          const distance = this.calculateDistance(result.coords, this.BATNA_CENTER);
          const isInBatna = this.isLocationInBatna(result.coords);
          
          const batnaResult: BatnaLocationResult = {
            ...result,
            isInBatna,
            distanceFromBatnaCenter: distance
          };

          console.log(`📍 Method ${i + 1} result:`);
          console.log(`   Location: ${result.coords.lat.toFixed(6)}, ${result.coords.lng.toFixed(6)}`);
          console.log(`   Accuracy: ±${Math.round(result.accuracy)}m`);
          console.log(`   Distance from Batna center: ${Math.round(distance)}m`);
          console.log(`   Is in Batna: ${isInBatna}`);

          // If location is reasonable (within 20km of Batna center), use it
          if (distance <= 20000) {
            console.log(`✅ Good location found with method ${i + 1}`);
            return batnaResult;
          } else {
            console.warn(`❌ Method ${i + 1} gave location too far from Batna (${Math.round(distance/1000)}km)`);
          }
        }
      } catch (error) {
        console.warn(`Method ${i + 1} failed:`, error);
      }
    }

    // If all methods fail or give bad locations, return Batna center
    console.log('🏠 Using Batna center as fallback');
    return {
      coords: this.BATNA_CENTER,
      accuracy: 1000,
      method: 'Batna Center Fallback',
      isInBatna: true,
      distanceFromBatnaCenter: 0
    };
  }

  // Method 1: High precision GPS (best accuracy)
  private static async getHighPrecisionGPS(): Promise<BatnaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds for high precision
        maximumAge: 0 // Force fresh reading
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
            isInBatna: false, // Will be calculated later
            distanceFromBatnaCenter: 0 // Will be calculated later
          });
        },
        (error) => {
          console.warn('High precision GPS failed:', error);
          resolve(null);
        },
        options
      );
    });
  }

  // Method 2: Standard GPS
  private static async getStandardGPS(): Promise<BatnaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
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
            method: 'Standard GPS',
            isInBatna: false,
            distanceFromBatnaCenter: 0
          });
        },
        (error) => {
          console.warn('Standard GPS failed:', error);
          resolve(null);
        },
        options
      );
    });
  }

  // Method 3: Network-based GPS
  private static async getNetworkGPS(): Promise<BatnaLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: false, // Use network/WiFi
        timeout: 10000,
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
            isInBatna: false,
            distanceFromBatnaCenter: 0
          });
        },
        (error) => {
          console.warn('Network GPS failed:', error);
          resolve(null);
        },
        options
      );
    });
  }

  // Method 4: Quick GPS (last resort)
  private static async getQuickGPS(): Promise<BatnaLocationResult | null> {
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
            method: 'Quick GPS',
            isInBatna: false,
            distanceFromBatnaCenter: 0
          });
        },
        (error) => {
          console.warn('Quick GPS failed:', error);
          resolve(null);
        },
        options
      );
    });
  }

  // Check if location is within Batna city bounds
  private static isLocationInBatna(coords: { lat: number; lng: number }): boolean {
    const { lat, lng } = coords;
    return lat >= this.BATNA_BOUNDS.south && 
           lat <= this.BATNA_BOUNDS.north && 
           lng >= this.BATNA_BOUNDS.west && 
           lng <= this.BATNA_BOUNDS.east;
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

  // Get multiple readings and average them
  static async getAveragedLocation(numReadings: number = 3): Promise<BatnaLocationResult | null> {
    console.log(`📊 Taking ${numReadings} readings for better accuracy...`);
    
    const readings: BatnaLocationResult[] = [];
    
    for (let i = 0; i < numReadings; i++) {
      const reading = await this.getBatnaLocation();
      if (reading && reading.distanceFromBatnaCenter <= 20000) {
        readings.push(reading);
        console.log(`📍 Reading ${i + 1}: ±${Math.round(reading.accuracy)}m`);
        
        // Wait 2 seconds between readings
        if (i < numReadings - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (readings.length === 0) {
      return this.getBatnaLocation(); // Fallback to single reading
    }

    // Calculate weighted average based on accuracy
    const totalWeight = readings.reduce((sum, reading) => sum + (1 / reading.accuracy), 0);
    
    const avgLat = readings.reduce((sum, reading) => 
      sum + (reading.coords.lat * (1 / reading.accuracy)), 0) / totalWeight;
    
    const avgLng = readings.reduce((sum, reading) => 
      sum + (reading.coords.lng * (1 / reading.accuracy)), 0) / totalWeight;

    const bestAccuracy = Math.min(...readings.map(r => r.accuracy));
    const distance = this.calculateDistance({ lat: avgLat, lng: avgLng }, this.BATNA_CENTER);

    console.log(`📊 Averaged location: ${avgLat.toFixed(6)}, ${avgLng.toFixed(6)} (±${Math.round(bestAccuracy)}m)`);

    return {
      coords: { lat: avgLat, lng: avgLng },
      accuracy: bestAccuracy,
      method: `Averaged GPS (${readings.length} readings)`,
      isInBatna: this.isLocationInBatna({ lat: avgLat, lng: avgLng }),
      distanceFromBatnaCenter: distance
    };
  }
}

// Export for easy use
export const getBatnaLocation = BatnaAccurateLocation.getBatnaLocation;
export const getAveragedBatnaLocation = BatnaAccurateLocation.getAveragedLocation;
