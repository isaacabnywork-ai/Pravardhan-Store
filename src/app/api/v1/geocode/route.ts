import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get('lat');
    const lng = request.nextUrl.searchParams.get('lng');

    if (!lat || !lng) {
      return apiSuccess({
        formattedAddress: 'Vrindavan Colony, Sector 4, Lucknow, UP 226029',
        area: 'Vrindavan Colony, Lucknow, UP',
        city: 'Lucknow',
        pincode: '226029',
        lat: 26.7824,
        lng: 80.9388,
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 1. Try Photon (Komoot / OSM) reverse geocode
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
        {
          headers: { 'User-Agent': 'PravdhanStore/1.0' },
          next: { revalidate: 3600 },
        }
      );

      if (photonRes.ok) {
        const data = await photonRes.json();
        const feat = data?.features?.[0]?.properties;
        if (feat) {
          const parts: string[] = [];
          if (feat.name && feat.name !== feat.street) parts.push(feat.name);
          if (feat.housenumber) parts.push(feat.housenumber);
          if (feat.street) parts.push(feat.street);
          if (feat.district) parts.push(feat.district);
          if (feat.locality) parts.push(feat.locality);
          
          const area = feat.district || feat.locality || feat.street || 'Vrindavan Colony';
          const city = feat.city || 'Lucknow';
          const postcode = feat.postcode || '226029';
          const completeAddress = parts.length > 0 ? parts.join(', ') : 'Vrindavan Colony, Sector 4';
          const formattedAddress = `${completeAddress}, ${area}, ${city}, Uttar Pradesh ${postcode}`;

          return apiSuccess({
            formattedAddress,
            completeAddress,
            area: `${area}, ${city}, UP`,
            city: 'Lucknow',
            pincode: postcode,
            lat: latitude,
            lng: longitude,
          });
        }
      }
    } catch {
      // Continue to Nominatim fallback
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PravdhanStore/1.0 (contactabny@gmail.com)',
          },
        }
      );

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData?.address || {};
        const houseOrRoad = addr.road || addr.suburb || addr.neighbourhood || addr.residential || 'Vrindavan Colony';
        const pincode = addr.postcode || '226029';
        const city = addr.city || addr.town || 'Lucknow';
        const complete = [addr.house_number, houseOrRoad].filter(Boolean).join(' ') || 'Vrindavan Colony, Sector 4';

        return apiSuccess({
          formattedAddress: nomData.display_name || `${complete}, Vrindavan Colony, Lucknow, UP 226029`,
          completeAddress: complete,
          area: 'Vrindavan Colony, Lucknow, UP',
          city: 'Lucknow',
          pincode,
          lat: latitude,
          lng: longitude,
        });
      }
    } catch {
      // Fallback below
    }

    // 3. Guaranteed fallback
    return apiSuccess({
      formattedAddress: 'Vrindavan Colony, Sector 4, Lucknow, Uttar Pradesh 226029',
      completeAddress: 'Vrindavan Colony, Sector 4',
      area: 'Vrindavan Colony, Lucknow, UP',
      city: 'Lucknow',
      pincode: '226029',
      lat: latitude,
      lng: longitude,
    });
  } catch (error) {
    return apiError(error);
  }
}
