import axios from 'axios';
import type { ApiCoin, CandleData, TimeFrame } from '../types/crypto';
import Environment from '../Environment';

export interface ChartDataResult {
    candles: CandleData[];
    isFallback: boolean;
}

export default class ApiClient {
    private apiKey: string | null;   

    constructor () {
        const rawKey = (Environment.getCoingeckoApiKey() || '').trim();
        const isPlaceholder =
            rawKey.length === 0 ||
            rawKey.toLowerCase() === 'your_api_key' ||
            rawKey.toLowerCase() === 'demo_api_key';
        this.apiKey = isPlaceholder ? null : rawKey;
    }

    private getHeaders(includeApiKey = true): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (includeApiKey && this.apiKey) {
            headers['x-cg-demo-api-key'] = this.apiKey;
        }

        return headers;
    }

    private shouldRetryWithoutKey(error: unknown): boolean {
        return Boolean(
            this.apiKey &&
            axios.isAxiosError(error) &&
            error.response?.status === 401
        );
    }

    private async getWithAuthRetry<T>(url: string, params: Record<string, string | number>): Promise<T> {
        try {
            const response = await axios.get<T>(url, {
                params,
                headers: this.getHeaders(true),
            });
            return response.data;
        } catch (error) {
            if (!this.shouldRetryWithoutKey(error)) {
                throw error;
            }

            const response = await axios.get<T>(url, {
                params,
                headers: this.getHeaders(false),
            });
            return response.data;
        }
    }

    private async fetchData(): Promise<ApiCoin[]> {
        try {
            const data = await this.getWithAuthRetry<ApiCoin[]>(
                'https://api.coingecko.com/api/v3/coins/markets',
                {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 20,
                    page: 1,
                    sparkline: 'false',
                    price_change_percentage: '24h,7d',
                },
            );

            return data;
        } catch (error: any) {
            console.error('API Error:', error.response?.status, error.message);

            return [];
        }
    }

    public async getCryptoTableData() {
        try {
            const responseData = await this.fetchData();
            
            if (responseData.length === 0) {
                throw new Error('No data received from API');
            }

            return responseData.map((coin: ApiCoin) => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol.toUpperCase(),
                image: coin.image,
                rank: coin.market_cap_rank,
                price: coin.current_price,
                change24h: coin.price_change_percentage_24h,
                marketCap: coin.market_cap,
                volume24h: coin.total_volume,
                high24h: coin.high_24h,
                low24h: coin.low_24h,
                ath: coin.ath
            }));

        } catch (error) {
            console.error('Failed to get crypto data:', error);
            throw error; 
        }
    }

    public async getChartData(coinId: string, timeFrame: TimeFrame, fallbackBasePrice?: number): Promise<ChartDataResult> {
        // Map timeframe to CoinGecko days parameter
        const marketChartDaysMap: Record<TimeFrame, number | 'max'> = {
            '1H': 7,      // 7 days -> denser intraday history
            '4H': 30,     // 30 days
            '1D': 180,    // ~6 months of daily candles
            '1W': 'max',  // use full range, then aggregate
            '1M': 'max',  // use full range, then aggregate
        };
        const ohlcDaysMap: Record<TimeFrame, number | null> = {
            '1H': 7,
            '4H': 30,
            '1D': 180,
            '1W': 365,
            '1M': null, // skip OHLC for this range and use market_chart aggregation
        };
        const marketDays = marketChartDaysMap[timeFrame];
        const ohlcDays = ohlcDaysMap[timeFrame];

        try {
            if (ohlcDays !== null) {
                const [ohlcData, marketChartData] = await Promise.all([
                    this.getWithAuthRetry<any>(
                        `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
                        {
                            vs_currency: 'usd',
                            days: ohlcDays,
                        }
                    ),
                    this.getWithAuthRetry<any>(
                        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
                        {
                            vs_currency: 'usd',
                            days: marketDays,
                        }
                    ),
                ]);

                // Use real OHLC candles and align volume from market_chart
                return {
                    candles: this.transformAndAggregateChartData(
                        ohlcData,
                        marketChartData?.total_volumes || [],
                        timeFrame
                    ),
                    isFallback: false,
                };
            }

            const marketChartData = await this.getWithAuthRetry<any>(
                `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
                {
                    vs_currency: 'usd',
                    days: marketDays,
                }
            );

            return {
                candles: this.transformMarketChartToCandles(marketChartData, timeFrame),
                isFallback: false,
            };
            
        } catch (error) {
            console.error('Chart API Error (OHLC path):', error);

            // Fallback to market_chart aggregation when OHLC endpoint fails or is unavailable.
            try {
                const marketChartData = await this.getWithAuthRetry<any>(
                    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
                    {
                        vs_currency: 'usd',
                        days: marketDays,
                    }
                );

                return {
                    candles: this.transformMarketChartToCandles(marketChartData, timeFrame),
                    isFallback: false,
                };
            } catch (marketError) {
                console.error('Chart API Error (market_chart fallback):', marketError);
                // Last-resort fallback for UI continuity when API access is unavailable.
                return {
                    candles: this.generateMockChartData(timeFrame, fallbackBasePrice),
                    isFallback: true,
                };
            }
        }
    }

    private transformAndAggregateChartData(ohlcData: any, totalVolumes: any[], timeFrame: TimeFrame): CandleData[] {
        const ohlcRows = Array.isArray(ohlcData) ? ohlcData : [];
        const volumes = Array.isArray(totalVolumes) ? totalVolumes : [];
        
        let candles: CandleData[] = [];
        
        // Create candles directly from CoinGecko OHLC endpoint data:
        // [timestamp, open, high, low, close]
        for (const row of ohlcRows) {
            if (!Array.isArray(row) || row.length < 5) continue;
            const [timestamp, open, high, low, close] = row;
            const volume = this.findNearestVolume(volumes, Number(timestamp));

            candles.push({
                time: new Date(timestamp).toISOString(),
                open: Number(open) || 0,
                high: Number(high) || 0,
                low: Number(low) || 0,
                close: Number(close) || 0,
                volume,
            });
        }
        
        // Aggregate based on timeframe
        return this.aggregateToTimeFrame(candles, timeFrame);
    }

    private findNearestVolume(volumes: any[], targetTimestamp: number): number {
        if (!Array.isArray(volumes) || volumes.length === 0) return 0;

        let nearest = volumes[0];
        let nearestDiff = Math.abs(Number(nearest[0]) - targetTimestamp);

        for (let i = 1; i < volumes.length; i++) {
            const diff = Math.abs(Number(volumes[i][0]) - targetTimestamp);
            if (diff < nearestDiff) {
                nearest = volumes[i];
                nearestDiff = diff;
            }
        }

        return Number(nearest[1]) || 0;
    }

    private transformMarketChartToCandles(apiData: any, timeFrame: TimeFrame): CandleData[] {
        const prices = Array.isArray(apiData?.prices) ? apiData.prices : [];
        const totalVolumes = Array.isArray(apiData?.total_volumes) ? apiData.total_volumes : [];
        if (prices.length === 0) return [];

        const bucketMinutes = {
            '1H': 60,
            '4H': 240,
            '1D': 1440,
            '1W': 10080,
            '1M': 43200,
        }[timeFrame];
        const bucketMs = bucketMinutes * 60 * 1000;

        const bucketMap = new Map<number, { prices: number[]; volume: number }>();

        for (const priceRow of prices) {
            if (!Array.isArray(priceRow) || priceRow.length < 2) continue;
            const timestamp = Number(priceRow[0]);
            const price = Number(priceRow[1]);
            if (!Number.isFinite(timestamp) || !Number.isFinite(price)) continue;

            const bucketStart = Math.floor(timestamp / bucketMs) * bucketMs;
            const existing = bucketMap.get(bucketStart) || { prices: [], volume: 0 };
            existing.prices.push(price);
            bucketMap.set(bucketStart, existing);
        }

        for (const volumeRow of totalVolumes) {
            if (!Array.isArray(volumeRow) || volumeRow.length < 2) continue;
            const timestamp = Number(volumeRow[0]);
            const volume = Number(volumeRow[1]);
            if (!Number.isFinite(timestamp) || !Number.isFinite(volume)) continue;

            const bucketStart = Math.floor(timestamp / bucketMs) * bucketMs;
            const existing = bucketMap.get(bucketStart);
            if (existing) {
                existing.volume += volume;
            }
        }

        const candles = Array.from(bucketMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([bucketStart, bucket]) => {
                const first = bucket.prices[0];
                const last = bucket.prices[bucket.prices.length - 1];
                const high = Math.max(...bucket.prices);
                const low = Math.min(...bucket.prices);

                return {
                    time: new Date(bucketStart).toISOString(),
                    open: first,
                    high,
                    low,
                    close: last,
                    volume: bucket.volume,
                };
            });

        return this.aggregateToTimeFrame(candles, timeFrame);
    }
    

    private aggregateToTimeFrame(candles: CandleData[], timeFrame: TimeFrame): CandleData[] {
        if (candles.length === 0) return [];
        
        // Sort by time
        candles.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        
        // Determine aggregation parameters based on timeframe
        const aggregationConfig = {
            '1H': { minutes: 60, maxPoints: 120 },      // up to 5 days of 1h candles
            '4H': { minutes: 240, maxPoints: 120 },     // up to 20 days of 4h candles
            '1D': { minutes: 1440, maxPoints: 180 },    // up to ~6 months daily
            '1W': { minutes: 10080, maxPoints: 156 },   // up to ~3 years weekly
            '1M': { minutes: 43200, maxPoints: 120 },   // up to 10 years monthly
        };
        
        const config = aggregationConfig[timeFrame];
        const bucketMs = config.minutes * 60 * 1000;
        const buckets = new Map<number, CandleData[]>();

        // Bucket candles by fixed interval boundaries to keep consistent OHLC grouping.
        for (const candle of candles) {
            const ts = new Date(candle.time).getTime();
            const bucketStart = Math.floor(ts / bucketMs) * bucketMs;
            const group = buckets.get(bucketStart) || [];
            group.push(candle);
            buckets.set(bucketStart, group);
        }

        const aggregated = Array.from(buckets.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([bucketStart, group]) => this.aggregateCandleGroup(group, new Date(bucketStart)));
        
        // Limit to max points and ensure we have the most recent data
        return aggregated.slice(-config.maxPoints);
    }

    private aggregateCandleGroup(group: CandleData[], groupStartTime: Date): CandleData {
        if (group.length === 0) {
            return {
                time: groupStartTime.toISOString(),
                open: 0,
                high: 0,
                low: 0,
                close: 0,
                volume: 0
            };
        }
        
        // Simple aggregation: first open, last close, min low, max high, sum volume
        return {
            time: groupStartTime.toISOString(),
            open: group[0].open,
            high: Math.max(...group.map(c => c.high)),
            low: Math.min(...group.map(c => c.low)),
            close: group[group.length - 1].close,
            volume: group.reduce((sum, c) => sum + c.volume, 0)
        };
    }

    private generateMockChartData(timeFrame: TimeFrame, basePriceHint?: number): CandleData[] {
        const periods = {
            '1H': 120,
            '4H': 120,
            '1D': 180,
            '1W': 156,
            '1M': 120,
        };
        const timeframeMs = {
            '1H': 60 * 60 * 1000,
            '4H': 4 * 60 * 60 * 1000,
            '1D': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000,
            '1M': 30 * 24 * 60 * 60 * 1000,
        };

        const count = periods[timeFrame];
        const stepMs = timeframeMs[timeFrame];
        const now = Date.now();
        const candles: CandleData[] = [];

        const normalizedBase =
            typeof basePriceHint === 'number' && Number.isFinite(basePriceHint) && basePriceHint > 0
                ? basePriceHint
                : 45000 + Math.random() * 10000;
        let lastClose = normalizedBase;
        const volatility = timeFrame === '1H' || timeFrame === '4H' ? 0.01 : 0.018;

        for (let i = count - 1; i >= 0; i--) {
            const timestamp = now - i * stepMs;
            const open = lastClose;
            const drift = (Math.random() - 0.5) * volatility * 2;
            const close = open * (1 + drift);
            const wickUp = Math.random() * volatility * 0.9;
            const wickDown = Math.random() * volatility * 0.9;
            const high = Math.max(open, close) * (1 + wickUp);
            const low = Math.min(open, close) * (1 - wickDown);

            candles.push({
                time: new Date(timestamp).toISOString(),
                open,
                high,
                low,
                close,
                volume: 250000 + Math.random() * 5000000,
            });

            lastClose = close;
        }

        return candles;
    }

}