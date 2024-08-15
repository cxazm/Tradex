import { createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

export const ChartComponent = ({ data, colors }) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const resizeObserver = useRef();

  useEffect(() => {
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.current.addCandlestickSeries({
      upColor: colors.upColor,
      downColor: colors.downColor,
      borderDownColor: colors.downColor,
      borderUpColor: colors.upColor,
      wickDownColor: colors.downColor,
      wickUpColor: colors.upColor,
    });

    candlestickSeries.setData(data);

    //resize observer
    resizeObserver.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.current.applyOptions({ width, height });
      setTimeout(() => {
        chart.current.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current);

    return () => {
      chart.current.remove();
      resizeObserver.current.disconnect();
    };
  }, [data, colors]);

  return <div ref={chartContainerRef} style={{ width: '500px', height: '370px' }} />;
};

const PriceChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.candles && data.candles['BTCUSD']) {
        const newCandle = data.candles['BTCUSD'];
        const timestamp = Math.floor(newCandle.timestamp / (5 * 60)) * (5 * 60);
        setChartData(prevData => {
          const lastCandle = prevData[prevData.length - 1];
          if (lastCandle && lastCandle.time === timestamp) {
            // update the last candle
            return [
              ...prevData.slice(0, -1),
              {
                time: timestamp,
                open: lastCandle.open,
                high: Math.max(lastCandle.high, newCandle.high),
                low: Math.min(lastCandle.low, newCandle.low),
                close: newCandle.close
              }
            ];
          } else {
            // add a new candle
            return [...prevData, {
              time: timestamp,
              open: newCandle.open,
              high: newCandle.high,
              low: newCandle.low,
              close: newCandle.close
            }];
          }
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const chartColors = {
    backgroundColor: '#1e293b',
    textColor: '#e2e8f0',
    upColor: '#10b981',
    downColor: '#ef4444',
  };

  return (
    <>
      <h2 className="text-center text-sm font-semibold mb-1 text-gray-300">BTCUSD Price Chart (5 min)</h2>
      <ChartComponent data={chartData} colors={chartColors} />
    </>
  );
};

export default PriceChart;
