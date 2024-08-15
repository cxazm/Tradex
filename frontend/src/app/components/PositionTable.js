import React, { useState, useEffect, useCallback } from 'react';

const PositionTable = () => {
  const [positions, setPositions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2;

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.positions) {
        setPositions(data.positions);
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
    <div className="p-2 rounded-lg bg-gray-800 max-w-4xl mx-auto">
      <h2 className="text-md font-bold mb-2 text-gray-300">Open Positions</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Symbol</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Side</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Quantity</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Entry Price</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">SL</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">TP</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Open Time</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">PnL</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-200">
          {currentPositions.map((position) => (
            <tr key={position.id}>
              <td className="px-4 py-2 text-sm text-blue-400">{position.symbol}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.id}</td>
              <td className={`px-4 py-2 text-sm ${position.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                {position.side}
              </td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.quantity}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.entryPrice.toFixed(2)}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.stopLoss.toFixed(2)}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{position.takeProfit.toFixed(2)}</td>
              <td className="px-4 py-2 text-sm text-yellow-400">{new Date(position.openTime).toLocaleString()}</td>
              <td className={`px-4 py-2 text-sm ${position.pnl > 0 ? 'text-green-500' : position.pnl < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                {position.pnl.toFixed(2)}
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