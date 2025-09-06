// 🌍 WORLDWIDE ACCURATE LOCATION SERVICE
// Works ANYWHERE on Earth - no country restrictions!

export interface WorldwideLocationResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  timestamp: number;
}

export class WorldwideAccurateLocation {
  // 🔥 Request geolocation permission explicitly
  static async requestLocationPermission(): Promise<boolean> {

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });

        if (permission.state === 'denied') {

          return false;
        }

        if (permission.state === 'granted') {

          return true;
        }
      }

      // Try to get location to trigger permission prompt

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000
          }
        );
      });

      return true;

    } catch (error) {

      return false;
    }
  }

  // 🎯 Main method: Get FAST and accurate location ANYWHERE in the world
  static async getWorldwideLocation(): Promise<WorldwideLocationResult | null> {

    // First, ensure we have permission
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {

      return null;
    }

    // Try fast methods in parallel for speed

    const methods = [
      this.getFastHighAccuracyGPS(),
      this.getStandardGPS(),
      this.getNetworkGPS()
    ];

    try {
      // Race all methods - use the first one that succeeds
      const result = await Promise.race(
        methods.map(async (method, index) => {
          try {
            const res = await method;
            if (res && this.isValidCoordinates(res.coords)) {

              return res;
            }
            return null;
          } catch (error) {

            return null;
          }
        })
      );

      if (result) {

        return result;
      }

      // If parallel methods fail, try one more quick method

      const fallback = await this.getQuickGPS();
      if (fallback && this.isValidCoordinates(fallback.coords)) {
        return fallback;
      }

    } catch (error) {

    }

    return null;
  }

  // Method 1: Fast High Accuracy GPS (10 seconds timeout)
  private static async getFastHighAccuracyGPS(): Promise<WorldwideLocationResult | null> {
    return new Promise((resolve) => {

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds for fast response
        maximumAge: 30000 // Accept 30-second old position for speed
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {

          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Fast High Accuracy GPS (10s)',
            timestamp: Date.now()
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 2: Standard GPS (8 seconds timeout)
  private static async getStandardGPS(): Promise<WorldwideLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 8000, // 8 seconds
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
            method: 'Standard GPS (8s)',
            timestamp: Date.now()
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 3: Network GPS (5 seconds, uses WiFi/cell towers)
  private static async getNetworkGPS(): Promise<WorldwideLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: false, // Use network/WiFi for speed
        timeout: 5000, // 5 seconds
        maximumAge: 120000 // Accept 2-minute old position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Network GPS (WiFi/Cell)',
            timestamp: Date.now()
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 4: Network GPS (10 seconds, uses WiFi/cell towers)
  private static async getNetworkGPS(): Promise<WorldwideLocationResult | null> {
    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: false, // Use network/WiFi for speed
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
            method: 'Network GPS (WiFi/Cell)',
            timestamp: Date.now()
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Method 5: Quick GPS (5 seconds, fastest)
  private static async getQuickGPS(): Promise<WorldwideLocationResult | null> {
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
            method: 'Quick GPS (5s)',
            timestamp: Date.now()
          });
        },
        (error) => {

          resolve(null);
        },
        options
      );
    });
  }

  // Validate coordinates are within valid Earth bounds
  private static isValidCoordinates(coords: { lat: number; lng: number }): boolean {
    const { lat, lng } = coords;
    
    // Valid Earth coordinates: lat -90 to 90, lng -180 to 180
    const isValid = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && 
                   !isNaN(lat) && !isNaN(lng) && 
                   lat !== 0 || lng !== 0; // Avoid exact 0,0 which is often invalid
    
    if (!isValid) {

    }
    
    return isValid;
  }

  // Get multiple readings and average them for EXTREME accuracy
  static async getAveragedLocation(numReadings: number = 5): Promise<WorldwideLocationResult | null> {

    // First, ensure we have permission
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {

      return null;
    }

    const readings: WorldwideLocationResult[] = [];

    for (let i = 0; i < numReadings; i++) {

      const reading = await this.getWorldwideLocation();
      if (reading) {
        readings.push(reading);

        // If we get an extremely accurate reading (≤10m), prioritize it
        if (reading.accuracy <= 10) {

          // Add this reading multiple times to give it more weight
          readings.push(reading);
          readings.push(reading);
        }

        // Wait 3 seconds between readings for GPS to stabilize
        if (i < numReadings - 1) {

          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    if (readings.length === 0) {

      return null;
    }

    if (readings.length === 1) {
      return readings[0];
    }

    // Advanced weighted average calculation
    // Give exponentially more weight to more accurate readings
    const weights = readings.map(reading => Math.pow(1 / reading.accuracy, 2)); // Square the weight for more emphasis
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const avgLat = readings.reduce((sum, reading, index) =>
      sum + (reading.coords.lat * weights[index]), 0) / totalWeight;

    const avgLng = readings.reduce((sum, reading, index) =>
      sum + (reading.coords.lng * weights[index]), 0) / totalWeight;

    // Use the best accuracy from all readings
    const bestAccuracy = Math.min(...readings.map(r => r.accuracy));

    // Calculate standard deviation to assess consistency
    const latStdDev = Math.sqrt(readings.reduce((sum, reading) =>
      sum + Math.pow(reading.coords.lat - avgLat, 2), 0) / readings.length);
    const lngStdDev = Math.sqrt(readings.reduce((sum, reading) =>
      sum + Math.pow(reading.coords.lng - avgLng, 2), 0) / readings.length);

    const consistencyScore = Math.max(latStdDev, lngStdDev) * 111000; // Convert to meters

    return {
      coords: { lat: avgLat, lng: avgLng },
      accuracy: Math.max(bestAccuracy, consistencyScore), // Use worse of best accuracy or consistency
      method: `EXTREME Averaged GPS (${readings.length} readings)`,
      timestamp: Date.now()
    };
  }

  // Continuous location monitoring for real-time updates
  static startContinuousLocation(
    callback: (result: WorldwideLocationResult) => void,
    options?: { maxTime?: number; targetAccuracy?: number }
  ): number {
    const maxTime = options?.maxTime || 60000; // 1 minute default
    const targetAccuracy = options?.targetAccuracy || 10; // 10m default
    
    let bestAccuracy = Infinity;
    let startTime = Date.now();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const result: WorldwideLocationResult = {
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          accuracy: position.coords.accuracy,
          method: 'Continuous GPS',
          timestamp: Date.now()
        };

        if (position.coords.accuracy < bestAccuracy) {
          bestAccuracy = position.coords.accuracy;
          callback(result);

          // Stop if we reach target accuracy
          if (position.coords.accuracy <= targetAccuracy) {

            navigator.geolocation.clearWatch(watchId);
          }
        }

        // Stop after max time
        if (Date.now() - startTime > maxTime) {

          navigator.geolocation.clearWatch(watchId);
        }
      },
      (error) => {

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

// Export for easy use
export const getWorldwideLocation = WorldwideAccurateLocation.getWorldwideLocation;
export const getAveragedWorldwideLocation = WorldwideAccurateLocation.getAveragedLocation;
