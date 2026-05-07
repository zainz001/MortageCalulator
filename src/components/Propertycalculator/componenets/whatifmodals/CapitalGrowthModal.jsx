import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

// Helper functions
const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
const formatGrowthVal = (val) => {
  if (val >= 1000000) return (val / 1000000).toFixed(3) + "m";
  return Math.round(val).toLocaleString("en-NZ");
};

export default function CapitalGrowthModal({
  isOpen,
  onClose,
  capitalGrowthRate,
  setCapitalGrowthRate,
  capitalizationRate,
  setCapitalizationRate,
  capitalGrowthMode,
  setCapitalGrowthMode,
  propertyValue,
  setPropertyValue,
  grossRentWeekly,
  rentalExpensesPercent,
  rentalIncomeRate,
}) {
  const [startYear, setStartYear] = useState(1);
  const [activeRow, setActiveRow] = useState("growth"); 
  const [averageRate, setAverageRate] = useState("5.00");
  const [rates, setRates] = useState(Array(30).fill("5.00"));

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartYear(1);
      const mode = capitalGrowthMode || "growth";
      setActiveRow(mode);
      const initRate = mode === "growth" ? (capitalGrowthRate || "5.00") : (capitalizationRate || "3.00");
      setAverageRate(initRate);
      setRates(Array(30).fill(initRate));
    }
  }, [isOpen, capitalGrowthMode, capitalGrowthRate, capitalizationRate]);

  // Pre-calculate 30 years of Net Rent to properly derive Cap Rates and Property Values
  const netRents = useMemo(() => {
    const baseGrossRent = parseNum(grossRentWeekly) * 52;
    const expenseRate = parseNum(rentalExpensesPercent) / 100;
    const initialNetRent = baseGrossRent * (1 - expenseRate);
    const rentGrowth = parseNum(rentalIncomeRate) / 100;

    const rents = [];
    for (let i = 0; i <= 30; i++) {
      // i=0 is Initial (Year 0), i=1 is Year 1
      rents.push(initialNetRent * Math.pow(1 + rentGrowth, i - 1));
    }
    return rents;
  }, [grossRentWeekly, rentalExpensesPercent, rentalIncomeRate]);

  // Dynamically calculate Arrays based on which row is active
  const pvArr = new Array(31).fill(0);
  const growthArr = new Array(31).fill(0);
  const capArr = new Array(31).fill(0);

  if (activeRow === "growth") {
    pvArr[0] = parseNum(propertyValue);
    capArr[0] = pvArr[0] > 0 ? (netRents[0] / pvArr[0]) * 100 : 0;
    
    for (let i = 1; i <= 30; i++) {
      const g = parseFloat(rates[i - 1]) || 0;
      growthArr[i] = g;
      pvArr[i] = pvArr[i - 1] * (1 + g / 100);
      capArr[i] = pvArr[i] > 0 ? (netRents[i] / pvArr[i]) * 100 : 0;
    }
  } else { // activeRow === "capitalization"
    const cap0 = parseFloat(rates[0]) || 0.0001; // Avoid divide by zero
    capArr[0] = cap0;
    pvArr[0] = netRents[0] / (cap0 / 100); // Back-calculates the Initial Property Value

    for (let i = 1; i <= 30; i++) {
      const c = parseFloat(rates[i - 1]) || 0.0001;
      capArr[i] = c;
      pvArr[i] = netRents[i] / (c / 100);
      growthArr[i] = pvArr[i - 1] > 0 ? ((pvArr[i] - pvArr[i - 1]) / pvArr[i - 1]) * 100 : 0;
    }
  }

  // --- Handlers ---
  const navPrev5 = () => setStartYear((s) => Math.max(1, s - 5));
  const navPrev1 = () => setStartYear((s) => Math.max(1, s - 1));
  const navNext1 = () => setStartYear((s) => Math.min(26, s + 1));
  const navNext5 = () => setStartYear((s) => Math.min(26, s + 5));

  const handleSwitchRow = (newRow) => {
    if (newRow === activeRow) return;
    if (newRow === "capitalization") {
      const newRates = capArr.slice(1).map((v) => v.toFixed(2));
      setRates(newRates);
      setAverageRate(newRates[0]);
    } else {
      const newRates = growthArr.slice(1).map((v) => v.toFixed(2));
      setRates(newRates);
      setAverageRate(newRates[0]);
    }
    setActiveRow(newRow);
  };

  const handleAverageRateChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setAverageRate(val);
    setRates(Array(30).fill(val || "0"));
  };

  const handleIndividualRateChange = (index, val) => {
    const newRates = [...rates];
    newRates[index] = val.replace(/[^0-9.]/g, "");
    setRates(newRates);
  };

  const handleRateBlur = (index) => {
    const newRates = [...rates];
    newRates[index] = (parseFloat(newRates[index]) || 0).toFixed(2);
    setRates(newRates);
  };

  const handleAvgRateBlur = () => setAverageRate((parseFloat(averageRate) || 0).toFixed(2));

  const handleSave = () => {
    if (activeRow === "growth") {
      setCapitalGrowthRate(averageRate);
      if (setCapitalizationRate) setCapitalizationRate(capArr[1].toFixed(2));
    } else {
      setCapitalGrowthRate(growthArr[1].toFixed(2));
      if (setCapitalizationRate) setCapitalizationRate(averageRate);
      // Update the main calculator's Property Value!
      if (setPropertyValue) setPropertyValue(Math.round(pvArr[0]).toString());
    }
    if (setCapitalGrowthMode) setCapitalGrowthMode(activeRow);
    onClose();
  };

  if (!isOpen) return null;

  const isGrowth = activeRow === "growth";
  const isCap = activeRow === "capitalization";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[720px] flex flex-col border border-[#CBD5E1] overflow-hidden transition-all font-sans">

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Investment Property Growth</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content */}
        <div className="p-8 bg-[#F8FAFC] flex flex-col">
          
          {/* Top Section: Static Text Grid */}
          <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-3 items-center text-[13px] text-[#1E293B] mb-8">
            <div className="text-right pr-2 font-medium">End of year:</div>
            <div className="text-center font-medium">{startYear === 1 ? "Initial" : `${startYear - 1}yr`}</div>
            {[0, 1, 2, 3, 4].map((offset) => (
              <div key={offset} className="text-center font-medium">
                {startYear + offset}yr
              </div>
            ))}

            <div className="text-right pr-2 font-medium mt-2">Property value:</div>
            <div className="text-center mt-2">{formatGrowthVal(pvArr[startYear - 1])}</div>
            {[0, 1, 2, 3, 4].map((offset) => {
              const yearIndex = startYear + offset;
              return (
                <div key={`val-${yearIndex}`} className="text-center mt-2">
                  {formatGrowthVal(pvArr[yearIndex])}
                </div>
              );
            })}
          </div>

          {/* Middle Section: Display in Spreadsheet Fieldset */}
          <fieldset className="border border-[#CBD5E1] p-4 rounded-[6px] relative">
            <legend className="text-[13px] text-[#1E293B] font-medium px-2 bg-[#F8FAFC] ml-2">
              Display in Spreadsheet
            </legend>

            <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-x-3 gap-y-4 items-center">
              
              {/* Header Row */}
              <div></div>
              <div className="text-center text-[13px] font-medium text-[#1E293B]">Average</div>
              <div className="col-span-5"></div>

              {/* Capital Growth Rates Row */}
              <div 
                className="flex items-center gap-2 justify-end pr-2 cursor-pointer"
                onClick={() => handleSwitchRow("growth")}
              >
                <input 
                  type="radio" 
                  checked={isGrowth} 
                  onChange={() => handleSwitchRow("growth")} 
                  className="accent-[#0052CC] w-3.5 h-3.5 cursor-pointer" 
                />
                <span className="text-[13px] text-[#1E293B] whitespace-nowrap">Capital growth rates:</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={isGrowth ? averageRate : (growthArr[1]?.toFixed(2) || "0.00")}
                  onChange={isGrowth ? handleAverageRateChange : undefined}
                  onBlur={isGrowth ? handleAvgRateBlur : undefined}
                  readOnly={!isGrowth}
                  className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right pr-5 shadow-sm focus:outline-none ${isGrowth ? "bg-white text-[#1E293B] focus:border-[#0052CC]" : "bg-gray-100 text-gray-500"}`}
                />
                <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
              </div>

              {[0, 1, 2, 3, 4].map((offset) => {
                const yearIndex = startYear + offset;
                const val = isGrowth ? rates[yearIndex - 1] : growthArr[yearIndex]?.toFixed(2);
                return (
                  <div key={`rate-${yearIndex}`} className="relative">
                    <input
                      type="text"
                      value={val || ""}
                      onChange={isGrowth ? (e) => handleIndividualRateChange(yearIndex - 1, e.target.value) : undefined}
                      onBlur={isGrowth ? () => handleRateBlur(yearIndex - 1) : undefined}
                      readOnly={!isGrowth}
                      className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right pr-5 shadow-sm focus:outline-none ${isGrowth ? "bg-white text-[#1E293B] focus:border-[#0052CC]" : "bg-gray-100 text-gray-500"}`}
                    />
                    <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
                  </div>
                );
              })}

              {/* Capitalization Rates Row */}
              <div 
                className="flex items-center gap-2 justify-end pr-2 cursor-pointer"
                onClick={() => handleSwitchRow("capitalization")}
              >
                <input 
                  type="radio" 
                  checked={isCap} 
                  onChange={() => handleSwitchRow("capitalization")} 
                  className="accent-[#0052CC] w-3.5 h-3.5 cursor-pointer" 
                />
                <span className="text-[13px] text-[#1E293B] whitespace-nowrap">Capitalization rates:</span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={isCap ? averageRate : (capArr[1]?.toFixed(2) || "0.00")}
                  onChange={isCap ? handleAverageRateChange : undefined}
                  onBlur={isCap ? handleAvgRateBlur : undefined}
                  readOnly={!isCap}
                  className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right pr-5 shadow-sm focus:outline-none ${isCap ? "bg-white text-[#1E293B] focus:border-[#0052CC]" : "bg-gray-100 text-gray-500"}`}
                />
                <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
              </div>

              {[0, 1, 2, 3, 4].map((offset) => {
                const yearIndex = startYear + offset;
                const val = isCap ? rates[yearIndex - 1] : capArr[yearIndex]?.toFixed(2);
                return (
                  <div key={`caprate-${yearIndex}`} className="relative">
                    <input
                      type="text"
                      value={val || ""}
                      onChange={isCap ? (e) => handleIndividualRateChange(yearIndex - 1, e.target.value) : undefined}
                      onBlur={isCap ? () => handleRateBlur(yearIndex - 1) : undefined}
                      readOnly={!isCap}
                      className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right pr-5 shadow-sm focus:outline-none ${isCap ? "bg-white text-[#1E293B] focus:border-[#0052CC]" : "bg-gray-100 text-gray-500"}`}
                    />
                    <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
                  </div>
                );
              })}

            </div>
          </fieldset>

          {/* Footer Controls */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm">?</button>
            <button onClick={navPrev5} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&lt;&lt;</button>
            <button onClick={navPrev1} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&lt;</button>
            <button onClick={navNext1} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&gt;</button>
            <button onClick={navNext5} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm disabled:opacity-50">&gt;&gt;</button>
            
            <div className="w-4"></div>

            <button onClick={handleSave} className="w-[80px] py-1.5 border border-[#0052CC] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>
            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}