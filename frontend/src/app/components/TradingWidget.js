import { useState, useEffect } from 'react';

const TradingWidget = () => {
  const [qty, setQty] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [price, setPrice] = useState('50000.00'); //  we set initial BTCUSD price
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbols && data.symbols.BTCUSD) {
        setPrice(data.symbols.BTCUSD.toFixed(2));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleBuy = () => {
    sendOrder('BUY');
  };

  const handleSell = () => {
    sendOrder('SELL');
  };

  const sendOrder = (side) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const order = {
        symbol: 'BTCUSD',
        side: side,
        quantity: parseFloat(qty),
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit)
      };
      ws.send(JSON.stringify(order));
      console.log(`${side} order sent:`, order);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <div className='w-64 p-4 bg-gray-800 rounded-md text-gray-300 shadow-md'>
      <div className='text-center mb-2'>
        <h3 className='text-lg'>BTCUSD</h3>
        <p className='text-xl font-bold'>{price}</p>
      </div>
      
      <div className='mb-2'>
        <label>Quantity</label>
        <input 
          type="number" 
          value={qty} 
          onChange={(e) => setQty(e.target.value)} 
          className='w-full p-1 mt-2 rounded-md border border-gray-400 bg-gray-700 text-gray-300'
        />
      </div>
      
      <div className='mb-2'>
        <label>Stop Loss</label>
        <input 
          type="number" 
          value={stopLoss} 
          onChange={(e) => setStopLoss(e.target.value)} 
          className='w-full p-1 mt-2 rounded-md border border-gray-400 bg-gray-700 text-gray-300'
        />
      </div>
      
      <div className='mb-2'>
        <label>Take Profit</label>
        <input 
          type="number" 
          value={takeProfit} 
          onChange={(e) => setTakeProfit(e.target.value)} 
          className='w-full p-1 mt-2 rounded-md border border-gray-400 bg-gray-700 text-gray-300'
        />
      </div>
      
      <div className='flex justify-between gap-2'>
        <button 
          onClick={handleBuy}
          className='w-1/2 p-2 bg-blue-500 text-gray-300 rounded-md hover:bg-blue-700'
        >
          Buy
        </button>
        <button 
          onClick={handleSell}
          className='w-1/2 p-2 bg-red-500 text-gray-300 rounded-md hover:bg-red-700'
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default TradingWidget;