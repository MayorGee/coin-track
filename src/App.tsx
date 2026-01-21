import { useState } from "react";
import type { CryptoData } from "./types/crypto";
import { generateMockCryptoData, getMarketStats } from "./utils/MockData";
import { Header } from "./components/Header";
import TickerTape from "./components/TickerTape";

function App() {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>(generateMockCryptoData());
    const [selectedCoin, setSelectedCoin] = useState<CryptoData>(generateMockCryptoData()[0]);
    const [isConnected, setIsConnected] = useState(true);
    
    const marketStats = getMarketStats(cryptoData);
    
    return (
        <>
            <Header
                marketStats={marketStats}
                isConnected={isConnected} 
            />

            <TickerTape cryptoData={cryptoData.slice(0, 10)} />
        </>
    );
}

export default App;