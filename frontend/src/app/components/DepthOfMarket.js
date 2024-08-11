
const DepthOfMarket = () => {
    const orders = {
      bids: [
        { price: 1.1834, volume: 500 },
        { price: 1.1833, volume: 450 },
        { price: 1.1832, volume: 300 },
      ],
      asks: [
        { price: 1.1835, volume: 600 },
        { price: 1.1836, volume: 550 },
        { price: 1.1837, volume: 400 },
      ],
    };
  
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full">
        <h2 className="text-center text-sm font-semibold mb-4 text-gray-300">Depth of Market</h2>
        
        <div className="flex justify-between">
          {/* Bids Section */}
          <div className="flex-1 mr-2 text-center">
            <h3 className="text-xs font-semibold text-green-500 mb-2 ">Bids</h3>
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Price</span>
              <span>Vols</span>
            </div>
            <ul className="space-y-1">
              {orders.bids.map((bid, index) => (
                <li key={index} className="flex justify-between text-xs">
                  <span className="text-gray-300">{bid.price}</span>
                  <span className="text-gray-400">{bid.volume}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Asks Section */}
          <div className="flex-1 ml-2 text-center">
            <h3 className="text-xs font-semibold text-red-500 mb-2">Asks</h3>
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Price</span>
              <span>Vols</span>
            </div>
            <ul className="space-y-1">
              {orders.asks.map((ask, index) => (
                <li key={index} className="flex justify-between text-xs">
                  <span className="text-gray-300">{ask.price}</span>
                  <span className="text-gray-400">{ask.volume}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  export default DepthOfMarket;
  