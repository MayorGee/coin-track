import { useState, useMemo } from 'react';
import type { CryptoTableProps, SortDirection, SortKey } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Star } from 'lucide-react';
import './crypto-table.scss';

const CryptoTable = ({ 
    cryptoData, 
    onSelectCoin, 
    selectedCoinId,
    onAddToWatchlist,
    watchlist
}: CryptoTableProps) => {
    const [sortKey, setSortKey] = useState<SortKey>('rank');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        const sorted = [...cryptoData].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            if (sortKey === 'name') {
                return sortDirection === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return 0;
        });

        return sorted;
    }, [cryptoData, sortKey, sortDirection]);

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) {
            return <ArrowUpDown className="crypto-table__sort-icon crypto-table__sort-icon--inactive" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="crypto-table__sort-icon crypto-table__sort-icon--active" />
            : <ArrowDown className="crypto-table__sort-icon crypto-table__sort-icon--active" />;
    };

    return (
        <div className="crypto-table">
            <div className="crypto-table__header">
                <h2 className="crypto-table__title">Top Cryptocurrencies</h2>
            </div>
            
            <div className="crypto-table__container">
                <table className="crypto-table__table">
                    <thead className="crypto-table__thead">
                        <tr className="crypto-table__tr">
                            <th className="crypto-table__th crypto-table__th--left">
                                <button 
                                    onClick={() => handleSort('rank')}
                                    className="crypto-table__sort-btn"
                                >
                                    Rank
                                    <SortIcon column="rank" />
                                </button>
                            </th>
                            <th className="crypto-table__th crypto-table__th--left">
                                <button 
                                    onClick={() => handleSort('name')}
                                    className="crypto-table__sort-btn"
                                >
                                    Name
                                    <SortIcon column="name" />
                                </button>
                            </th>
                            <th className="crypto-table__th crypto-table__th--right">
                                <button 
                                    onClick={() => handleSort('price')}
                                    className="crypto-table__sort-btn"
                                >
                                    Price
                                    <SortIcon column="price" />
                                </button>
                            </th>
                            <th className="crypto-table__th crypto-table__th--right">
                                <button 
                                    onClick={() => handleSort('change24h')}
                                    className="crypto-table__sort-btn"
                                >
                                    24h Change
                                    <SortIcon column="change24h" />
                                </button>
                            </th>
                            <th className="crypto-table__th crypto-table__th--right">
                                <button 
                                    onClick={() => handleSort('marketCap')}
                                    className="crypto-table__sort-btn"
                                >
                                    Market Cap
                                    <SortIcon column="marketCap" />
                                </button>
                            </th>
                            <th className="crypto-table__th crypto-table__th--center">
                                <span className="crypto-table__actions-label">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="crypto-table__tbody">
                        {sortedData.map((coin) => {
                            const isPositive = coin.change24h >= 0;
                            const isSelected = coin.id === selectedCoinId;
                            const isInWatchlist = watchlist.includes(coin.id);

                            return (
                                <tr 
                                    key={coin.id}
                                    onClick={() => onSelectCoin(coin)}
                                    className={`crypto-table__tr crypto-table__tr--clickable ${
                                        isSelected ? 'crypto-table__tr--selected' : ''
                                    }`}
                                >
                                    <td className="crypto-table__td">
                                        <span className="crypto-table__rank">
                                            #{coin.rank}
                                        </span>
                                    </td>
                                    <td className="crypto-table__td">
                                        <div className="crypto-table__coin-info">
                                            <div className="crypto-table__coin-logo">
                                                <img 
                                                    src={coin.image} 
                                                    alt={coin.name}
                                                    className="crypto-table__coin-image"
                                                />
                                            </div>
                                            <div className="crypto-table__coin-details">
                                                <div className="crypto-table__coin-name">{coin.name}</div>
                                                <div className="crypto-table__coin-symbol">{coin.symbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="crypto-table__td crypto-table__td--right">
                                        <span className="crypto-table__price">
                                            {Formatter.formatPrice(coin.price)}
                                        </span>
                                    </td>
                                    <td className="crypto-table__td crypto-table__td--right">
                                        <div className={`crypto-table__change ${
                                            isPositive ? 'crypto-table__change--positive' : 'crypto-table__change--negative'
                                        }`}>
                                            {isPositive ? <TrendingUp className="crypto-table__change-icon" /> : <TrendingDown className="crypto-table__change-icon" />}
                                            {Formatter.formatPercentage(coin.change24h)}
                                        </div>
                                    </td>
                                    <td className="crypto-table__td crypto-table__td--right">
                                        <span className="crypto-table__market-cap">
                                            {Formatter.formatLargeNumber(coin.marketCap)}
                                        </span>
                                    </td>
                                    <td className="crypto-table__td">
                                        <div className="crypto-table__actions">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToWatchlist(coin.id);
                                                }}
                                                className={`crypto-table__watchlist-btn ${
                                                    isInWatchlist
                                                        ? 'crypto-table__watchlist-btn--active'
                                                        : 'crypto-table__watchlist-btn--inactive'
                                                }`}
                                                title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                                            >
                                                <Star className={`crypto-table__watchlist-icon ${
                                                    isInWatchlist ? 'crypto-table__watchlist-icon--active' : ''
                                                }`} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectCoin(coin);
                                                }}
                                                className="crypto-table__view-btn"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CryptoTable;