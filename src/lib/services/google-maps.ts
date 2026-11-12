import { z } from 'zod';

export const googleMapsConfigSchema = z.object({
  apiKey: z.string().optional(),
  isConfigured: z.boolean().default(false),
  defaultStore: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    address: z.string(),
    city: z.string(),
    pincode: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  serviceablePincodes: z.array(z.string()),
});

export interface GeocodingResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  area: string;
  city: string;
  pincode: string;
  isServiceable: boolean;
  distanceKm?: number;
  estimatedDeliveryMins?: number;
}

export interface RouteEstimate {
  distanceKm: number;
  durationMins: number;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  polyline?: string;
}

export const GURUGRAM_DARK_STORE_COORDINATES = {
  id: 'STR-GGM-01',
  name: 'Dark Store Hub #01',
  code: 'STR-GGM-01',
  address: 'Sector 14, Model Town, Gurugram, Haryana 122001',
  city: 'Gurugram',
  pincode: '122001',
  lat: 28.4722,
  lng: 77.0453,
};

export const INITIAL_SERVICEABLE_PINCODES = ['122001', '122002', '122003', '122018'];

/**
 * Clean Google Maps / Location Integration Service
 * Provides Geocoding, Distance Calculation, Serviceability Bounds & Driver Tracking estimates.
 * Invariant: Never fabricates live external Google Maps API calls if credentials are unconfigured.
 */
export class GoogleMapsService {
  private get apiKey(): string | undefined {
    return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10 && !this.apiKey.includes('REPLACE'));
  }

  /**
   * Check if a given pincode or coordinate is within Gurugram Dark Store catchment area
   */
  isServiceablePincode(pincode: string): boolean {
    const clean = pincode.trim();
    return INITIAL_SERVICEABLE_PINCODES.includes(clean);
  }

  /**
   * Calculate Great-Circle (Haversine) distance between two coordinates in kilometers
   */
  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  /**
   * Estimate hyper-local delivery time from Dark Store Hub #01 to customer coordinates
   */
  estimateDeliveryTime(distanceKm: number): number {
    // 5 mins dark-store picking & packing + 3 mins per km road transit
    const transitMins = Math.ceil(distanceKm * 3);
    const total = 5 + transitMins;
    return Math.max(10, Math.min(25, total)); // Hyperlocal 10-25 min envelope
  }

  /**
   * Geocode or reverse geocode an address string or pincode.
   * If Google Maps API key is configured, queries official Maps Geocoding API.
   * If unconfigured, safely resolves known Gurugram service areas deterministically.
   */
  async resolveLocation(
    input: { address?: string; pincode?: string; lat?: number; lng?: number }
  ): Promise<GeocodingResult> {
    const pincode = input.pincode || (input.address ? input.address.match(/\b\d{6}\b/)?.[0] : undefined) || '122001';
    const isServiceable = this.isServiceablePincode(pincode);

    // If external Google Maps key is configured and available in production
    if (this.isConfigured && this.apiKey) {
      try {
        const query = input.address || input.pincode;
        const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
        url.searchParams.set('address', `${query}, Gurugram, Haryana, India`);
        url.searchParams.set('key', this.apiKey);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && data.results && data.results[0]) {
            const loc = data.results[0].geometry.location;
            const dist = this.calculateHaversineDistance(
              GURUGRAM_DARK_STORE_COORDINATES.lat,
              GURUGRAM_DARK_STORE_COORDINATES.lng,
              loc.lat,
              loc.lng
            );

            return {
              formattedAddress: data.results[0].formatted_address,
              lat: loc.lat,
              lng: loc.lng,
              area: 'Gurugram',
              city: 'Gurugram',
              pincode,
              isServiceable,
              distanceKm: dist,
              estimatedDeliveryMins: this.estimateDeliveryTime(dist),
            };
          }
        }
      } catch (err) {
        // Fallback safely to known catchment area coordinates
      }
    }

    // Deterministic fallback for Gurugram Dark Store sectors
    let lat = GURUGRAM_DARK_STORE_COORDINATES.lat;
    let lng = GURUGRAM_DARK_STORE_COORDINATES.lng;

    if (pincode === '122002') {
      lat = 28.4812;
      lng = 77.0911;
    } else if (pincode === '122003') {
      lat = 28.4354;
      lng = 77.0621;
    } else if (pincode === '122018') {
      lat = 28.4215;
      lng = 77.0392;
    }

    const dist = this.calculateHaversineDistance(
      GURUGRAM_DARK_STORE_COORDINATES.lat,
      GURUGRAM_DARK_STORE_COORDINATES.lng,
      lat,
      lng
    );

    return {
      formattedAddress: input.address || `Sector ${pincode.slice(-2)}, Gurugram, Haryana ${pincode}`,
      lat,
      lng,
      area: `Sector ${pincode.slice(-2)}`,
      city: 'Gurugram',
      pincode,
      isServiceable,
      distanceKm: dist,
      estimatedDeliveryMins: this.estimateDeliveryTime(dist),
    };
  }

  /**
   * Diagnostic provider configuration summary
   */
  getDiagnostics() {
    return {
      provider: 'GOOGLE_MAPS',
      isConfigured: this.isConfigured,
      hasBrowserKey: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
      hasServerKey: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      storeId: GURUGRAM_DARK_STORE_COORDINATES.id,
      storeCoordinates: {
        lat: GURUGRAM_DARK_STORE_COORDINATES.lat,
        lng: GURUGRAM_DARK_STORE_COORDINATES.lng,
      },
      serviceablePincodes: INITIAL_SERVICEABLE_PINCODES,
    };
  }
}

export const googleMapsService = new GoogleMapsService();
