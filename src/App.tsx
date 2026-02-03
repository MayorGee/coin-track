import { useEffect, useState } from "react";
import type { CryptoData } from "./types/crypto";
import { generateMockCryptoData } from "./utils/MockData";
import { LocalStorage, StorageKeys } from "./utils/LocalStorage";
import Header  from "./components/Header";
import TickerTape from "./components/TickerTape";
import MainChart from "./components/MainChart";
import CoinStats from "./components/CoinStats";
import CryptoTable from "./components/CryptoTable";
import Watchlist from "./components/Watchlist";
import PortfolioSimulator from "./components/PortfolioSimulator";
import ApiClient from "./Api/client";

import './scss/index.scss';

const App = () =>  {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
    const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [watchlist, setWatchlist] = useState<string[]>(
        () => LocalStorage.getItem<string[]>(
            StorageKeys.WATCHLIST, ['bitcoin', 'ethereum']
        )
    );

    useEffect(() => {
        LocalStorage.setItem(StorageKeys.WATCHLIST, watchlist);
    }, [watchlist]);

    useEffect(() => {
        if (selectedCoin) {
            LocalStorage.setItem(StorageKeys.SELECTED_COIN, selectedCoin.id);
        }
    }, [selectedCoin]);

    useEffect(() => {
        const apiClient = new ApiClient();

        const fetchAllData = async () => {
            setLoading(true);

            try {
                const data = await apiClient.getCryptoTableData();

                if (data.length > 0) {
                    setCryptoData(data);

                    const savedCoinId = LocalStorage.getItem<string>(StorageKeys.SELECTED_COIN, 'bitcoin');
                    const savedCoin = data.find(coin => coin.id === savedCoinId) || data[0];

                    setSelectedCoin(savedCoin);
                    setIsConnected(true);
                } else {
                    const mockData = generateMockCryptoData();
                    setCryptoData(mockData);
                    setSelectedCoin(mockData[0]);
                    setIsConnected(false);
                }
                
            } catch (error) {
                console.error('Failed to fetch data:', error);
                const mockData = generateMockCryptoData();
                setCryptoData(mockData);
                setSelectedCoin(mockData[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleSelectCoin = (coin: CryptoData) => {
        setSelectedCoin(coin);
    }

    const toggleWatchlist = (coinId: string) => {
        setWatchlist(prev => {
            const newWatchlist = prev.includes(coinId) 
                ? prev.filter(id => id !== coinId)
                : [...prev, coinId];
            
            const action = prev.includes(coinId) ? 'removed from' : 'added to';
            console.log(`${coinId} ${action} watchlist`);
            
            return newWatchlist;
        });
    };

    const getMarketStats = () => {
        if (cryptoData.length === 0) {
            return {
                totalMarketCap: 0,
                total24hVolume: 0,
                btcDominance: 0
            };
        }

        const totalMarketCap = cryptoData.reduce((sum, coin) => sum + coin.marketCap, 0);
        const total24hVolume = cryptoData.reduce((sum, coin) => sum + coin.volume24h, 0);
        const btcMarketCap = cryptoData.find(c => c.id === 'bitcoin')?.marketCap || 0;
        const btcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0;

        return {
            totalMarketCap,
            total24hVolume,
            btcDominance
        };
    };

    if (loading && cryptoData.length === 0) {
        return (
            <div className="app-loading">
                <div className="loading-spinner"></div>
                <p>Loading cryptocurrency data...</p>
            </div>
        );
    }

    const displayData = cryptoData.length > 0 ? cryptoData : generateMockCryptoData();
    const displayCoin = selectedCoin || displayData[0];
    const marketStats = getMarketStats();
    
    return (
        <div className="app">
            <Header 
                marketStats={marketStats} 
                isConnected={isConnected}
            />

            <TickerTape cryptoData={displayData.slice(0, 10)} />

            <main className="app__main">
                <div className="app__layout">
                    {/* Left Column - Main Chart */}
                    <div className="app__left-column">
                        <MainChart selectedCoin={displayCoin} />
                        <CryptoTable
                            cryptoData={displayData}
                            onSelectCoin={handleSelectCoin}
                            selectedCoinId={displayCoin.id}
                            onAddToWatchlist={toggleWatchlist}
                            watchlist={watchlist}
                        />
                    </div>
                    
                    {/* Right Column - Coin Stats */}
                    <div className="app__right-column">
                        <CoinStats coin={displayCoin} />
                        <Watchlist 
                            watchlist={watchlist}
                            cryptoData={displayData}
                            onRemoveFromWatchlist={toggleWatchlist}
                            onAddToWatchlist={toggleWatchlist}
                            onSelectCoin={handleSelectCoin}
                        />
                        <PortfolioSimulator cryptoData={displayData} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;