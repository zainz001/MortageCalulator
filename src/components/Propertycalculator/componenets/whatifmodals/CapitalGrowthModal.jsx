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

  // Pre-calculate 30 years of Net Rent
  const netRents = useMemo(() => {
    const baseGrossRent = parseNum(grossRentWeekly) * 52;
    const expenseRate = parseNum(rentalExpensesPercent) / 100;
    const initialNetRent = baseGrossRent * (1 - expenseRate);
    const rentGrowth = parseNum(rentalIncomeRate) / 100;

    const rents = [];
    for (let i = 0; i <= 30; i++) {
      rents.push(initialNetRent * Math.pow(1 + rentGrowth, i - 1));
    }
    return rents;
  }, [grossRentWeekly, rentalExpensesPercent, rentalIncomeRate]);

  // Dynamically calculate Arrays
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
  } else { 
    const cap0 = parseFloat(rates[0]) || 0.0001;
    capArr[0] = cap0;
    pvArr[0] = netRents[0] / (cap0 / 100);

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
      if (setPropertyValue) setPropertyValue(Math.round(pvArr[0]).toString());
    }
    if (setCapitalGrowthMode) setCapitalGrowthMode(activeRow);
    onClose();
  };

  if (!isOpen) return null;

  const isGrowth = activeRow === "growth";
  const isCap = activeRow === "capitalization";

  return ReactDOM.createPortal(
    /* THE FIX: Added p-4 to prevent the modal from touching the edges of the screen on mobile */
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      
      {/* THE FIX: Changed w-[720px] to w-full max-w-[720px] and added max-h-[95vh] */}
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[720px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh] font-sans">

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Investment Property Growth</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content - Added overflow-y-auto so the body scrolls vertically if needed */}
        <div className="p-4 sm:p-8 bg-[#F8FAFC] flex flex-col overflow-y-auto">
          
          {/* THE FIX: Wrapped the grids in an overflow-x-auto container so they swipe on phones */}
          <div className="overflow-x-auto mb-6">
            
            {/* THE FIX: Added min-w-[650px] to keep the columns aligned and readable */}
            <div className="min-w-[650px]">
              
              {/* Top Section: Static Text Grid */}
              <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-3 items-center text-[13px] text-[#1E293B] mb-8">
                <div className="text-right pr-2 font-medium">End of year:</div>
                <div className="text-center font-medium bg-slate-100 rounded py-1">{startYear === 1 ? "Initial" : `${startYear - 1}yr`}</div>
                {[0, 1, 2, 3, 4].map((offset) => (
                  <div key={offset} className="text-center font-medium">
                    {startYear + offset}yr
                  </div>
                ))}

                <div className="text-right pr-2 font-medium mt-2">Property value:</div>
                <div className="text-center mt-2 font-bold">{formatGrowthVal(pvArr[startYear - 1])}</div>
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
                <legend className="text-[12px] text-[#64748B] font-bold px-2 bg-[#F8FAFC] ml-2">
                  Display in Spreadsheet
                </legend>

                <div className="grid grid-cols-[160px_repeat(6,1fr)] gap-x-3 gap-y-4 items-center">
                  <div></div>
                  <div className="text-center text-[12px] font-bold text-[#64748B]">Average</div>
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
                    <span className="text-[12px] text-[#1E293B] font-medium whitespace-nowrap">Capital growth rates:</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={isGrowth ? averageRate : (growthArr[1]?.toFixed(2) || "0.00")}
                      onChange={isGrowth ? handleAverageRateChange : undefined}
                      onBlur={isGrowth ? handleAvgRateBlur : undefined}
                      readOnly={!isGrowth}
                      className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[12px] text-right pr-5 shadow-sm focus:outline-none ${isGrowth ? "bg-white text-[#0052CC] font-bold focus:border-[#0052CC]" : "bg-gray-100 text-gray-400"}`}
                    />
                    <span className="absolute right-1.5 top-1.5 text-[11px] text-gray-400">%</span>
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
                          className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[12px] text-right pr-5 shadow-sm focus:outline-none ${isGrowth ? "bg-white text-[#1E293B] focus:border-[#0052CC]" : "bg-gray-100 text-gray-400"}`}
                        />
                        <span className="absolute right-1.5 top-1.5 text-[11px] text-gray-400">%</span>
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
                    <span className="text-[12px] text-[#1E293B] font-medium whitespace-nowrap">Capitalization rates:</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={isCap ? averageRate : (capArr[1]?.toFixed(2) || "0.00")}
                      onChange={isCap ? handleAverageRateChange : undefined}
                      onBlur={isCap ? handleAvgRateBlur : undefined}
                      readOnly={!isCap}
                      className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[12px] text-right pr-5 shadow-sm focus:outline-none ${isCap ? "bg-white text-[#0052CC] font-bold focus:border-[#0052CC]" : "bg-gray-100 text-gray-400"}`}
                    />
                    <span className="absolute right-1.5 top-1.5 text-[11px] text-gray-400">%</span>
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
                          className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[12px] text-right pr-5 shadow-sm focus:outline-none ${isCap ? "bg-white text-[#1E293B] focus:border-[#0052CC]" : "bg-gray-100 text-gray-400"}`}
                        />
                        <span className="absolute right-1.5 top-1.5 text-[11px] text-gray-400">%</span>
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </div>

          {/* Footer Controls - THE FIX: flex-col sm:flex-row to stack nicely on mobile */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 shrink-0">
            
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] shadow-sm">?</button>
              <button onClick={navPrev5} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm disabled:opacity-30 transition-colors">&lt;&lt;</button>
              <button onClick={navPrev1} disabled={startYear === 1} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm disabled:opacity-30 transition-colors">&lt;</button>
              <button onClick={navNext1} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm disabled:opacity-30 transition-colors">&gt;</button>
              <button onClick={navNext5} disabled={startYear >= 26} className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm disabled:opacity-30 transition-colors">&gt;&gt;</button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleSave} className="flex-1 sm:w-[80px] py-1.5 border border-[#0052CC] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>
              <button onClick={onClose} className="flex-1 sm:w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}