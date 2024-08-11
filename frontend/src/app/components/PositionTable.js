import React, { useState } from 'react';


const positions = [
  { symbol: 'EUR/USD', ticket: '123456', type: 'Buy', volume: '1.0', openPrice: '1.2000', sl: '1.1900', tp: '1.2100', openingTime: '2024-08-10 12:30', profitLoss: '50.00' },
  { symbol: 'GBP/USD', ticket: '123457', type: 'Sell', volume: '0.5', openPrice: '1.3500', sl: '1.3600', tp: '1.3400', openingTime: '2024-08-10 13:00', profitLoss: '-20.00' },
  
];

const PositionTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(positions.length / itemsPerPage);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === 'next') {
        return Math.min(prevPage + 1, totalPages - 1);
      } else if (direction === 'prev') {
        return Math.max(prevPage - 1, 0);
      }
      return prevPage;
    });
  };

  const startIndex = currentPage * itemsPerPage;
  const currentPositions = positions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-2 rounded-lg  bg-gray-800 max-w-4xl mx-auto">
      <h2 className="text-md font-bold mb-2 text-gray-300">Open Positions</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Symbol</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Ticket</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Type</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Volume</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Open Price</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">SL</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">TP</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Opening Time</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Profit</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-200">
          {currentPositions.map((position, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-sm text-blue-400">{position.symbol}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.ticket}</td>
              <td className={`px-4 py-2 text-sm ${position.type === 'Buy' ? 'text-green-500' : 'text-red-500'}`}>
                {position.type}
              </td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.volume}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.openPrice}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.sl}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.tp}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.openingTime}</td>
              <td className={`px-4 py-2 text-sm ${position.profitLoss > 0 ? 'text-green-500' : position.profitLoss < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                {position.profitLoss}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-2">
        <button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 0}
          className="px-2 py-1 bg-teal-600 text-gray-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="self-center text-gray-300">Page {currentPage + 1} of {totalPages}</span>
        <button
          onClick={() => handlePageChange('next')}
          disabled={currentPage === totalPages - 1}
          className="px-2 py-1 bg-teal-600 text-gray-300 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PositionTable;
