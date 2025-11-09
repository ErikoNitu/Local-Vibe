/**
 * Geocoding service to convert addresses to coordinates and vice versa
 * Uses Nominatim OpenStreetMap API
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Convert an address string to coordinates (latitude, longitude)
 * @param address The address string to search for
 * @returns Promise containing latitude and longitude
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address.trim()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.warn('No results found for address:', address);
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Convert coordinates to an address string (reverse geocoding)
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise containing the address string
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};
