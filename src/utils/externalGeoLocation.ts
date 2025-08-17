// 🌍 EXTERNAL GEOLOCATION SERVICES - Using third-party APIs for maximum accuracy
export interface ExternalGeoResult {
  coords: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  method: string;
  provider: string;
  city?: string;
  country?: string;
}

export class ExternalGeoLocationService {
  // Main method: Get location using external services
  static async getExternalLocation(): Promise<ExternalGeoResult | null> {
    // Try multiple external services in parallel
    const services = [
      this.getIPGeolocationIO(),
      this.getIPAPILocation(),
      this.getGeoJSLocation(),
      this.getIPInfoLocation(),
      this.getFreeGeoIPLocation()
    ];

    try {
      // Run all services in parallel and use the first successful one
      const results = await Promise.allSettled(services);
      
      const validResults: ExternalGeoResult[] = [];
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          validResults.push(result.value);
        }
      }

      if (validResults.length === 0) {
        return null;
      }

      // Return the most accurate result
      return validResults.reduce((best, current) => 
        current.accuracy < best.accuracy ? current : best
      );

    } catch (error) {
      return null;
    }
  }

  // Service 1: ipgeolocation.io (Very accurate)
  private static async getIPGeolocationIO(): Promise<ExternalGeoResult | null> {
    try {
      const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=free', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Service failed');

      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          coords: {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude)
          },
          accuracy: 500, // City-level accuracy
          method: 'External API',
          provider: 'IPGeolocation.io',
          city: data.city,
          country: data.country_name
        };
      }

      throw new Error('No coordinates');
    } catch (error) {
      throw error;
    }
  }

  // Service 2: ip-api.com (Free and reliable)
  private static async getIPAPILocation(): Promise<ExternalGeoResult | null> {
    try {
      const response = await fetch('https://ip-api.com/json/?fields=status,lat,lon,city,country,regionName', {
        method: 'GET'
      });

      if (!response.ok) throw new Error('Service failed');

      const data = await response.json();

      if (data.status === 'success' && data.lat && data.lon) {
        return {
          coords: {
            lat: data.lat,
            lng: data.lon
          },
          accuracy: 800,
          method: 'External API',
          provider: 'IP-API.com',
          city: data.city,
          country: data.country
        };
      }

      throw new Error('No coordinates');
    } catch (error) {
      throw error;
    }
  }

  // Service 3: geojs.io (Fast and accurate)
  private static async getGeoJSLocation(): Promise<ExternalGeoResult | null> {
    try {
      const response = await fetch('https://get.geojs.io/v1/ip/geo.json', {
        method: 'GET'
      });

      if (!response.ok) throw new Error('Service failed');

      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          coords: {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude)
          },
          accuracy: 600,
          method: 'External API',
          provider: 'GeoJS.io',
          city: data.city,
          country: data.country
        };
      }

      throw new Error('No coordinates');
    } catch (error) {
      throw error;
    }
  }

  // Service 4: ipinfo.io (Reliable)
  private static async getIPInfoLocation(): Promise<ExternalGeoResult | null> {
    try {
      const response = await fetch('https://ipinfo.io/json', {
        method: 'GET'
      });

      if (!response.ok) throw new Error('Service failed');

      const data = await response.json();

      if (data.loc) {
        const [lat, lng] = data.loc.split(',').map(parseFloat);
        
        if (lat && lng) {
          return {
            coords: { lat, lng },
            accuracy: 1000,
            method: 'External API',
            provider: 'IPInfo.io',
            city: data.city,
            country: data.country
          };
        }
      }

      throw new Error('No coordinates');
    } catch (error) {
      throw error;
    }
  }

  // Service 5: freegeoip.app (Backup)
  private static async getFreeGeoIPLocation(): Promise<ExternalGeoResult | null> {
    try {
      const response = await fetch('https://freegeoip.app/json/', {
        method: 'GET'
      });

      if (!response.ok) throw new Error('Service failed');

      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          coords: {
            lat: data.latitude,
            lng: data.longitude
          },
          accuracy: 1200,
          method: 'External API',
          provider: 'FreeGeoIP.app',
          city: data.city,
          country: data.country_name
        };
      }

      throw new Error('No coordinates');
    } catch (error) {
      throw error;
    }
  }

  // Enhanced method: Combine external services with browser geolocation
  static async getCombinedLocation(): Promise<ExternalGeoResult | null> {
    try {
      // Try browser geolocation first (most accurate if permission granted)
      const browserResult = await this.getBrowserGeolocation();
      
      if (browserResult && browserResult.accuracy <= 100) {
        return browserResult; // Use browser if very accurate
      }

      // Otherwise use external services
      const externalResult = await this.getExternalLocation();
      
      if (externalResult) {
        return externalResult;
      }

      // Fallback to browser result even if not very accurate
      return browserResult;

    } catch (error) {
      // Try external services as final fallback
      return await this.getExternalLocation();
    }
  }

  // Browser geolocation with timeout
  private static async getBrowserGeolocation(): Promise<ExternalGeoResult | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 60000 // 1 minute cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            method: 'Browser Geolocation',
            provider: 'HTML5 GPS'
          });
        },
        (error) => reject(error),
        options
      );
    });
  }

  // Get location with automatic fallback chain
  static async getLocationWithFallback(): Promise<ExternalGeoResult | null> {
    const methods = [
      () => this.getCombinedLocation(),
      () => this.getExternalLocation(),
      () => this.getBrowserGeolocation()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result && this.isValidLocation(result.coords)) {
          return result;
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  // Validate coordinates
  private static isValidLocation(coords: { lat: number; lng: number }): boolean {
    const { lat, lng } = coords;
    return lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180 && 
           !isNaN(lat) && !isNaN(lng) &&
           !(lat === 0 && lng === 0);
  }

  // Get multiple locations and average them
  static async getAveragedExternalLocation(): Promise<ExternalGeoResult | null> {
    try {
      // Get results from multiple services
      const services = [
        this.getIPAPILocation(),
        this.getGeoJSLocation(),
        this.getIPInfoLocation()
      ];

      const results = await Promise.allSettled(services);
      const validResults: ExternalGeoResult[] = [];

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          validResults.push(result.value);
        }
      }

      if (validResults.length === 0) {
        return null;
      }

      if (validResults.length === 1) {
        return validResults[0];
      }

      // Calculate average coordinates
      const avgLat = validResults.reduce((sum, r) => sum + r.coords.lat, 0) / validResults.length;
      const avgLng = validResults.reduce((sum, r) => sum + r.coords.lng, 0) / validResults.length;
      const avgAccuracy = validResults.reduce((sum, r) => sum + r.accuracy, 0) / validResults.length;

      return {
        coords: { lat: avgLat, lng: avgLng },
        accuracy: avgAccuracy,
        method: 'Averaged External APIs',
        provider: `${validResults.length} services combined`,
        city: validResults[0].city,
        country: validResults[0].country
      };

    } catch (error) {
      return null;
    }
  }
}

// Export main functions
export const getExternalLocation = ExternalGeoLocationService.getExternalLocation;
export const getCombinedLocation = ExternalGeoLocationService.getCombinedLocation;
export const getLocationWithFallback = ExternalGeoLocationService.getLocationWithFallback;
export const getAveragedExternalLocation = ExternalGeoLocationService.getAveragedExternalLocation;
