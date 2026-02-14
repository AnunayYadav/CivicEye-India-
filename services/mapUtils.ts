
import { MapplsSuggestion } from '../types';

/**
 * Geocoding using Nominatim (OpenStreetMap)
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
                'Accept-Language': 'en'
            }
        });
        const data = await response.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) {
        console.error("Reverse Geocode Error:", e);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

export const searchPlaces = async (query: string): Promise<MapplsSuggestion[]> => {
    if (!query || query.length < 3) return [];
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
            headers: {
                'Accept-Language': 'en'
            }
        });
        const data = await response.json();
        return data.map((item: any) => ({
            eLoc: item.place_id.toString(),
            placeName: item.display_name.split(',')[0],
            placeAddress: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
        }));
    } catch (e) {
        console.error("Search Error:", e);
        return [];
    }
};

export const loadMapService = async (): Promise<void> => {
    // Leaflet is loaded via npm, so this is just a placeholder to keep code structure
    return Promise.resolve();
};
