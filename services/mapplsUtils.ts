import { MapplsSuggestion } from '../types';

declare global {
  interface Window {
    mappls: any;
  }
}

let loadPromise: Promise<void> | null = null;

export const loadMapplsSDK = (): Promise<void> => {
  if (window.mappls) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const key = (import.meta as any).env.VITE_MAPPLS_JS_KEY;
    if (!key) {
      reject(new Error("VITE_MAPPLS_JS_KEY is missing"));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk?layer=vector&v=3.0`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
        const plugins = document.createElement('script');
        plugins.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk_plugins?v=3.0`;
        plugins.async = true;
        plugins.defer = true;
        plugins.onload = () => resolve();
        plugins.onerror = () => reject(new Error("Failed to load Mappls Plugins"));
        document.head.appendChild(plugins);
    };
    script.onerror = () => reject(new Error("Failed to load Mappls SDK"));
    document.head.appendChild(script);
  });
  return loadPromise;
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    await loadMapplsSDK();
    return new Promise((resolve) => {
        try {
            // @ts-ignore
            new window.mappls.ReverseGeocode({ lat: lat, lng: lng }, (data: any) => {
                 if (data && data.results && data.results.length > 0) {
                     resolve(data.results[0].formatted_address);
                 } else {
                     resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                 }
            });
        } catch (e) {
            console.error("RevGeo Error", e);
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
             const options = {
                 pod: 'City,Locality,POI',
                 tokenizeAddress: true
             };
             // @ts-ignore
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
            console.error("Search Error", e);
            resolve([]);
        }
    });
};