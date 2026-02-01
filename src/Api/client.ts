import axios from 'axios';
import type { ApiCoin } from '../types/crypto';
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
}