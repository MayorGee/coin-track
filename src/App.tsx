import { useEffect, useState } from "react";
import type { CandleData, CryptoData } from "./types/crypto";
import { generateCandleData, generateMockCryptoData, getMarketStats } from "./utils/MockData";
import { Header } from "./components/Header";
import TickerTape from "./components/TickerTape";
import MainChart from "./components/MainChart";
import CoinStats from "./components/CoinStats";
import CryptoTable from "./components/CryptoTable";
import Watchlist from "./components/Watchlist";

import './scss/index.scss';
import PortfolioSimulator from "./components/PortfolioSimulator";

function App() {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>(generateMockCryptoData());
    const [selectedCoin, setSelectedCoin] = useState<CryptoData>(generateMockCryptoData()[0]);
    const [isConnected, setIsConnected] = useState(true);
    const [candleData, setCandleData] = useState<CandleData[]>([]);
    const [watchlist, setWatchlist] = useState<string[]>(['bitcoin', 'ethereum']);

    useEffect(() => {
        setCandleData(generateCandleData(selectedCoin.price, 30));
    }, [selectedCoin.id]);
    
    const marketStats = getMarketStats(cryptoData);

    const handleSelectCoin = (coin: CryptoData) => {
        setSelectedCoin(coin);
    }

    const handleAddToWatchlist = (coinId: string) => {
        if (watchlist.includes(coinId)) {
            setWatchlist(watchlist.filter(id => id !== coinId));
        } else {
            setWatchlist([...watchlist, coinId]);
        }
    };

    const handleRemoveFromWatchlist = (coinId: string) => {
        setWatchlist(watchlist.filter(id => id !== coinId));
    };
    
    return (
        <div className="app">
            <Header
                marketStats={marketStats}
                isConnected={isConnected} 
            />

            <TickerTape cryptoData={cryptoData.slice(0, 10)} />

            <main className="app__main">
                <div className="app__layout">
                    {/* Left Column - Main Chart */}
                    <div className="app__left-column">
                        <MainChart 
                            selectedCoin={selectedCoin} 
                            candleData={candleData} 
                        />
                        <CryptoTable
                            cryptoData={cryptoData.slice(0,10)}
                            onSelectCoin={handleSelectCoin}
                            selectedCoinId={selectedCoin.id}
                            onAddToWatchlist={handleAddToWatchlist}
                            watchlist={watchlist}
                        />
                    </div>
                    
                    {/* Right Column - Coin Stats */}
                    <div className="app__right-column">
                        <CoinStats coin={selectedCoin} />
                        <Watchlist 
                            watchlist={watchlist}
                            cryptoData={cryptoData}
                            onRemoveFromWatchlist={handleRemoveFromWatchlist}
                            onAddToWatchlist={handleAddToWatchlist}
                            onSelectCoin={handleSelectCoin}
                        />
                        <PortfolioSimulator cryptoData={cryptoData} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;