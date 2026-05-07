import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function InterestRatesModal({ isOpen, onClose, onSave, initialRate }) {
  const [startYear, setStartYear] = useState(1); // Timeline scroll position (1 to 26)
  const [averageRate, setAverageRate] = useState("6.50");
  const [rates, setRates] = useState(Array(30).fill("6.50")); // 30 years of rates

  // Sync initial values when opened
  useEffect(() => {
    if (isOpen) {
      const rate = initialRate || "6.50";
      setAverageRate(rate);
      setRates(Array(30).fill(rate));
      setStartYear(1);
    }
  }, [isOpen, initialRate]);

  // Navigation Handlers
  const navPrev5 = () => setStartYear((s) => Math.max(1, s - 5));
  const navPrev1 = () => setStartYear((s) => Math.max(1, s - 1));
  const navNext1 = () => setStartYear((s) => Math.min(26, s + 1));
  const navNext5 = () => setStartYear((s) => Math.min(26, s + 5));

  // Input Handlers
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

  // NEW: Save handler passes data back to parent
  const handleOk = () => {
    if (onSave) onSave(averageRate);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden transition-all">

        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Interest Rates (30 Years)</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-8 bg-white flex flex-col gap-5">

          {/* Headers */}
          <div className="grid grid-cols-6 gap-3 items-center text-[13px] text-[#1E293B]">
            <div className="text-center font-medium">Average</div>
            {[0, 1, 2, 3, 4].map((offset) => (
              <div key={offset} className="text-center font-bold text-[#0052CC]">
                {startYear + offset}yr
              </div>
            ))}
          </div>

          {/* Rates Row */}
          <div className="grid grid-cols-6 gap-3 items-center">

            {/* Average Rate */}
            <div className="relative">
              <input
                type="text"
                value={averageRate}
                onChange={handleAverageRateChange}
                onBlur={handleAvgRateBlur}
                className="w-full border border-[#CBD5E1] bg-[#EFF6FF] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#0052CC] font-medium pr-5 shadow-sm focus:outline-none focus:border-[#0052CC]"
              />
              <span className="absolute right-2 top-1.5 text-[13px] text-[#0052CC] font-medium">%</span>
            </div>

            {/* Render 5 dynamic rate inputs based on scroll position */}
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

          {/* Timeline Navigation Controls */}
          <div className="flex justify-center gap-2 mt-4 items-center">
            <div className="text-[12px] text-gray-500 mr-2 font-medium w-[60px] text-right">Timeline:</div>
            <button onClick={navPrev5} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&lt;&lt;</button>
            <button onClick={navPrev1} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&lt;</button>
            <button onClick={navNext1} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&gt;</button>
            <button onClick={navNext5} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&gt;&gt;</button>

            {/* UPDATED: Calling handleOk instead of onClose */}
            <button onClick={handleOk} className="ml-4 w-[80px] py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>

            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
