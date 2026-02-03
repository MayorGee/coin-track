export default class Formatter {
    static formatPrice(price: number | undefined | null, decimals: number = 2): string {

        if (price === undefined || price === null || isNaN(price)) {
            return '$0.00';
        }

        let decimalPlaces = decimals;
        
        if (price < 0.01) {
            decimalPlaces = 6;
        } else if (price < 1) {
            decimalPlaces = 4;
        } else if (price < 10) {
            decimalPlaces = 3;
        }

        if (price >= 1000) {
            return `$${price.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}`;
        }
        
        return `$${price.toLocaleString('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        })}`;
    }

    static formatLargeNumber(num: number | undefined | null): string {
        if (num === undefined || num === null || isNaN(num)) {
            return '$0';
        }

        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${this.formatPrice(num)}`;
    }

    static formatPercentage(change: number | undefined | null): string {
        if (change === undefined || change === null || isNaN(change)) {
            return '0.00%';
        }

        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    }

    static formatDate(timestamp: string): string {
        let date = new Date(timestamp);

        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    static formatDateTime(timestamp: number): string {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}