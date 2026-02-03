export class LocalStorage {
    static setItem<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static getItem<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
}

export const StorageKeys = {
    WATCHLIST: 'coin-track-watchlist',
    SELECTED_COIN: 'coin-track-selected-coin',
    CHART_TIMEFRAME: 'coin-track-chart-timeframe',
    CHART_TYPE: 'crypto-dashboard-chart-type',
    CHART_INDICATOR: 'coin-track-chart-indicator',
    PORTFOLIO: 'coin-track-portfolio'
};