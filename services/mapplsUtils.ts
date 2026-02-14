
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
            console.error("Mappls JS Key is missing from environment variables.");
            reject(new Error("Mappls JS Key is missing. Please set VITE_MAPPLS_JS_KEY in your env."));
            return;
        }

        const script = document.createElement('script');
        // Removing crossOrigin and unnecessary defer to ensure standard auth header/referer behavior
        script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${key}`;
        script.async = true;

        script.onload = () => {
            console.log("Mappls Core SDK loaded successfully");
            // Load plugins after core SDK
            const plugins = document.createElement('script');
            plugins.src = `https://sdk.mappls.com/map/sdk/plugins?v=3.0&access_token=${key}`;
            plugins.async = true;
            plugins.onload = () => {
                console.log("Mappls Plugins loaded successfully");
                resolve();
            };
            plugins.onerror = () => {
                console.warn("Mappls Plugins failed to load, falling back to core map");
                resolve();
            };
            document.head.appendChild(plugins);
        };

        script.onerror = () => {
            const maskedKey = key.substring(0, 5) + "..." + key.substring(key.length - 3);
            reject(new Error(`Failed to load Mappls SDK (401). Verify that "${window.location.origin}" is whitelisted for Key: ${maskedKey}.`));
        };

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
