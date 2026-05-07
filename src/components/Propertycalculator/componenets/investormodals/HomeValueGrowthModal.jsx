import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

// Helper functions just for this component
const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
const formatGrowthVal = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(3) + "m";
  return Math.round(val).toLocaleString("en-NZ");
};

export default function HomeValueGrowthModal({ isOpen, onClose, initialHomeValue }) {
  const [startYear, setStartYear] = useState(1);
  const [baseValue, setBaseValue] = useState("900,000");
  const [averageRate, setAverageRate] = useState("5.00");
  const [rates, setRates] = useState(Array(30).fill("5.00"));

  useEffect(() => {
    if (isOpen) {
      setBaseValue(initialHomeValue || "0");
      setStartYear(1);
    }
  }, [isOpen, initialHomeValue]);

  const projectedValues = useMemo(() => {
    let currentBase = parseNum(baseValue);
    const calculated = [];
    for (let i = 0; i < 30; i++) {
      const rateNum = parseFloat(rates[i]) || 0;
      currentBase = currentBase * (1 + rateNum / 100);
      calculated.push(currentBase);
    }
    return calculated;
  }, [baseValue, rates]);

  const navPrev5 = () => setStartYear((s) => Math.max(1, s - 5));
  const navPrev1 = () => setStartYear((s) => Math.max(1, s - 1));
  const navNext1 = () => setStartYear((s) => Math.min(26, s + 1));
  const navNext5 = () => setStartYear((s) => Math.min(26, s + 5));

  const handleBaseValueChange = (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, "");
    setBaseValue(val);
  };

  const handleAverageRateChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setAverageRate(val);
    setRates(Array(30).fill(val || "0"));
  };

  const handleIndividualRateChange = (index, val) => {
    const cleanVal = val.replace(/[^0-9.]/g, "");
    const newRates = [...rates];
    newRates[index] = cleanVal;
    setRates(newRates);
  };

  const handleRateBlur = (index) => {
    const newRates = [...rates];
    const num = parseFloat(newRates[index]) || 0;
    newRates[index] = num.toFixed(2);
    setRates(newRates);
  };

  const handleAvgRateBlur = () => {
    const num = parseFloat(averageRate) || 0;
    setAverageRate(num.toFixed(2));
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[680px] flex flex-col border border-[#CBD5E1] overflow-hidden transition-all">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Home Value Growth (30 Years)</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-8 bg-white flex flex-col gap-5">
          <div className="grid grid-cols-7 gap-3 items-center text-[13px] text-[#1E293B]">
            <div className="text-right pr-2 font-medium">End of year:</div>
            <div className="text-center font-medium">Average</div>
            {[0, 1, 2, 3, 4].map((offset) => (
              <div key={offset} className="text-center font-bold text-[#0052CC]">
                {startYear + offset}yr
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 items-center">
            <div className="text-[13px] text-[#1E293B] text-right pr-2">Property value:</div>

            <input
              type="text"
              value={startYear === 1 ? baseValue : formatGrowthVal(projectedValues[startYear - 2] || baseValue)}
              onChange={startYear === 1 ? handleBaseValueChange : undefined}
              readOnly={startYear > 1}
              className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right shadow-sm focus:outline-none focus:border-[#0052CC] ${startYear === 1 ? "bg-[#EFF6FF] text-[#0052CC] font-medium" : "bg-gray-100 text-gray-500"}`}
            />

            {[0, 1, 2, 3, 4].map((offset) => {
              const yearIndex = startYear - 1 + offset;
              return (
                <input
                  key={`val-${yearIndex}`}
                  type="text"
                  value={formatGrowthVal(projectedValues[yearIndex])}
                  readOnly
                  className="w-full border border-[#CBD5E1] bg-gray-50 rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none"
                />
              );
            })}
          </div>

          <div className="grid grid-cols-7 gap-3 items-center">
            <div className="text-[13px] text-[#1E293B] text-right pr-2">Growth rates:</div>

            <div className="relative">
              <input
                type="text"
                value={averageRate}
                onChange={handleAverageRateChange}
                onBlur={handleAvgRateBlur}
                className="w-full border border-[#CBD5E1] bg-white rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] pr-5 shadow-sm focus:outline-none focus:border-[#0052CC]"
              />
              <span className="absolute right-2 top-1.5 text-[13px] text-gray-500">%</span>
            </div>

            {[0, 1, 2, 3, 4].map((offset) => {
              const yearIndex = startYear - 1 + offset;
              return (
                <div key={`rate-${yearIndex}`} className="relative">
                  <input
                    type="text"
                    value={rates[yearIndex]}
                    onChange={(e) => handleIndividualRateChange(yearIndex, e.target.value)}
                    onBlur={() => handleRateBlur(yearIndex)}
                    className="w-full border border-[#CBD5E1] bg-white rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] pr-5 shadow-sm focus:outline-none focus:border-[#0052CC]"
                  />
                  <span className="absolute right-2 top-1.5 text-[13px] text-gray-500">%</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-2 mt-4 items-center">
            <div className="text-[12px] text-gray-500 mr-2 font-medium w-[60px] text-right">Timeline:</div>
            <button onClick={navPrev5} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&lt;&lt;</button>
            <button onClick={navPrev1} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&lt;</button>
            <button onClick={navNext1} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&gt;</button>
            <button onClick={navNext5} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&gt;&gt;</button>
            <button onClick={onClose} className="ml-4 w-[80px] py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>
            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
