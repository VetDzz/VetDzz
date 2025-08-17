// Ultra-precise geolocation service for maximum accuracy
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

  // Get the most accurate location possible using multiple methods
  async getUltraPreciseLocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🎯 Starting ultra-precise location detection...');

    try {
      // Method 1: Continuous high-accuracy GPS with position averaging
      const continuousGPS = await this.getContinuousHighAccuracyGPS();
      
      // Method 2: Multiple rapid GPS readings
      const multipleReadings = await this.getMultipleGPSReadings();
      
      // Method 3: Network-assisted GPS
      const networkAssisted = await this.getNetworkAssistedLocation();

      // Combine and validate all results
      const allResults = [continuousGPS, multipleReadings, networkAssisted].filter(Boolean);
      
      if (allResults.length === 0) {
        console.log('❌ All ultra-precise methods failed');
        return null;
      }

      // Find the most accurate result
      const bestResult = allResults.reduce((best, current) => 
        current!.accuracy < best!.accuracy ? current : best
      );

      console.log(`✅ Ultra-precise location found: ${bestResult!.coords.lat.toFixed(8)}, ${bestResult!.coords.lng.toFixed(8)} (±${Math.round(bestResult!.accuracy)}m)`);
      
      return bestResult!;

    } catch (error) {
      console.error('❌ Ultra-precise location failed:', error);
      return null;
    }
  }

  // Method 1: Continuous high-accuracy GPS with averaging
  private async getContinuousHighAccuracyGPS(): Promise<UltraPreciseLocationResult | null> {
    return new Promise((resolve) => {
      let bestAccuracy = Infinity;
      let bestPosition: GeolocationPosition | null = null;
      let readingCount = 0;
      const maxReadings = 10;
      const timeout = 30000; // 30 seconds

      console.log('📡 Starting continuous high-accuracy GPS...');

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          readingCount++;
          this.locationHistory.push(position);

          console.log(`📍 GPS reading ${readingCount}: ±${Math.round(position.coords.accuracy)}m`);

          if (position.coords.accuracy < bestAccuracy) {
            bestAccuracy = position.coords.accuracy;
            bestPosition = position;
          }

          // Stop after getting very accurate reading or max readings
          if (position.coords.accuracy <= 5 || readingCount >= maxReadings) {
            navigator.geolocation.clearWatch(watchId);
            
            if (bestPosition) {
              resolve({
                coords: {
                  lat: bestPosition.coords.latitude,
                  lng: bestPosition.coords.longitude
                },
                accuracy: bestPosition.coords.accuracy,
                method: 'Continuous High-Accuracy GPS',
                timestamp: Date.now()
              });
            } else {
              resolve(null);
            }
          }
        },
        (error) => {
          console.warn('GPS reading error:', error);
          if (readingCount === 0) {
            navigator.geolocation.clearWatch(watchId);
            resolve(null);
          }
        },
        options
      );

      // Timeout fallback
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          resolve({
            coords: {
              lat: bestPosition.coords.latitude,
              lng: bestPosition.coords.longitude
            },
            accuracy: bestPosition.coords.accuracy,
            method: 'Continuous GPS (timeout)',
            timestamp: Date.now()
          });
        } else {
          resolve(null);
        }
      }, timeout);
    });
  }

  // Method 2: Multiple rapid GPS readings with statistical analysis
  private async getMultipleGPSReadings(): Promise<UltraPreciseLocationResult | null> {
    console.log('🔄 Taking multiple GPS readings for statistical analysis...');
    
    const readings: GeolocationPosition[] = [];
    const numReadings = 5;

    try {
      for (let i = 0; i < numReadings; i++) {
        const position = await this.getSingleHighAccuracyReading(i * 2000); // 2 second intervals
        if (position) {
          readings.push(position);
          console.log(`📊 Reading ${i + 1}/${numReadings}: ±${Math.round(position.coords.accuracy)}m`);
        }
      }

      if (readings.length === 0) return null;

      // Calculate weighted average based on accuracy
      const totalWeight = readings.reduce((sum, pos) => sum + (1 / pos.coords.accuracy), 0);
      
      const weightedLat = readings.reduce((sum, pos) => 
        sum + (pos.coords.latitude * (1 / pos.coords.accuracy)), 0) / totalWeight;
      
      const weightedLng = readings.reduce((sum, pos) => 
        sum + (pos.coords.longitude * (1 / pos.coords.accuracy)), 0) / totalWeight;

      const bestAccuracy = Math.min(...readings.map(r => r.coords.accuracy));

      return {
        coords: {
          lat: weightedLat,
          lng: weightedLng
        },
        accuracy: bestAccuracy,
        method: 'Statistical GPS Analysis',
        timestamp: Date.now()
      };

    } catch (error) {
      console.warn('Multiple readings failed:', error);
      return null;
    }
  }

  // Method 3: Network-assisted location
  private async getNetworkAssistedLocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🌐 Trying network-assisted location...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false, // Use network for speed
            timeout: 10000,
            maximumAge: 0
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

  // Helper: Get single high-accuracy reading
  private async getSingleHighAccuracyReading(delay: number = 0): Promise<GeolocationPosition | null> {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        }
      );
    });
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
