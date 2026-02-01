import type { CoinStatsProps } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import './coin-stats.scss';

export function CoinStats({ coin }: CoinStatsProps) {
    const isPositive = coin.change24h >= 0;
    const athPercentage = ((coin.price / coin.ath - 1) * 100).toFixed(2);

    return (
        <div className="coin-stats">
            <div className="coin-stats__header">
                <img 
                    src={coin.image}
                    className="coin-stats__logo"
                />
                <div className="coin-stats__titles">
                    <h2 className="coin-stats__name">{coin.name}</h2>
                    <p className="coin-stats__symbol">{coin.symbol}</p>
                </div>
            </div>

            <div className="coin-stats__content">
                {/* Current Price */}
                <div className="coin-stats__card">
                    <div className="coin-stats__card-header">
                        <span className="coin-stats__card-label">Current Price</span>
                        <DollarSign className="coin-stats__card-icon coin-stats__card-icon--primary" />
                    </div>
                    <p className="coin-stats__card-value coin-stats__card-value--large">
                        {Formatter.formatPrice(coin.price)}
                    </p>
                    <div className={`coin-stats__change ${isPositive ? 'coin-stats__change--positive' : 'coin-stats__change--negative'}`}>
                        {isPositive ? 
                            <TrendingUp className="coin-stats__change-icon" /> : 
                            <TrendingDown className="coin-stats__change-icon" />
                        }
                        {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </div>
                </div>

                {/* 24h High/Low */}
                <div className="coin-stats__high-low">
                    <div className="coin-stats__high">
                        <p className="coin-stats__high-label">24h High</p>
                        <p className="coin-stats__high-value">{Formatter.formatPrice(coin.high24h)}</p>
                    </div>
                    <div className="coin-stats__low">
                        <p className="coin-stats__low-label">24h Low</p>
                        <p className="coin-stats__low-value">{Formatter.formatPrice(coin.low24h)}</p>
                    </div>
                </div>

                {/* Trading Volume */}
                <div className="coin-stats__card">
                    <div className="coin-stats__card-header">
                        <span className="coin-stats__card-label">24h Volume</span>
                        <Activity className="coin-stats__card-icon coin-stats__card-icon--secondary" />
                    </div>
                    <p className="coin-stats__card-value">
                        {Formatter.formatLargeNumber(coin.volume24h)}
                    </p>
                </div>

                {/* Market Cap */}
                <div className="coin-stats__card">
                    <div className="coin-stats__card-header">
                        <span className="coin-stats__card-label">Market Cap</span>
                    </div>
                    <p className="coin-stats__card-value">
                        {Formatter.formatLargeNumber(coin.marketCap)}
                    </p>
                </div>

                {/* All-time High */}
                <div className="coin-stats__card">
                    <p className="coin-stats__card-label">All-Time High</p>
                    <p className="coin-stats__card-value">{Formatter.formatPrice(coin.ath)}</p>
                    <p className="coin-stats__ath-percentage">
                        {athPercentage}% from ATH
                    </p>
                </div>

                {/* Simulation Buttons */}
                <div className="coin-stats__actions">
                    <button className="coin-stats__btn coin-stats__btn--buy">
                        Buy
                    </button>
                    <button className="coin-stats__btn coin-stats__btn--sell">
                        Sell
                    </button>
                </div>
                <p className="coin-stats__disclaimer">
                    * Simulation only - not real trading (yet)
                </p>
            </div>
        </div>
    );
}

export default CoinStats;