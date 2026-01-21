export interface CryptoData {
    id: string;
    rank: number;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    ath: number;
    logo: string;
}

export interface CandleData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketStats {
    totalMarketCap: number;
    total24hVolume: number;
    btcDominance: number;
}

export interface PortfolioItem {
    coinId: string;
    amount: number;
    investedValue: number;
}

export interface HeaderProps {
    marketStats: MarketStats;
    isConnected: boolean;
}
