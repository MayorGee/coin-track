import { useState } from 'react';
import type { CryptoData } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { X, Search, Star } from 'lucide-react';
import './watchlist.scss';

interface WatchlistProps {
    watchlist: string[];
    cryptoData: CryptoData[];
    onRemoveFromWatchlist: (coinId: string) => void;
    onAddToWatchlist: (coinId: string) => void;
    onSelectCoin: (coin: CryptoData) => void;
}

export function Watchlist({ 
    watchlist, 
    cryptoData, 
    onRemoveFromWatchlist,
    onAddToWatchlist,
    onSelectCoin 
}: WatchlistProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const watchlistCoins = cryptoData.filter(coin => watchlist.includes(coin.id));
    
    const searchResults = cryptoData.filter(coin => 
        !watchlist.includes(coin.id) && 
        (coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5);

    return (
        <div className="watchlist">
            <div className="watchlist__header">
                <div className="watchlist__title-group">
                    <Star className="watchlist__title-icon" />
                    <h2 className="watchlist__title">Watchlist</h2>
                </div>
                <button
                    onClick={() => setIsSearching(!isSearching)}
                    className="watchlist__search-toggle"
                >
                    <Search className="watchlist__search-icon" />
                </button>
            </div>

            {/* Search Input */}
            {isSearching && (
                <div className="watchlist__search">
                    <div className="watchlist__search-container">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search coins..."
                            className="watchlist__search-input"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="watchlist__search-clear"
                            >
                                <X className="watchlist__clear-icon" />
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchTerm && searchResults.length > 0 && (
                        <div className="watchlist__search-results">
                            {searchResults.map(coin => (
                                <button
                                    key={coin.id}
                                    onClick={() => {
                                        onAddToWatchlist(coin.id);
                                        setSearchTerm('');
                                        setIsSearching(false);
                                    }}
                                    className="watchlist__search-result"
                                >
                                    <div className="watchlist__result-info">
                                        <span className="watchlist__result-logo">{coin.logo}</span>
                                        <div className="watchlist__result-details">
                                            <p className="watchlist__result-symbol">{coin.symbol}</p>
                                            <p className="watchlist__result-name">{coin.name}</p>
                                        </div>
                                    </div>
                                    <span className="watchlist__result-action">Add</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Watchlist Items */}
            <div className="watchlist__items">
                {watchlistCoins.length === 0 ? (
                    <div className="watchlist__empty">
                        <Star className="watchlist__empty-icon" />
                        <p className="watchlist__empty-text">No coins in watchlist</p>
                        <p className="watchlist__empty-hint">Click the star icon to add coins</p>
                    </div>
                ) : (
                    watchlistCoins.map(coin => {
                        const isPositive = coin.change24h >= 0;
                        return (
                            <div
                                key={coin.id}
                                onClick={() => onSelectCoin(coin)}
                                className="watchlist__item"
                            >
                                <div className="watchlist__item-header">
                                    <div className="watchlist__item-info">
                                        <span className="watchlist__item-logo">{coin.logo}</span>
                                        <div className="watchlist__item-details">
                                            <p className="watchlist__item-symbol">{coin.symbol}</p>
                                            <p className="watchlist__item-name">{coin.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFromWatchlist(coin.id);
                                        }}
                                        className="watchlist__remove-btn"
                                    >
                                        <X className="watchlist__remove-icon" />
                                    </button>
                                </div>
                                <div className="watchlist__item-footer">
                                    <span className="watchlist__item-price">
                                        {Formatter.formatPrice(coin.price)}
                                    </span>
                                    <span className={`watchlist__item-change ${
                                        isPositive ? 'watchlist__item-change--positive' : 'watchlist__item-change--negative'
                                    }`}>
                                        {Formatter.formatPercentage(coin.change24h)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Watchlist;