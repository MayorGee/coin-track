import type{ CryptoData, CandleData, MarketStats } from "../types/crypto";

export const generateMockCryptoData = (): CryptoData[] => {
    return [
        {
            id: 'bitcoin',
            rank: 1,
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 43567.89,
            change24h: 2.34,
            marketCap: 853000000000,
            volume24h: 28500000000,
            high24h: 44120.50,
            low24h: 42890.30,
            ath: 69000.00,
            logo: '₿'
        },
        {
            id: 'ethereum',
            rank: 2,
            symbol: 'ETH',
            name: 'Ethereum',
            price: 2287.45,
            change24h: -1.23,
            marketCap: 275000000000,
            volume24h: 15200000000,
            high24h: 2315.80,
            low24h: 2265.20,
            ath: 4878.26,
            logo: 'Ξ'
        },
        {
            id: 'tether',
            rank: 3,
            symbol: 'USDT',
            name: 'Tether',
            price: 1.00,
            change24h: 0.01,
            marketCap: 95000000000,
            volume24h: 45000000000,
            high24h: 1.001,
            low24h: 0.999,
            ath: 1.32,
            logo: '₮'
        },
        {
            id: 'bnb',
            rank: 4,
            symbol: 'BNB',
            name: 'BNB',
            price: 312.67,
            change24h: 3.45,
            marketCap: 48000000000,
            volume24h: 1200000000,
            high24h: 318.90,
            low24h: 308.20,
            ath: 690.93,
            logo: 'ᗷ'
        },
        {
            id: 'solana',
            rank: 5,
            symbol: 'SOL',
            name: 'Solana',
            price: 98.34,
            change24h: 5.67,
            marketCap: 42000000000,
            volume24h: 2100000000,
            high24h: 101.20,
            low24h: 95.80,
            ath: 260.06,
            logo: '◎'
        },
        {
            id: 'xrp',
            rank: 6,
            symbol: 'XRP',
            name: 'XRP',
            price: 0.5234,
            change24h: -2.45,
            marketCap: 28000000000,
            volume24h: 1800000000,
            high24h: 0.5410,
            low24h: 0.5180,
            ath: 3.84,
            logo: 'X'
        },
        {
            id: 'cardano',
            rank: 7,
            symbol: 'ADA',
            name: 'Cardano',
            price: 0.4567,
            change24h: 1.89,
            marketCap: 16000000000,
            volume24h: 780000000,
            high24h: 0.4680,
            low24h: 0.4450,
            ath: 3.09,
            logo: '₳'
        },
        {
            id: 'dogecoin',
            rank: 8,
            symbol: 'DOGE',
            name: 'Dogecoin',
            price: 0.0812,
            change24h: 4.23,
            marketCap: 11500000000,
            volume24h: 650000000,
            high24h: 0.0835,
            low24h: 0.0795,
            ath: 0.7376,
            logo: 'Ð'
        },
        {
            id: 'tron',
            rank: 9,
            symbol: 'TRX',
            name: 'TRON',
            price: 0.1045,
            change24h: -0.67,
            marketCap: 9200000000,
            volume24h: 420000000,
            high24h: 0.1065,
            low24h: 0.1032,
            ath: 0.2316,
            logo: 'T'
        },
        {
            id: 'avalanche',
            rank: 10,
            symbol: 'AVAX',
            name: 'Avalanche',
            price: 36.78,
            change24h: 2.91,
            marketCap: 14000000000,
            volume24h: 580000000,
            high24h: 37.50,
            low24h: 35.80,
            ath: 146.22,
            logo: 'Λ'
        }
    ];
};

export const generateCandleData = (basePrice: number, days: number = 30): CandleData[] => {
  const data: CandleData[] = [];
  let currentPrice = basePrice * 0.85; // Start 15% lower
  const now = Date.now();
  const interval = 24 * 60 * 60 * 1000; // 1 day

  for (let i = days; i >= 0; i--) {
    const open = currentPrice;
    const volatility = basePrice * 0.03; // 3% volatility
    const change = (Math.random() - 0.5) * volatility * 2;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000000000 + 500000000;

    data.push({
      timestamp: now - (i * interval),
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  return data;
};

export const getMarketStats = (cryptoData: CryptoData[]): MarketStats => {
  const totalMarketCap = cryptoData.reduce((sum, coin) => sum + coin.marketCap, 0);
  const total24hVolume = cryptoData.reduce((sum, coin) => sum + coin.volume24h, 0);
  const btcMarketCap = cryptoData.find(c => c.id === 'bitcoin')?.marketCap || 0;
  const btcDominance = (btcMarketCap / totalMarketCap) * 100;

  return {
    totalMarketCap,
    total24hVolume,
    btcDominance
  };
};

export const updatePriceWithVolatility = (price: number, volatility: number = 0.002): number => {
  // Generate realistic price movement (±0.2% by default)
  const change = (Math.random() - 0.5) * 2 * volatility * price;
  return price + change;
};
