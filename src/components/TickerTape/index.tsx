import { useEffect, useRef } from 'react';
import type { TickerTapeProps } from '../../types/crypto';
import Formatter from '../../utils/Formatter';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './ticker-tape.scss';

export function TickerTape({ cryptoData }: TickerTapeProps) {
    const tickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ticker = tickerRef.current;
        if (!ticker) return;

        let animationId: number;
        let position = 0;

        const animate = () => {
            position -= 1;

            if (ticker.firstElementChild) {
                const firstChild = ticker.firstElementChild as HTMLElement;
                if (Math.abs(position) >= firstChild.offsetWidth) {
                position = 0;
                }
            }

            ticker.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, []);

    // Duplicate array for seamless loop
    const tickerItems = [...cryptoData, ...cryptoData];

    return (
        <div className="ticker-tape">
            <div ref={tickerRef} className="ticker-tape__container">
                {tickerItems.map((coin, index) => {
                const isPositive = coin.change24h >= 0;
                    return (
                        <div
                            key={`${coin.id}-${index}`}
                            className="ticker-tape__item"
                        >
                            <img
                                src={coin.image}
                                className="ticker-tape__logo" 
                            />
                            <div className="ticker-tape__info">
                                <span className="ticker-tape__symbol">
                                    {coin.symbol}
                                </span>
                                <span className="ticker-tape__price">
                                    {Formatter.formatPrice(coin.price)}
                                </span>
                                <span className={`ticker-tape__change ${
                                    isPositive ? 'ticker-tape__change--positive' : 'ticker-tape__change--negative'
                                }`}>
                                    {isPositive ? (
                                        <TrendingUp className="ticker-tape__change-icon" />
                                    ) : (
                                        <TrendingDown className="ticker-tape__change-icon" />
                                    )}
                                    {Formatter.formatPercentage(coin.change24h)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TickerTape;