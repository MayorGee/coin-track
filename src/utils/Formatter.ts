export default class Formatter {
    static formatPrice(price: number): string {
        if (price >= 1000) {
            return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else if (price >= 1) {
            return `$${price.toFixed(2)}`;
        } else {
            return `$${price.toFixed(4)}`;
        }
    }

    static formatLargeNumber(number: number): string {
        if (number >= 1e12) {
            return `$${(number / 1e12).toFixed(2)}T`;
        } else if (number >= 1e9) {
            return `$${(number / 1e9).toFixed(2)}B`;
        } else if (number >= 1e6) {
            return `$${(number / 1e6).toFixed(2)}M`;
        } else if (number >= 1e3) {
            return `$${(number / 1e3).toFixed(2)}K`;
        }
        
        return `$${number.toFixed(2)}`;
    }

    static formatPercentage(percent: number):string {
        const sign = percent >= 0 ? '+' : '';

        return `${sign}${percent.toFixed(2)}%`;
    }

    static formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleDateString('en-US', {
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
  