"use client";

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register components with ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const useWebSocket = (url) => {
  const [prices, setPrices] = useState({ EURUSD: 0, BTCUSD: 0 });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'EUR/USD',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    }],
  });

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices(data);
      setChartData(prevData => ({
        labels: [...prevData.labels, new Date().toLocaleTimeString()],
        datasets: [{
          ...prevData.datasets[0],
          data: [...prevData.datasets[0].data, data.EURUSD],
        }],
      }));
    };
    return () => ws.close();
  }, [url]);

  return { prices, chartData };
};

export default function Home() {
  const { prices, chartData } = useWebSocket("ws://localhost:8080/ws");

  return (
    <div>
      <h1>Trading Dashboard</h1>
      <div>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'EUR/USD Prices' }}}} />
      </div>
      <div>
        <h2>EUR/USD: {prices.EURUSD}</h2>
      </div>
      <div>
        <h2>BTC/USD: {prices.BTCUSD}</h2>
      </div>
    </div>
  );
}
