
import { createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';


export const ChartComponent = (props) => {
    const {
        data,
        colors: {
            backgroundColor = 'black',
            textColor = 'white',
        } = {},
    } = props;

    const chartContainerRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: 600,
            height: 327,
        });

        chart.timeScale().fitContent();

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#4caf50', // Green for bullish candles
            downColor: '#f44336', // Red for bearish candles
            borderDownColor: '#f44336',
            borderUpColor: '#4caf50',
            wickDownColor: '#f44336',
            wickUpColor: '#4caf50',
        });

        candlestickSeries.setData(data);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, textColor]);

    return <div ref={chartContainerRef} />;
};

const initialData = [
    { time: '2018-12-22', open: 32.51, high: 33.51, low: 32.01, close: 33.11 },
    { time: '2018-12-23', open: 33.11, high: 33.91, low: 32.11, close: 33.51 },
    { time: '2018-12-24', open: 33.51, high: 34.01, low: 32.81, close: 33.01 },
    { time: '2018-12-25', open: 33.01, high: 33.81, low: 32.61, close: 33.71 },
    { time: '2018-12-26', open: 33.71, high: 34.11, low: 33.01, close: 33.21 },
    { time: '2018-12-27', open: 33.21, high: 34.51, low: 33.11, close: 34.01 },
    { time: '2018-12-28', open: 34.01, high: 34.21, low: 33.31, close: 33.41 },
    { time: '2018-12-29', open: 33.41, high: 34.31, low: 33.21, close: 34.11 },
    { time: '2018-12-30', open: 34.11, high: 34.91, low: 33.91, close: 34.71 },
    { time: '2018-12-31', open: 34.71, high: 35.01, low: 34.41, close: 34.91 },
];

const PriceChart = (props) => {
  return (
    <ChartComponent {...props} data={initialData}></ChartComponent>
  )
}

export default PriceChart