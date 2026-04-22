import React from "react";

export default function StampDutySettings({
  stampDuty,
  setStampDuty,
  stampDutyMethod,
  setStampDutyMethod,
  isManual
}) {
  return (
    <div className="mb-4">
      {/* Stamp Duty Value Input */}
      <div className="flex justify-between items-center mb-6 px-4">
        <label className="text-sm text-gray-600">Stamp duty:</label>
        <input
          type="number"
          value={stampDuty}
          onChange={(e) => setStampDuty(e.target.value)}
          disabled={!isManual}
          className={`border rounded px-2 py-1 w-32 text-right focus:outline-none ${
            isManual ? "border-gray-300 focus:border-blue-500" : "bg-gray-100 border-gray-200 text-gray-400"
          }`}
        />
      </div>

      {/* Stamp Duty Calculation Method */}
      <div className="p-4 border border-gray-200 rounded-md">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 -mt-6 bg-white w-max px-1">
          Stamp Duty Calculation
        </h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="stampDutyMethod"
              value="auto_total"
              checked={stampDutyMethod === "auto_total"}
              onChange={() => setStampDutyMethod("auto_total")}
              className="text-blue-600 focus:ring-blue-500"
            />
            Automatic (total property price)
          </label>
          
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="stampDutyMethod"
              value="auto_land"
              checked={stampDutyMethod === "auto_land"}
              onChange={() => setStampDutyMethod("auto_land")}
              className="text-blue-600 focus:ring-blue-500"
            />
            Automatic (price of the land only)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="radio"
              name="stampDutyMethod"
              value="manual"
              checked={stampDutyMethod === "manual"}
              onChange={() => setStampDutyMethod("manual")}
              className="text-blue-600 focus:ring-blue-500"
            />
            Specified manually
          </label>
        </div>
      </div>
    </div>
  );
}