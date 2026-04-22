import React from "react";

export default function HouseAndLandInputs({
  priceOfLand,
  setPriceOfLand,
  priceOfBuilding,
  setPriceOfBuilding,
  otherCosts,
  setOtherCosts,
  totalPropertyPrice,
}) {
  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-md">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 -mt-6 bg-white w-max px-1">
        House & Land Package
      </h4>
      
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600">Price of land:</label>
          <input
            type="number"
            value={priceOfLand}
            onChange={(e) => setPriceOfLand(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-32 text-right focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600">Price of building construction:</label>
          <input
            type="number"
            value={priceOfBuilding}
            onChange={(e) => setPriceOfBuilding(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-32 text-right focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600">Other costs (eg landscaping):</label>
          <input
            type="number"
            value={otherCosts}
            onChange={(e) => setOtherCosts(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-32 text-right focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <label className="text-sm font-bold text-gray-800">Total property price ($)</label>
          <span className="text-sm font-bold text-gray-800">
            {totalPropertyPrice.toLocaleString("en-NZ")}
          </span>
        </div>
      </div>
    </div>
  );
}