import type { CandleData, CryptoData } from '../types/crypto';

export const generateMockCryptoData = (): CryptoData[] => {
    return [
        {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400',
            rank: 1,
            price: 81237,
            change24h: -2.09963,
            marketCap: 1621663737391,
            volume24h: 56510685937,
            high24h: 84368,
            low24h: 80898,
            ath: 126080
        },
        {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
            rank: 2,
            price: 2533.24,
            change24h: -7.30263,
            marketCap: 305120886868,
            volume24h: 36682841990,
            high24h: 2753.01,
            low24h: 2517.95,
            ath: 4946.05
        },
        {
            id: 'tether',
            name: 'Tether',
            symbol: 'USDT',
            image: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661',
            rank: 3,
            price: 0.998583,
            change24h: 0.00655,
            marketCap: 185106467178,
            volume24h: 101686029463,
            high24h: 0.998699,
            low24h: 0.998257,
            ath: 1.32
        },
        {
            id: 'binancecoin',
            name: 'BNB',
            symbol: 'BNB',
            image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970',
            rank: 4,
            price: 809.83,
            change24h: -4.89691,
            marketCap: 110198542513,
            volume24h: 1860709175,
            high24h: 859.25,
            low24h: 806.57,
            ath: 1369.99
        },
        {
            id: 'ripple',
            name: 'XRP',
            symbol: 'XRP',
            image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442',
            rank: 5,
            price: 1.63,
            change24h: -7.60609,
            marketCap: 98999386079,
            volume24h: 4471285565,
            high24h: 1.78,
            low24h: 1.62,
            ath: 3.65
        },
        {
            id: 'usd-coin',
            name: 'USDC',
            symbol: 'USDC',
            image: 'https://coin-images.coingecko.com/coins/images/6319/large/USDC.png?1769615602',
            rank: 6,
            price: 0.999722,
            change24h: 0.00766,
            marketCap: 70034080808,
            volume24h: 11947927261,
            high24h: 0.999811,
            low24h: 0.999521,
            ath: 1.17
        },
        {
            id: 'solana',
            name: 'Solana',
            symbol: 'SOL',
            image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756',
            rank: 7,
            price: 108.92,
            change24h: -6.46007,
            marketCap: 61605853360,
            volume24h: 6508111283,
            high24h: 118.61,
            low24h: 108.81,
            ath: 293.31
        },
        {
            id: 'tron',
            name: 'TRON',
            symbol: 'TRX',
            image: 'https://coin-images.coingecko.com/coins/images/1094/large/tron-logo.png?1696502193',
            rank: 8,
            price: 0.287611,
            change24h: -1.37264,
            marketCap: 27238812375,
            volume24h: 746975023,
            high24h: 0.294849,
            low24h: 0.287585,
            ath: 0.431288
        },
        {
            id: 'staked-ether',
            name: 'Lido Staked Ether',
            symbol: 'STETH',
            image: 'https://coin-images.coingecko.com/coins/images/13442/large/steth_logo.png?1696513206',
            rank: 9,
            price: 2525.22,
            change24h: -7.76628,
            marketCap: 24127356650,
            volume24h: 36351180,
            high24h: 2749.31,
            low24h: 2517.78,
            ath: 4932.89
        },
        {
            id: 'dogecoin',
            name: 'Dogecoin',
            symbol: 'DOGE',
            image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png?1696501409',
            rank: 10,
            price: 0.106705,
            change24h: -7.62512,
            marketCap: 17976182266,
            volume24h: 1568768416,
            high24h: 0.118269,
            low24h: 0.106305,
            ath: 0.731578
        }
    ];
};

export const generateCandleData = (basePrice: number, count: number): CandleData[] => {
    const data: CandleData[] = [];
    let currentPrice = basePrice;
    const today = new Date();
    
    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);

        const time = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        const open = currentPrice;
        const change = (Math.random() - 0.5) * 0.1 * basePrice; // ±5% change
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.02 * basePrice;
        const low = Math.min(open, close) - Math.random() * 0.02 * basePrice;
        const volume = Math.random() * 1000000000 + 500000000;
        
        data.push({
            time: time,
            open,
            high,
            volume,
            low,
            close
        });
        
        currentPrice = close;
    }
    
    return data;
};