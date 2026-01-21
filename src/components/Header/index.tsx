import type { HeaderProps } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { Activity, TrendingUp, BarChart3 } from 'lucide-react';
import './header.scss';

export function Header({ marketStats, isConnected }: HeaderProps) {
    const statusClass = isConnected ? 'connected' : 'disconnected';
    const hasPulse = isConnected ? 'header__status-indicator--pulsing' : '';

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__content">
                    {/* Logo and Brand Section */}
                    <div className="header__brand">
                        <div className="header__logo">
                            <Activity className="header__logo-icon" />
                            <h1 className="header__title">CoinTrack</h1>
                        </div>
            
                        {/* Connection Status */}
                        <div className={
                            `header__status ${isConnected ? 
                                'header__status--connected' : 
                                'header__status--disconnected'
                            }`
                        }>
                            <div className={`header__status-indicator header__status-indicator--${statusClass} ${hasPulse}`} />
                            <span className="header__status-text">
                                {isConnected ? 'Live' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
          
                    {/* Market Stats Section  */}
                    <div className="header__stats">
                        <div className="header__stat">
                            <TrendingUp className="header__stat-icon header__stat-icon--primary" />
                            <span className="header__stat-label">Market Cap:</span>
                            <span className="header__stat-value">
                                {Formatter.formatLargeNumber(marketStats.totalMarketCap)}
                            </span>
                        </div>
                
                        <div className="header__stat">
                            <BarChart3 className="header__stat-icon header__stat-icon--secondary" />
                            <span className="header__stat-label">24h Volume:</span>
                            <span className="header__stat-value">
                                {Formatter.formatLargeNumber(marketStats.total24hVolume)}
                            </span>
                        </div>

                        <div className="header__stat">
                            <span className="header__stat-label">BTC Dominance:</span>
                            <span className="header__stat-value">
                                {marketStats.btcDominance.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;