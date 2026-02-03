import axios from 'axios';
import type { ApiCoin, CandleData, TimeFrame } from '../types/crypto';
import Environment from '../Environment';

export default class ApiClient {
    private apiKey: string | null;   

    constructor () {
        this.apiKey = Environment.getCoingeckoApiKey() as string;
    }

    private async fetchData(): Promise<ApiCoin[]> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.apiKey) {
                headers['x-cg-demo-api-key'] = this.apiKey;
            }

            const response = await axios.get<ApiCoin[]>(
                'https://api.coingecko.com/api/v3/coins/markets',
                {
                    params: {
                        vs_currency: 'usd',
                        order: 'market_cap_desc',
                        per_page: 20,
                        page: 1,
                        sparkline: false,
                        price_change_percentage: '24h,7d'
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
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

    public async getChartData(coinId: string, timeFrame: TimeFrame): Promise<CandleData[]> {
        try {
            // Map timeframe to CoinGecko days parameter
            const timeFrameMap: Record<TimeFrame, number> = {
                '1H': 1,    // 1 day  
                '4H': 1,    
                '1D': 7,    
                '1W': 30,   
                '1M': 90,   
            };

            const days = timeFrameMap[timeFrame];
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.apiKey) {
                headers['x-cg-demo-api-key'] = this.apiKey;
            }

            const response = await axios.get<any>(
                `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
                {
                    params: {
                        vs_currency: 'usd',
                        days: days,
                    },
                    headers,
                }
            );

            // Transform CoinGecko response to our CandleData format
            return this.transformAndAggregateChartData(response.data, timeFrame);
            
        } catch (error) {
            console.error('Chart API Error:', error);
            return this.generateMockChartData(timeFrame);
        }
    }

    private transformAndAggregateChartData(apiData: any, timeFrame: TimeFrame): CandleData[] {
        const prices = apiData.prices || [];
        const volumes = apiData.total_volumes || [];
        
        let candles: CandleData[] = [];
        
        // Create minute/hourly candles from API data
        for (let i = 0; i < prices.length; i++) {
            const [timestamp, price] = prices[i];
            const volume = volumes[i] ? volumes[i][1] : 0;
            
            candles.push({
                time: new Date(timestamp).toISOString(),
                open: price,
                high: price,
                low: price,
                close: price,
                volume: volume
            });
        }
        
        // Aggregate based on timeframe
        return this.aggregateToTimeFrame(candles, timeFrame);
    }
    

    private aggregateToTimeFrame(candles: CandleData[], timeFrame: TimeFrame): CandleData[] {
        if (candles.length === 0) return [];
        
        // Sort by time
        candles.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        
        // Determine aggregation parameters based on timeframe
        const aggregationConfig = {
            '1H': { minutes: 60, maxPoints: 24 },      // 24 hours of 1-hour candles
            '4H': { minutes: 240, maxPoints: 42 },     // 7 days of 4-hour candles (42 periods)
            '1D': { minutes: 1440, maxPoints: 30 },    // 30 days of daily candles
            '1W': { minutes: 10080, maxPoints: 12 },   // 12 weeks
            '1M': { minutes: 43200, maxPoints: 12 },   // 12 months
        };
        
        const config = aggregationConfig[timeFrame];
        const aggregated: CandleData[] = [];
        
        // Group candles by time period
        let currentGroup: CandleData[] = [];
        let groupStartTime: Date | null = null;
        
        for (const candle of candles) {
            const candleTime = new Date(candle.time);
            
            if (!groupStartTime) {
                groupStartTime = candleTime;
                currentGroup = [candle];
            } else {
                const minutesDiff = (candleTime.getTime() - groupStartTime.getTime()) / (1000 * 60);
                
                if (minutesDiff < config.minutes) {
                    currentGroup.push(candle);
                } else {
                    // Aggregate the completed group
                    aggregated.push(this.aggregateCandleGroup(currentGroup, groupStartTime));
                    
                    // Start new group
                    groupStartTime = candleTime;
                    currentGroup = [candle];
                }
            }
        }
        
        // Add last group if exists
        if (currentGroup.length > 0 && groupStartTime) {
            aggregated.push(this.aggregateCandleGroup(currentGroup, groupStartTime));
        }
        
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

    private generateMockChartData(timeFrame: TimeFrame): CandleData[] {
        const basePrice = 50000; // Example base price
        const candles: CandleData[] = [];
        const now = new Date();
        
        const periods = {
            '1H': 24,   // 24 hours
            '4H': 24,   // 6 four-hour periods
            '1D': 30,   // 30 days
            '1W': 12,   // 12 weeks
            '1M': 12    // 12 months
        };
        
        const count = periods[timeFrame];
        
        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now);
            
            // Set time based on timeframe
            if (timeFrame === '1H') {
                time.setHours(now.getHours() - i);
            } else if (timeFrame === '4H') {
                time.setHours(now.getHours() - (i * 4));
            } else if (timeFrame === '1D') {
                time.setDate(now.getDate() - i);
            } else if (timeFrame === '1W') {
                time.setDate(now.getDate() - (i * 7));
            } else { // 1M
                time.setMonth(now.getMonth() - i);
            }
            
            const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
            const price = basePrice * (1 + priceChange);
            
            candles.push({
                time: time.toISOString(),
                open: price * 0.99,
                high: price * 1.02,
                low: price * 0.98,
                close: price,
                volume: Math.random() * 1000000 + 500000
            });
        }
        
        return candles.reverse();
    }
}