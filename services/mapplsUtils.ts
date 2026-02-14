
import { MapplsSuggestion } from '../types';

declare global {
    interface Window {
        mappls: any;
    }
}

// Hardcoded Mappls JS Key for development/preview as per user request.
// Replace with process.env.VITE_MAPPLS_JS_KEY in production deployment.
// const MAPPLS_KEY = "gofqpbsvaasfedvhrekscaglwhttyubickde";

let loadPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Mappls SDK using the provided key.
 */
export const loadMapplsSDK = (): Promise<void> => {
    if (window.mappls) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
        const key = import.meta.env.VITE_MAPPLS_JS_KEY;

        if (!key) {
            console.error("Mappls JS Key is missing.");
            reject(new Error("Mappls JS Key is missing"));
            return;
        }

        const script = document.createElement('script');
        // Using the August 2025 onwards authentication mechanism (sdk.mappls.com)
        script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${key}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // Load plugins after core SDK using the documented format
            const plugins = document.createElement('script');
            // Standard plugin URL for the new SDK
            plugins.src = `https://sdk.mappls.com/map/sdk/plugins?v=3.0&access_token=${key}`;
            plugins.async = true;
            plugins.defer = true;
            plugins.onload = () => {
                console.log("Mappls SDK & Plugins Loaded Successfully");
                resolve();
            };
            plugins.onerror = () => {
                console.warn("Mappls Plugins failed to load, falling back to core SDK");
                resolve(); // Resolve so map still works even if clustering fails
            };
            document.head.appendChild(plugins);
        };
        script.onerror = () => reject(new Error("Failed to load Mappls SDK script. Please check your API key and Internet connection."));
        document.head.appendChild(script);
    });

    return loadPromise;
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    await loadMapplsSDK();
    return new Promise((resolve) => {
        try {
            if (!window.mappls?.ReverseGeocode) {
                resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                return;
            }
            new window.mappls.ReverseGeocode({ lat: lat, lng: lng }, (data: any) => {
                if (data && data.results && data.results.length > 0) {
                    resolve(data.results[0].formatted_address);
                } else {
                    resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
            });
        } catch (e) {
            console.error("Reverse Geocode Error:", e);
            resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    });
};

export const searchPlaces = async (query: string): Promise<MapplsSuggestion[]> => {
    await loadMapplsSDK();
    return new Promise((resolve) => {
        if (!query || query.length < 3) {
            resolve([]);
            return;
        }
        try {
            if (!window.mappls?.search) {
                resolve([]);
                return;
            }
            const options = {
                pod: 'City,Locality,POI',
                tokenizeAddress: true
            };
            new window.mappls.search(query, options, (data: any) => {
                if (data && Array.isArray(data)) {
                    const results = data.map((item: any) => ({
                        eLoc: item.eLoc,
                        placeName: item.placeName,
                        placeAddress: item.placeAddress,
                        latitude: item.latitude,
                        longitude: item.longitude
                    }));
                    resolve(results);
                } else {
                    resolve([]);
                }
            });
        } catch (e) {
            console.error("Search Error:", e);
            resolve([]);
        }
    });
};
