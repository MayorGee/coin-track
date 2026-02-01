import { useState, useMemo, useEffect } from 'react';
import { LocalStorage, StorageKeys } from '../../utils/LocalStorage';
import type { PortfolioItem, PortfolioSimulatorProps } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, PlusCircle, Trash2, Wallet } from 'lucide-react';
import './portfolio-simulator.scss';

const COLORS = ['#3b82f6', '#00ff9d', '#8b5cf6', '#fbbf24', '#ff4d4d', '#06b6d4', '#ec4899', '#10b981'];

export function PortfolioSimulator({ cryptoData }: PortfolioSimulatorProps) {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
        return LocalStorage.getItem<PortfolioItem[]>(StorageKeys.PORTFOLIO, []);
    });
    const [selectedCoinId, setSelectedCoinId] = useState(cryptoData[0]?.id || '');
    const [investmentAmount, setInvestmentAmount] = useState('1000');

    useEffect(() => {
        LocalStorage.setItem(StorageKeys.PORTFOLIO, portfolio);
    }, [portfolio]);

    const handleAddToPortfolio = () => {
        const amount = parseFloat(investmentAmount);
        if (isNaN(amount) || amount <= 0) return;

        const coin = cryptoData.find(c => c.id === selectedCoinId);
        if (!coin) return;

        const existingIndex = portfolio.findIndex(p => p.coinId === selectedCoinId);
        
        if (existingIndex >= 0) {
            const updated = [...portfolio];
            updated[existingIndex] = {
                ...updated[existingIndex],
                amount: updated[existingIndex].amount + amount / coin.price,
                investedValue: updated[existingIndex].investedValue + amount
            };
            setPortfolio(updated);
        } else {
            setPortfolio([...portfolio, {
                coinId: selectedCoinId,
                amount: amount / coin.price,
                investedValue: amount
            }]);
        }

        setInvestmentAmount('1000');
    };

    const handleRemoveFromPortfolio = (coinId: string) => {
        setPortfolio(portfolio.filter(p => p.coinId !== coinId));
    };

    const portfolioStats = useMemo(() => {
        let totalInvested = 0;
        let totalCurrent = 0;
        const holdings: Array<{ name: string; value: number; percentage: number; color: string }> = [];

        portfolio.forEach((item, index) => {
            const coin = cryptoData.find(c => c.id === item.coinId);
            if (!coin) return;

            const currentValue = item.amount * coin.price;
            totalInvested += item.investedValue;
            totalCurrent += currentValue;

            holdings.push({
                name: coin.symbol,
                value: currentValue,
                percentage: 0,
                color: COLORS[index % COLORS.length]
            });
        });

        holdings.forEach(holding => {
            holding.percentage = totalCurrent > 0 ? (holding.value / totalCurrent) * 100 : 0;
        });

        const profitLoss = totalCurrent - totalInvested;
        const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

        return {
            totalInvested,
            totalCurrent,
            profitLoss,
            profitLossPercentage,
            holdings
        };
    }, [portfolio, cryptoData]);

    const isProfit = portfolioStats.profitLoss >= 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="portfolio-simulator__tooltip">
                    <p className="portfolio-simulator__tooltip-name">{data.name}</p>
                    <p className="portfolio-simulator__tooltip-value">
                        {Formatter.formatPrice(data.value)}
                    </p>
                    <p className="portfolio-simulator__tooltip-percentage">
                        {data.payload.percentage.toFixed(2)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="portfolio-simulator">
            <div className="portfolio-simulator__header">
                <Wallet className="portfolio-simulator__header-icon" />
                <h2 className="portfolio-simulator__title">Portfolio Simulator</h2>
            </div>

            {/* Add to Portfolio */}
            <div className="portfolio-simulator__form">
                <div className="portfolio-simulator__field">
                    <label className="portfolio-simulator__label">Select Coin</label>
                    <select
                        value={selectedCoinId}
                        onChange={(e) => setSelectedCoinId(e.target.value)}
                        className="portfolio-simulator__select"
                    >
                        {cryptoData.map(coin => (
                            <option key={coin.id} value={coin.id}>
                                {coin.symbol} - {Formatter.formatPrice(coin.price)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="portfolio-simulator__field">
                    <label className="portfolio-simulator__label">Investment Amount ($)</label>
                    <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder="1000"
                        className="portfolio-simulator__input"
                    />
                </div>

                <button
                    onClick={handleAddToPortfolio}
                    className="portfolio-simulator__add-btn"
                >
                    <PlusCircle className="portfolio-simulator__add-icon" />
                    Add to Portfolio
                </button>
            </div>

            {/* Portfolio Stats */}
            {portfolio.length > 0 ? (
                <>
                    <div className="portfolio-simulator__stats-grid">
                        <div className="portfolio-simulator__stat-card">
                            <p className="portfolio-simulator__stat-label">Total Invested</p>
                            <p className="portfolio-simulator__stat-value">
                                {Formatter.formatPrice(portfolioStats.totalInvested)}
                            </p>
                        </div>
                        <div className="portfolio-simulator__stat-card">
                            <p className="portfolio-simulator__stat-label">Current Value</p>
                            <p className="portfolio-simulator__stat-value">
                                {Formatter.formatPrice(portfolioStats.totalCurrent)}
                            </p>
                        </div>
                    </div>

                    <div className="portfolio-simulator__profit-loss">
                        <div className="portfolio-simulator__profit-loss-header">
                            <p className="portfolio-simulator__profit-loss-label">Profit/Loss</p>
                            <div className={`portfolio-simulator__profit-loss-value ${isProfit ? 'portfolio-simulator__profit-loss-value--positive' : 'portfolio-simulator__profit-loss-value--negative'}`}>
                                {isProfit ? <TrendingUp className="portfolio-simulator__trend-icon" /> : <TrendingDown className="portfolio-simulator__trend-icon" />}
                                <span>{Formatter.formatPrice(Math.abs(portfolioStats.profitLoss))}</span>
                            </div>
                        </div>
                        <div className="portfolio-simulator__profit-loss-percentage">
                            <span className={`portfolio-simulator__percentage ${isProfit ? 'portfolio-simulator__percentage--positive' : 'portfolio-simulator__percentage--negative'}`}>
                                ({isProfit ? '+' : ''}{portfolioStats.profitLossPercentage.toFixed(2)}%)
                            </span>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="portfolio-simulator__chart">
                        <h3 className="portfolio-simulator__chart-title">Allocation</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart className="recharts-pie-chart">
                                <Pie
                                    data={portfolioStats.holdings}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {portfolioStats.holdings.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Holdings List */}
                    <div className="portfolio-simulator__holdings">
                        <h3 className="portfolio-simulator__holdings-title">Holdings</h3>
                        <div className="portfolio-simulator__holdings-list">
                            {portfolio.map((item, index) => {
                                const coin = cryptoData.find(c => c.id === item.coinId);
                                if (!coin) return null;

                                const currentValue = item.amount * coin.price;
                                const profit = currentValue - item.investedValue;
                                const profitPercent = (profit / item.investedValue) * 100;
                                const isHoldingProfit = profit >= 0;

                                return (
                                    <div
                                        key={item.coinId}
                                        className="portfolio-simulator__holding-item"
                                    >
                                        <div className="portfolio-simulator__holding-info">
                                            <div 
                                                className="portfolio-simulator__holding-color" 
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <div className="portfolio-simulator__holding-details">
                                                <p className="portfolio-simulator__holding-symbol">{coin.symbol}</p>
                                                <p className="portfolio-simulator__holding-amount">
                                                    {item.amount.toFixed(6)} {coin.symbol}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="portfolio-simulator__holding-values">
                                            <div className="portfolio-simulator__holding-value-group">
                                                <p className="portfolio-simulator__holding-value">
                                                    {Formatter.formatPrice(currentValue)}
                                                </p>
                                                <p className={`portfolio-simulator__holding-percentage ${isHoldingProfit ? 'portfolio-simulator__holding-percentage--positive' : 'portfolio-simulator__holding-percentage--negative'}`}>
                                                    {isHoldingProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromPortfolio(item.coinId)}
                                                className="portfolio-simulator__remove-btn"
                                            >
                                                <Trash2 className="portfolio-simulator__remove-icon" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                <div className="portfolio-simulator__empty">
                    <Wallet className="portfolio-simulator__empty-icon" />
                    <p className="portfolio-simulator__empty-text">No holdings yet</p>
                    <p className="portfolio-simulator__empty-hint">Add coins to start simulating</p>
                </div>
            )}
        </div>
    );
}

export default PortfolioSimulator;