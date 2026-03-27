// src/components/MainChart/index.tsx - Updated with all fixes
import { useState, useMemo, useEffect } from 'react';
import { 
    BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { TimeFrame, MainChartProps, CandleData } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { LocalStorage, StorageKeys } from '../../utils/LocalStorage';
import { TrendingUp, TrendingDown, BarChart3, CandlestickChart, LineChart as LineChartIcon } from 'lucide-react';
import ApiClient from '../../Api/client';
import MainPriceChart from './MainPriceChart';
import './main-chart.scss';

const apiClient = new ApiClient();

export function MainChart({ selectedCoin, onChartFallbackChange }: MainChartProps) {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>(() => {
        return LocalStorage.getItem<TimeFrame>(StorageKeys.CHART_TIMEFRAME, '1D');
    });
    
    const [chartType, setChartType] = useState<'line' | 'candle'>(() => {
        return LocalStorage.getItem<'line' | 'candle'>(StorageKeys.CHART_TYPE, 'candle');
    });
    
    const [chartData, setChartData] = useState<CandleData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        LocalStorage.setItem(StorageKeys.CHART_TIMEFRAME, timeFrame);
    }, [timeFrame]);

    useEffect(() => {
        LocalStorage.setItem(StorageKeys.CHART_TYPE, chartType);
    }, [chartType]);

    // Fetch chart data when coin or timeframe changes
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const result = await apiClient.getChartData(selectedCoin.id, timeFrame, selectedCoin.price);
                setChartData(result.candles);
                onChartFallbackChange?.(result.isFallback);
            } catch (error) {
                console.error('Failed to fetch chart data:', error);
                onChartFallbackChange?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [selectedCoin.id, selectedCoin.price, timeFrame, onChartFallbackChange]);

    // Process chart data for display
    const { processedData, volumeData, xAxisPadding } = useMemo(() => {
        if (chartData.length === 0) {
            return { 
                processedData: [], 
                volumeData: [], 
                xAxisPadding: { left: 20, right: 20 }
            };
        }

        // Process chart data
        const processed = chartData.map((candle) => {
            let dateLabel: string;
            const date = new Date(candle.time);
            
            // Custom date formatting based on timeframe
            switch (timeFrame) {
                case '1H':
                    dateLabel = date.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                    break;
                case '4H':
                    {
                        const hour = date.getHours();
                        dateLabel = `${hour.toString().padStart(2, '0')}:00`;
                    }
                    break;
                case '1D':
                    dateLabel = date.toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric'
                    });
                    // Add hour for 1D timeframe
                    if (chartData.length <= 24) {
                        dateLabel += ` ${date.getHours().toString().padStart(2, '0')}:00`;
                    }
                    break;
                case '1W':
                    dateLabel = date.toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    break;
                case '1M':
                    dateLabel = date.toLocaleDateString([], { 
                        month: 'short', 
                        year: '2-digit' 
                    });
                    break;
                default:
                    dateLabel = Formatter.formatDate(candle.time);
            }

            return {
                timestamp: candle.time,
                date: dateLabel,
                time: candle.time,
                price: candle.close,
                value: candle.close,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume || 0,
                isUp: candle.close >= candle.open,
            };
        });

        // Prepare volume bar colors to match candle direction
        const volume = processed.map(item => ({
            ...item,
            volumeColor: item.isUp ? '#22c55e' : '#ef4444',
            volumeOpacity: item.isUp ? 0.45 : 0.38
        }));

        // Calculate X-axis padding based on data length
        const xPadding = chartData.length > 10 ? { left: 30, right: 30 } : { left: 40, right: 40 };

        return { 
            processedData: processed, 
            volumeData: volume,
            xAxisPadding: xPadding
        };
    }, [chartData, timeFrame]);

    const priceChange = selectedCoin.change24h;
    const isPositive = priceChange >= 0;

    // Volume chart tooltip
    const VolumeTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const date = new Date(data.time).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return (
                <div className="main-chart__tooltip main-chart__tooltip--volume">
                    <div className="main-chart__tooltip-header">
                        <BarChart3 size={12} />
                        <span className="main-chart__tooltip-date">{date}</span>
                    </div>
                    <div className="main-chart__tooltip-grid">
                        <div className="main-chart__tooltip-item">
                            <span className="label">Volume</span>
                            <span className="value volume">{Formatter.formatLargeNumber(data.volume)}</span>
                        </div>
                        <div className="main-chart__tooltip-item">
                            <span className="label">Price</span>
                            <span className="value">{Formatter.formatPrice(data.price)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const timeFrames: TimeFrame[] = ['1H', '4H', '1D', '1W', '1M'];
    const chartTypes = [
        { value: 'candle' as const, label: 'Candle', icon: <CandlestickChart size={14} /> },
        { value: 'line' as const, label: 'Line', icon: <LineChartIcon size={14} /> },
    ];

    return (
        <div className="main-chart">
            {/* Header */}
            <div className="main-chart__header">
                <div className="main-chart__coin-info">
                    <img 
                        src={selectedCoin.image}
                        className="main-chart__coin-logo"
                        alt={selectedCoin.name}
                    />
                    <div className="main-chart__coin-details">
                        <h2 className="main-chart__coin-name">
                            {selectedCoin.name} <span className="main-chart__coin-symbol">{selectedCoin.symbol}</span>
                        </h2>
                        <div className="main-chart__price-info">
                            <span className="main-chart__current-price">
                                {Formatter.formatPrice(selectedCoin.price)}
                            </span>
                            <span className={`main-chart__price-change ${isPositive ? 'positive' : 'negative'}`}>
                                {isPositive ? <TrendingUp className="icon" /> : <TrendingDown className="icon" />}
                                {Formatter.formatPercentage(priceChange)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="main-chart__controls">
                    {/* Chart Type Selector */}
                    <div className="main-chart__type-selector">
                        {chartTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setChartType(type.value)}
                                className={`main-chart__type-btn ${chartType === type.value ? 'active' : ''}`}
                                title={type.label}
                            >
                                {type.icon}
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Time Frame Selector */}
                    <div className="main-chart__timeframe-selector">
                        {timeFrames.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeFrame(tf)}
                                className={`main-chart__timeframe-btn ${timeFrame === tf ? 'active' : ''}`}
                                disabled={loading}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="main-chart__loading">
                    <div className="loading-spinner"></div>
                    <p>Loading {timeFrame} chart data...</p>
                </div>
            ) : processedData.length > 0 ? (
                <>
                    {/* Price Chart */}
                    <div className="main-chart__price-section">
                        <MainPriceChart data={processedData} chartType={chartType} height={350} />
                    </div>

                    {/* Volume Chart */}
                    <div className="main-chart__volume-section">
                        <div className="main-chart__volume-header">
                            <BarChart3 size={16} />
                            <h3 className="main-chart__volume-title">Volume</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={120}>
                            <BarChart 
                                data={volumeData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                                className="recharts-bar-chart"
                            >
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="rgba(255, 255, 255, 0.05)" 
                                    vertical={false} 
                                />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#a0aec0"
                                    tickLine={false}
                                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                                    tick={{ fill: '#a0aec0', fontSize: 10 }}
                                    minTickGap={timeFrame === '1H' ? 40 : 20}
                                    padding={xAxisPadding}
                                    hide
                                />
                                <YAxis 
                                    stroke="#a0aec0"
                                    tickLine={false}
                                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                                    tick={{ fill: '#a0aec0', fontSize: 10 }}
                                    hide
                                />
                                <Tooltip 
                                    content={<VolumeTooltip />}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar 
                                    dataKey="volume" 
                                    radius={[2, 2, 0, 0]}
                                    animationDuration={500}
                                >
                                    {volumeData.map((entry, index) => (
                                        <Cell
                                            key={`volume-cell-${entry.time}-${index}`}
                                            fill={entry.volumeColor}
                                            fillOpacity={entry.volumeOpacity}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            ) : (
                <div className="main-chart__empty">
                    <p>No chart data available</p>
                </div>
            )}
        </div>
    );
}

export default MainChart;