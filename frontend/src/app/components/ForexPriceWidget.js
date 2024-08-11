import { useState, useEffect } from 'react';

const ForexPriceWidget = () => {
  const [bidPrice, setBidPrice] = useState('1.2345'); 
  const [askPrice, setAskPrice] = useState('1.2348'); 
  const [symbol, setSymbol] = useState('EURUSD');

  useEffect(() => {
    const fetchPrices = () => {
      
      setBidPrice((Math.random() * 0.01 + 1.2340).toFixed(4));
      setAskPrice((Math.random() * 0.01 + 1.2345).toFixed(4));
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 1000); 
    return () => clearInterval(interval);
  }, []);

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
