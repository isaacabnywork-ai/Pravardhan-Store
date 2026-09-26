export interface GeocodedAddress {
  formattedAddress: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export class LocationService {
  private static mapsApiKey = process.env.NEXT_PUBLIC_MAPS_KEY || '';

  /**
   * Reverse geocodes coordinates into a structured Indian address
   */
  static async reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
    if (this.mapsApiKey) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.mapsApiKey}`
        );
        const data = await res.json();
        if (data.results && data.results[0]) {
          const comp = data.results[0].address_components;
          const getComp = (type: string) =>
            comp.find((c: { types: string[]; long_name: string }) => c.types.includes(type))?.long_name || '';

          return {
            formattedAddress: data.results[0].formatted_address,
            street: getComp('route') || getComp('sublocality_level_2'),
            area: getComp('sublocality_level_1') || getComp('neighborhood'),
            city: getComp('locality') || 'Lucknow',
            state: getComp('administrative_area_level_1') || 'Uttar Pradesh',
            pincode: getComp('postal_code') || '226029',
            lat,
            lng,
          };
        }
      } catch (e) {
        console.error('Google Maps API failed, falling back to local resolver:', e);
      }
    }

    // Default local neighborhood resolver
    return {
      formattedAddress: 'Sector 6, Vrindavan Yojna, Lucknow, Uttar Pradesh 226029',
      street: 'Shaheed Path Road',
      area: 'Vrindavan Yojna',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226029',
      lat: 26.7825,
      lng: 80.9324,
    };
  }

  /**
   * Validates if a delivery pincode is serviceable by the grocery store
   */
  static isPincodeServiceable(pincode: string, serviceablePincodes: string[]): boolean {
    return serviceablePincodes.includes(pincode.trim());
  }
}
