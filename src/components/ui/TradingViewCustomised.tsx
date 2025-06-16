import { useEffect, useRef } from 'react';


interface TradingViewCustomisedProps {
    symbol: string;
}

export const TradingViewCustomised: React.FC<TradingViewCustomisedProps> = ({ symbol }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (container.current && !(window as any).TradingView) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => {
                new (window as any).TradingView.widget({
                    container_id: 'tv_chart_container',
                    autosize: true,
                    symbol: symbol, // change to your symbol
                    interval: '1',
                    timezone: 'Etc/UTC',
                    theme: 'dark',
                    style: '1',
                    locale: 'en',
                    enable_publishing: false,
                    hide_top_toolbar: false,
                    hide_legend: false,
                    allow_symbol_change: true,
                    details: true,
                    calendar: false,
                    support_host: 'https://www.tradingview.com',
                });
            };
            document.body.appendChild(script);
        }
    }, []);

    return (<div className='h-full w-full'>
        <div id="tv_chart_container" ref={container} className="w-w-full h-full " />
    </div>
    );
};
