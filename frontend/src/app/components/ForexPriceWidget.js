import { useState, useEffect, useCallback } from 'react';

const ForexPriceWidget = () => {
  const [bidPrice, setBidPrice] = useState('50000.00');
  const [askPrice, setAskPrice] = useState('50000.00');
  const symbol = 'BTCUSD';

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.orderBooks && data.orderBooks[symbol]) {
        const orderBook = data.orderBooks[symbol];
        if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
          setBidPrice(orderBook.bids[0].price.toFixed(2));
          setAskPrice(orderBook.asks[0].price.toFixed(2));
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(connectWebSocket, 5000);
    };

    return ws;
  }, []);

  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      ws.close();
    };
  }, [connectWebSocket]);

  return (
    <div className='w-72 p-6 bg-gray-800 rounded-md text-white shadow-md text-center'>
      <h3 className='text-lg text-gray-300'>{symbol}</h3>
      
      <div className='mt-4 flex justify-between'>
        <div className='text-left'>
          <p className='text-sm font-bold text-gray-300'>Bid</p>
          <p className='text-lg text-green-500'>{bidPrice}</p>
        </div>
        
        <div className='text-right'>
          <p className='text-sm font-bold text-gray-300'>Ask</p>
          <p className='text-lg text-red-500'>{askPrice}</p>
        </div>
      </div>
    </div>
  )
};

export default ForexPriceWidget;