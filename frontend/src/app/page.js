"use client";
import ForexPriceWidget from './components/ForexPriceWidget';
import PriceChart from './components/PriceChart';
import TradingWidget from './components/TradingWidget';
import DepthOfMarket from './components/DepthOfMarket';
import PositionTable from './components/PositionTable';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-semibold mt-4 mb-4 text-center text-teal-300">Visualizer Dashboard</h1>

      <div className="flex justify-center items-end gap-8 w-full max-w-screen-xl mx-auto px-4">
        <div className="flex-1">
          <PriceChart />
        </div>

        <div className="flex flex-col gap-6 justify-end">
          <ForexPriceWidget />
          <DepthOfMarket />
        </div>
        <div className="flex-1">
          <TradingWidget />
        </div>
      </div>
      <div className="mt-4 flex justify-center mr-10">
        <div className="w-full max-w-screen-lg">
          <PositionTable />
        </div>
      </div>
    </div>
  );
}
