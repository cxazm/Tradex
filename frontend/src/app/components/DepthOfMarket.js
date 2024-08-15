import React, { useState, useEffect, useCallback, useRef } from 'react';

const DepthOfMarket = () => {
  const [orders, setOrders] = useState({
    bids: [],
    asks: []
  });
  const symbol = 'BTCUSD';
  const wsRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('WebSocket connected for Depth of Market');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.orderBooks && data.orderBooks[symbol]) {
        setOrders({
          bids: data.orderBooks[symbol].bids,
          asks: data.orderBooks[symbol].asks
        });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected for Depth of Market');
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current = ws;
  }, [symbol]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  //format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  //calculate color intensity based on volume
  const getVolumeColor = (volume, max, isAsk) => {
    const intensity = Math.min((volume / max) * 0.8 + 0.2, 1);
    const r = isAsk ? Math.round(255 * intensity) : 0;
    const g = isAsk ? 0 : Math.round(255 * intensity);
    const b = 0;
    const a = 0.15; // Set a low alpha for a subtle effect or hint
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  //find max volume for color scaling
  const maxVolume = Math.max(
    ...orders.bids.map(b => b.volume),
    ...orders.asks.map(a => a.volume)
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
      <h2 className="text-center text-sm font-semibold mb-4 text-gray-300">Depth of Market</h2>
      
      <div className="flex justify-between">
        {/* Bids Section */}
        <div className="flex-1 mr-2">
          <h3 className="text-xs font-semibold text-green-500 mb-2 text-center">Bids</h3>
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
            <span>Price</span>
            <span>Volume</span>
          </div>
          <ul className="space-y-1">
            {orders.bids.map((bid, index) => (
              <li key={index} className="flex justify-between text-xs items-center" 
                  style={{backgroundColor: getVolumeColor(bid.volume, maxVolume, false)}}>
                <span className="text-green-400 font-medium">{bid.price.toFixed(2)}</span>
                <span className="text-gray-400">{formatNumber(bid.volume)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Asks Section */}
        <div className="flex-1 ml-2">
          <h3 className="text-xs font-semibold text-red-500 mb-2 text-center">Asks</h3>
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
            <span>Price</span>
            <span>Volume</span>
          </div>
          <ul className="space-y-1">
            {orders.asks.map((ask, index) => (
              <li key={index} className="flex justify-between text-xs items-center"
                  style={{backgroundColor: getVolumeColor(ask.volume, maxVolume, true)}}>
                <span className="text-red-400 font-medium">{ask.price.toFixed(2)}</span>
                <span className="text-gray-400">{formatNumber(ask.volume)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepthOfMarket;