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

  // Get fast and accurate location using optimized method
  async getUltraPreciseLocation(): Promise<UltraPreciseLocationResult | null> {
    console.log('🎯 Starting fast precise location detection...');

    try {
      // Method 1: Fast high-accuracy GPS (primary)
      const fastGPS = await this.getFastHighAccuracyGPS();
      if (fastGPS && fastGPS.accuracy <= 20) {
        console.log(`✅ Fast GPS success: ±${Math.round(fastGPS.accuracy)}m`);
        return fastGPS;
      }

      // Method 2: Network-assisted as backup
      const networkAssisted = await this.getNetworkAssistedLocation();
      if (networkAssisted) {
        console.log(`✅ Network location: ±${Math.round(networkAssisted.accuracy)}m`);
        return networkAssisted;
      }

      console.log('❌ All location methods failed');
      return null;

    } catch (error) {
      console.error('❌ Location detection failed:', error);
      return null;
    }
  }

  // Method 1: Fast high-accuracy GPS
  private async getFastHighAccuracyGPS(): Promise<UltraPreciseLocationResult | null> {
    console.log('📡 Getting fast high-accuracy GPS...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 8000, // 8 seconds max
          maximumAge: 30000 // Accept 30-second old position
        };

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      return {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        method: 'Fast High-Accuracy GPS',
        timestamp: Date.now()
      };

    } catch (error) {
      console.warn('Fast GPS failed:', error);
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
