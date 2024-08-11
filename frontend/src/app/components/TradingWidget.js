import { useState, useEffect } from 'react';

const TradingWidget = () => {
  const [qty, setQty] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [price, setPrice] = useState('1.2345'); 
  useEffect(() => {
    const fetchPrice = () => {
    
      setPrice('1.2345');
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); 

    return () => clearInterval(interval);
  }, []);

  const handleBuy = () => {
    console.log('Buy', { qty, stopLoss, takeProfit, price });
    
  };

  const handleSell = () => {
    console.log('Sell', { qty, stopLoss, takeProfit, price });
    
  };

  return (
        <div className='w-64 p-4 bg-gray-800 rounded-md text-gray-300 shadow-md'>
          <div className='text-center mb-2'>
            <h3 className='text-lg'>EURUSD</h3>
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
