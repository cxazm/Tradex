"use client";
import ForexPriceWidget from './components/ForexPriceWidget';
import PriceChart from './components/PriceChart';
import TradingWidget from './components/TradingWidget';
import DepthOfMarket from './components/DepthOfMarket';
import PositionTable from './components/PositionTable';


export default function Home() {
  return (
    <div className="flex flex-col  min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-semibold mt-4 mb-4 text-center text-teal-300">Visualizer Dashboard</h1>
      
      <div className="flex justify-center items-start gap-8 w-full max-w-screen-xl">
        {/* Price Chart */}
        <div className="flex-1 ml-14 ">
          <PriceChart />
        </div>
        
        <div className="flex flex-col justify-center">
          {/* Price Widget */}
          <div className="flex flex-col justify-center">
            <ForexPriceWidget />
            <div className="mt-6">
              <DepthOfMarket />
            </div>
            </div>
          </div>

        {/* Trading Widget */}
        <div className="flex flex-col justify-center">
          <TradingWidget />
        </div>
      </div>

      {/* Open Positions table */}
      <div className=" mt-2 -mr-60">
         <PositionTable />
      </div>
    </div>
  );
}
