export default class Environment {
    static getCoingeckoApiKey(): string | undefined {
        return import.meta.env.VITE_COINGECKO_API_KEY || '';
    }

    static getCoingeckoApiUrl(): string | undefined {
        return import.meta.env.VITE_COINGECKO_API_URL || '';
    }

    static getCoingeckoApiCacheDuration(): number {
        return Number(import.meta.env.VITE_API_CACHE_DURATION);
    }
}