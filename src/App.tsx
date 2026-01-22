import { useEffect, useState } from "react";
import type { CandleData, CryptoData } from "./types/crypto";
import { generateCandleData, generateMockCryptoData, getMarketStats } from "./utils/MockData";
import { Header } from "./components/Header";
import TickerTape from "./components/TickerTape";
import MainChart from "./components/MainChart";
import CoinStats from "./components/CoinStats";

import './scss/index.scss';

function App() {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>(generateMockCryptoData());
    const [selectedCoin, setSelectedCoin] = useState<CryptoData>(generateMockCryptoData()[0]);
    const [isConnected, setIsConnected] = useState(true);
    const [candleData, setCandleData] = useState<CandleData[]>([]);

    useEffect(() => {
        setCandleData(generateCandleData(selectedCoin.price, 30));
    }, [selectedCoin.id]);
    
    const marketStats = getMarketStats(cryptoData);
    
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
                        {/* CryptoTable will go here later */}
                    </div>
                    
                    {/* Right Column - Coin Stats */}
                    <div className="app__right-column">
                        <CoinStats coin={selectedCoin} />
                        {/* Watchlist and PortfolioSimulator will go here later */}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;