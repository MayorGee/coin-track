export interface CryptoData {
    id: string;
    name: string;
    symbol: string;
    image: string;
    rank: number;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    ath: number;
}

export interface ApiCoin {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    price_change_percentage_24h: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    ath: number;
}

export interface CandleData {
    time: string;
    open: number;
    volume: number;
    high: number;
    low: number;
    close: number;
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

export interface MainChartProps {
    selectedCoin: CryptoData;
    candleData: CandleData[];
}

export interface CoinStatsProps {
    coin: CryptoData;
}

export interface CryptoTableProps {
    cryptoData: CryptoData[];
    onSelectCoin: (coin: CryptoData) => void;
    selectedCoinId: string;
    onAddToWatchlist: (coinId: string) => void;
    watchlist: string[];
}

export interface PortfolioSimulatorProps {
    cryptoData: CryptoData[];
}

export interface TickerTapeProps {
    cryptoData: CryptoData[];
}

export interface WatchlistProps {
    watchlist: string[];
    cryptoData: CryptoData[];
    onRemoveFromWatchlist: (coinId: string) => void;
    onAddToWatchlist: (coinId: string) => void;
    onSelectCoin: (coin: CryptoData) => void;
}

export type SortKey = 'rank' | 'name' | 'price' | 'change24h' | 'marketCap';
export type SortDirection = 'asc' | 'desc';
export type TimeFrame = '1H' | '4H' | '1D' | '1W' | '1M';
export type ChartIndicator = 'None' | 'SMA' | 'RSI';