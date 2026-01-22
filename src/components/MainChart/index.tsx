import { useState, useMemo } from 'react';
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import type { CryptoData, CandleData } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './main-chart.scss';

interface MainChartProps {
    selectedCoin: CryptoData;
    candleData: CandleData[];
}

type TimeFrame = '1H' | '4H' | '1D' | '1W' | '1M';
type ChartIndicator = 'none' | 'sma' | 'rsi';

export function MainChart({ selectedCoin, candleData }: MainChartProps) {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
    const [indicator, setIndicator] = useState<ChartIndicator>('none');

    const chartData = useMemo(() => {
        let filtered = [...candleData];
        
        // Filter based on timeframe
        if (timeFrame === '1H') {
            filtered = filtered.slice(-24);
        } else if (timeFrame === '4H') {
            filtered = filtered.slice(-48);
        } else if (timeFrame === '1W') {
            filtered = filtered.slice(-7);
        }

        return filtered.map(candle => ({
            timestamp: candle.timestamp,
            date: Formatter.formatDate(candle.timestamp),
            price: candle.close,
            volume: candle.volume,
            high: candle.high,
            low: candle.low,
            open: candle.open,
        }));
    }, [candleData, timeFrame]);

    const priceChange = selectedCoin.change24h;
    const isPositive = priceChange >= 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="main-chart__tooltip">
                    <p className="main-chart__tooltip-date">{data.date}</p>
                    <p className="main-chart__tooltip-price">
                        {Formatter.formatPrice(data.price)}
                    </p>
                    <div className="main-chart__tooltip-details">
                        <p>H: {Formatter.formatPrice(data.high)}</p>
                        <p>L: {Formatter.formatPrice(data.low)}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const timeFrames: TimeFrame[] = ['1H', '4H', '1D', '1W', '1M'];
    const chartIndicators: { value: ChartIndicator; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'sma', label: 'SMA' },
        { value: 'rsi', label: 'RSI' },
    ];

    const gradientId = `colorPrice-${selectedCoin.id}-${isPositive ? 'up' : 'down'}`;

    // Fix for Tooltip formatter type issue
    const formatTooltipValue = (value: number | undefined) => {
        if (value === undefined) return '';
        return Formatter.formatPrice(value);
    };

    return (
        <div className="main-chart">
            {/* Header */}
            <div className="main-chart__header">
                <div className="main-chart__coin-info">
                    <div className="main-chart__coin-logo">
                        {selectedCoin.logo}
                    </div>
                    <div className="main-chart__coin-details">
                        <h2 className="main-chart__coin-name">
                            {selectedCoin.name} <span className="main-chart__coin-symbol">{selectedCoin.symbol}</span>
                        </h2>
                        <div className="main-chart__price-info">
                            <span className="main-chart__current-price">
                                {Formatter.formatPrice(selectedCoin.price)}
                            </span>
                            <span className={`main-chart__price-change ${isPositive ? 'main-chart__price-change--positive' : 'main-chart__price-change--negative'}`}>
                                {isPositive ? <TrendingUp className="main-chart__change-icon" /> : <TrendingDown className="main-chart__change-icon" />}
                                {Formatter.formatPercentage(priceChange)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="main-chart__controls">
                    {/* Time Frame Selector */}
                    <div className="main-chart__timeframe-selector">
                        {timeFrames.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeFrame(tf)}
                                className={`main-chart__timeframe-btn ${timeFrame === tf ? 'main-chart__timeframe-btn--active' : ''}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    {/* Indicator Selector */}
                    <div className="main-chart__indicator-selector">
                        {chartIndicators.map((ind) => (
                            <button
                                key={ind.value}
                                onClick={() => setIndicator(ind.value)}
                                className={`main-chart__indicator-btn ${indicator === ind.value ? 'main-chart__indicator-btn--active' : ''}`}
                            >
                                {ind.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price Chart */}
            <div className="main-chart__price-section">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData} className="recharts-area-chart">
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" className="recharts-gradient-start" />
                                <stop offset="95%" className="recharts-gradient-end" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid className="recharts-cartesian-grid" />
                        <XAxis 
                            dataKey="date" 
                            className="recharts-xaxis"
                            tickLine={false}
                        />
                        <YAxis 
                            className="recharts-yaxis"
                            tickFormatter={(value) => Formatter.formatPrice(value)}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            className={`recharts-area ${isPositive ? 'recharts-area--positive' : 'recharts-area--negative'}`}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            animationDuration={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            <div className="main-chart__volume-section">
                <h3 className="main-chart__volume-title">Volume</h3>
                <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={chartData} className="recharts-bar-chart">
                        <CartesianGrid className="recharts-cartesian-grid" />
                        <XAxis 
                            dataKey="date" 
                            className="recharts-xaxis"
                            tickLine={false}
                            hide
                        />
                        <YAxis 
                            className="recharts-yaxis"
                            tickLine={false}
                            hide
                        />
                        <Tooltip 
                            formatter={(value: any) => formatTooltipValue(value)}
                        />
                        <Bar 
                            dataKey="volume" 
                            className="recharts-volume-bar"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default MainChart;