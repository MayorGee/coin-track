import { useEffect, useMemo, useRef, useState } from 'react';
import Formatter from '../../utils/Formatter';

type PricePoint = {
    time: string;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
};

interface MainPriceChartProps {
    data: PricePoint[];
    chartType: 'line' | 'candle';
    height?: number;
}

const MARGIN = { top: 20, right: 72, bottom: 24, left: 20 };
const MAX_SPACING = 22;

export default function MainPriceChart({ data, chartType, height = 350 }: MainPriceChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const nextWidth = Math.floor(entries[0]?.contentRect.width ?? 0);
            setWidth(nextWidth);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const { minY, maxY, yTicks } = useMemo(() => {
        if (!data.length) {
            return { minY: 0, maxY: 1, yTicks: [0, 0.25, 0.5, 0.75, 1] };
        }

        const lows = data.map((d) => d.low);
        const highs = data.map((d) => d.high);
        const rawMin = Math.min(...lows);
        const rawMax = Math.max(...highs);
        const range = Math.max(rawMax - rawMin, rawMax * 0.01);
        const padding = range * 0.05;
        const nextMin = Math.max(0, rawMin - padding);
        const nextMax = rawMax + padding;
        const ticks = Array.from({ length: 6 }, (_, i) => nextMin + ((nextMax - nextMin) * i) / 5);

        return { minY: nextMin, maxY: nextMax, yTicks: ticks };
    }, [data]);

    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
    const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

    const { effectiveStartX, effectiveStep, effectiveWidth } = useMemo(() => {
        if (data.length <= 1) {
            return {
                effectiveStartX: MARGIN.left + plotWidth / 2,
                effectiveStep: 0,
                effectiveWidth: 0,
            };
        }

        const naturalStep = plotWidth / (data.length - 1);
        // Keep sparse datasets readable while allowing dense datasets to compress naturally.
        const nextStep = naturalStep > MAX_SPACING ? MAX_SPACING : naturalStep;
        const nextWidth = nextStep * (data.length - 1);
        const start = MARGIN.left + (plotWidth - nextWidth) / 2;

        return {
            effectiveStartX: start,
            effectiveStep: nextStep,
            effectiveWidth: nextWidth,
        };
    }, [data.length, plotWidth]);

    const xAt = (index: number) => {
        if (data.length <= 1) return effectiveStartX;
        return effectiveStartX + index * effectiveStep;
    };

    const yAt = (value: number) => {
        if (maxY <= minY) return MARGIN.top + plotHeight / 2;
        return MARGIN.top + ((maxY - value) / (maxY - minY)) * plotHeight;
    };

    const linePath = data.length
        ? data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.close)}`).join(' ')
        : '';

    const areaPath = data.length
        ? (() => {
              const baseY = MARGIN.top + plotHeight;
              const top = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.close)}`).join(' ');
              const endX = xAt(data.length - 1);
              const startX = xAt(0);
              return `${top} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
          })()
        : '';

    const candleWidth =
        data.length < 2 ? 8 : Math.max(2, Math.min(14, Math.abs(xAt(1) - xAt(0)) * 0.7));

    const hovered = hoverIndex !== null ? data[hoverIndex] : null;
    const hoverX = hoverIndex !== null ? xAt(hoverIndex) : null;

    const handlePointerMove = (event: React.MouseEvent<SVGRectElement>) => {
        if (!data.length) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const normalized = Math.min(Math.max(px - effectiveStartX, 0), Math.max(effectiveWidth, 1));
        const index = Math.round((normalized / Math.max(effectiveWidth, 1)) * Math.max(data.length - 1, 0));
        setHoverIndex(Math.min(Math.max(index, 0), data.length - 1));
    };

    const xTickIndexes = useMemo(() => {
        if (!data.length) return [];
        const desired = Math.min(10, Math.max(6, Math.floor(effectiveWidth / 140)));
        if (data.length <= desired) return data.map((_, i) => i);
        return Array.from({ length: desired }, (_, i) =>
            Math.round((i / (desired - 1)) * (data.length - 1)),
        );
    }, [data, effectiveWidth]);

    return (
        <div className="main-chart__custom-price" ref={containerRef} style={{ height }}>
            <svg width={width} height={height} className="main-chart__custom-svg">
                <defs>
                    <linearGradient id="main-chart-line-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity="0.28" />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {yTicks.map((tick, i) => (
                    <line
                        key={`grid-${i}`}
                        x1={MARGIN.left}
                        x2={MARGIN.left + effectiveWidth}
                        y1={yAt(tick)}
                        y2={yAt(tick)}
                        stroke="rgba(255, 255, 255, 0.06)"
                    />
                ))}

                {chartType === 'line' && (
                    <>
                        <path d={areaPath} fill="url(#main-chart-line-fill)" />
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    </>
                )}

                {chartType === 'candle' &&
                    data.map((point, index) => {
                        const x = xAt(index);
                        const openY = yAt(point.open);
                        const closeY = yAt(point.close);
                        const highY = yAt(point.high);
                        const lowY = yAt(point.low);
                        const bullish = point.close >= point.open;
                        const bodyTop = Math.min(openY, closeY);
                        const bodyHeight = Math.max(1, Math.abs(openY - closeY));
                        const color = bullish ? '#22c55e' : '#ef4444';

                        return (
                            <g key={`${point.time}-${index}`}>
                                <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
                                <rect
                                    x={x - candleWidth / 2}
                                    y={bodyTop}
                                    width={candleWidth}
                                    height={bodyHeight}
                                    fill={color}
                                    rx={1}
                                />
                            </g>
                        );
                    })}

                {xTickIndexes.map((index) => (
                    <text
                        key={`x-tick-${index}`}
                        x={xAt(index)}
                        y={height - 6}
                        fill="#a0aec0"
                        fontSize="11"
                        textAnchor="middle"
                    >
                        {data[index]?.date}
                    </text>
                ))}

                {yTicks.map((tick, i) => (
                    <text
                        key={`y-tick-${i}`}
                        x={width - 6}
                        y={yAt(tick) + 4}
                        fill="#a0aec0"
                        fontSize="11"
                        textAnchor="end"
                    >
                        {Formatter.formatPrice(tick)}
                    </text>
                ))}

                {hoverX !== null && (
                    <line
                        x1={hoverX}
                        x2={hoverX}
                        y1={MARGIN.top}
                        y2={MARGIN.top + plotHeight}
                        stroke="rgba(148, 163, 184, 0.6)"
                        strokeDasharray="4 4"
                    />
                )}

                <rect
                    x={MARGIN.left}
                    y={MARGIN.top}
                    width={effectiveWidth}
                    height={plotHeight}
                    fill="transparent"
                    onMouseMove={handlePointerMove}
                    onMouseLeave={() => {
                        setHoverIndex(null);
                    }}
                />
            </svg>

            {hovered && hoverIndex !== null && (
                <div
                    className="main-chart__custom-tooltip"
                    style={{
                        left: Math.min(Math.max((hoverX ?? 0) + 12, 8), Math.max(width - 190, 8)),
                        top: 14,
                    }}
                >
                    <div className="main-chart__custom-tooltip-time">{new Date(hovered.time).toLocaleString()}</div>
                    <div>Open: {Formatter.formatPrice(hovered.open)}</div>
                    <div>High: {Formatter.formatPrice(hovered.high)}</div>
                    <div>Low: {Formatter.formatPrice(hovered.low)}</div>
                    <div>Close: {Formatter.formatPrice(hovered.close)}</div>
                </div>
            )}
        </div>
    );
}
