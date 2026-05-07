import React, { useState, useEffect } from "react";
import InputField from "../../../inputField";
import ReactDOM from "react-dom";

export default function AnnualSpecialExpensesModal({
  isOpen,
  onClose,
  baseNormalExpense, // The Total from the parent modal (e.g. 10,845)
  inflationRate,
  normalExpensesTimeline,
  setNormalExpensesTimeline,
  specialExpensesTimeline,
  setSpecialExpensesTimeline
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [useInflation, setUseInflation] = useState(true);
  const [inflationStartYear, setInflationStartYear] = useState("1");

  const [localNormal, setLocalNormal] = useState([]);
  const [localSpecial, setLocalSpecial] = useState([]);

  // Track which input is actively being typed in so we don't format it while typing
  const [focusedCell, setFocusedCell] = useState({ type: null, idx: null });

  const formatVal = (raw) => {
    if (raw === "" || raw === undefined || raw === null) return "";
    const num = parseFloat(raw);
    if (isNaN(num)) return raw;
    return Math.abs(Math.trunc(num)).toLocaleString("en-NZ");
  };

  useEffect(() => {
    if (isOpen) {
      const baseExpense = parseFloat(baseNormalExpense) || 0;
      const rate = parseFloat(inflationRate) || 0;
      const startYear = parseInt(inflationStartYear) || 1;

      let newNormals = [];
      let newSpecials = [];

      for (let i = 1; i <= 20; i++) {
        // Build Inflation for Normal Expenses
        if (!useInflation || i < startYear) {
          newNormals.push(Math.round(baseExpense).toString());
        } else {
          const yearsOfGrowth = i - startYear;
          const projected = baseExpense * Math.pow(1 + rate / 100, yearsOfGrowth);
          newNormals.push(Math.round(projected).toString());
        }
        // Initialize Special Expenses as 0
        newSpecials.push("0");
      }

      // If user has previously saved timelines, load them instead of overwriting
      if (normalExpensesTimeline && normalExpensesTimeline.length > 0) {
        setLocalNormal([...normalExpensesTimeline]);
      } else {
        setLocalNormal(newNormals);
      }

      if (specialExpensesTimeline && specialExpensesTimeline.length > 0) {
        setLocalSpecial([...specialExpensesTimeline]);
      } else {
        setLocalSpecial(newSpecials);
      }
    }
  }, [isOpen, baseNormalExpense, inflationRate, useInflation, inflationStartYear, normalExpensesTimeline, specialExpensesTimeline]);

  if (!isOpen) return null;

  const handleStart = () => setStartIndex(0);
  const handlePrev  = () => setStartIndex(Math.max(0, startIndex - 1));
  const handleNext  = () => setStartIndex(Math.min(15, startIndex + 1));

  const handleOk = () => {
    if (setNormalExpensesTimeline) setNormalExpensesTimeline(localNormal);
    if (setSpecialExpensesTimeline) setSpecialExpensesTimeline(localSpecial);
    onClose();
  };

  const handleInputChange = (type, idx, val) => {
    const raw = val.replace(/,/g, "");
    if (raw !== "" && !/^-?\d*\.?\d*$/.test(raw)) return;

    const absoluteIdx = startIndex + idx;

    if (type === "normal") {
      let newArr = [...localNormal];
      while (newArr.length <= absoluteIdx) newArr.push("0");
      newArr[absoluteIdx] = raw;
      setLocalNormal(newArr);
    } else if (type === "special") {
      let newArr = [...localSpecial];
      while (newArr.length <= absoluteIdx) newArr.push("0");
      newArr[absoluteIdx] = raw;
      setLocalSpecial(newArr);
    }
  };

  return ReactDOM.createPortal(
    /* Added p-4 so it doesn't touch the screen edges on mobile */
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      
      {/* Changed w-[600px] to w-full max-w-[600px] and added max-h-[95vh] */}
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh]">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Annual & Special Rental Expenses</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Added overflow-y-auto so the modal body scrolls on very short screens */}
        <div className="p-4 overflow-y-auto">
          
          {/* Added overflow-x-auto to the table wrapper so it scrolls horizontally on narrow phones instead of squishing */}
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative mb-4 overflow-x-auto">
            
            {/* Added min-w-[450px] to ensure the 5 columns always have enough room to look good */}
            <div className="min-w-[450px]">
              
              {/* Header Row */}
              <div className="flex items-center mb-4 w-full">
                 <div className="w-[120px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">Year:</div>
                 <div className="flex-1 flex gap-2 ml-1">
                    {[1, 2, 3, 4, 5].map(y => (
                       <div key={y} className="flex-1 text-center text-[12px] text-[#64748B] font-bold">
                         {startIndex + y}yr
                       </div>
                    ))}
                 </div>
              </div>

              {/* Normal Expenses Row */}
              <div className="flex items-center mb-3 w-full">
                <div className="w-[120px] text-right pr-4 text-[13px] text-[#64748B] font-bold flex-shrink-0">
                  Normal expenses:
                </div>
                <div className="flex-1 flex gap-2 ml-1">
                  {[0, 1, 2, 3, 4].map(idx => {
                    const rawVal = localNormal[startIndex + idx] || "";
                    const isFocused = focusedCell.type === "normal" && focusedCell.idx === idx;
                    const displayVal = isFocused ? rawVal : formatVal(rawVal);

                    return (
                      <div key={idx} className="flex-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={displayVal}
                          onChange={(e) => handleInputChange("normal", idx, e.target.value)}
                          onFocus={() => setFocusedCell({ type: "normal", idx })}
                          onBlur={() => setFocusedCell({ type: null, idx: null })}
                          className="w-full border border-[#CBD5E1] rounded-[4px] px-1 py-1.5 text-[13px] text-center text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Expenses Row */}
              <div className="flex items-center mb-3 w-full">
                <div className="w-[120px] text-right pr-4 text-[13px] text-[#64748B] font-bold flex-shrink-0">
                  <span className="border border-[#CBD5E1] px-1 py-0.5 rounded-[4px] bg-[#F8FAFC]">Special expenses</span>
                </div>
                <div className="flex-1 flex gap-2 ml-1">
                  {[0, 1, 2, 3, 4].map(idx => {
                    const rawVal = localSpecial[startIndex + idx] || "0";
                    const isFocused = focusedCell.type === "special" && focusedCell.idx === idx;
                    const displayVal = isFocused ? rawVal : formatVal(rawVal);

                    return (
                      <div key={idx} className="flex-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={displayVal}
                          onChange={(e) => handleInputChange("special", idx, e.target.value)}
                          onFocus={() => setFocusedCell({ type: "special", idx })}
                          onBlur={() => setFocusedCell({ type: null, idx: null })}
                          className="w-full border border-[#CBD5E1] rounded-[4px] px-1 py-1.5 text-[13px] text-center text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Row */}
              <div className="flex items-center w-full mt-1">
                <div className="w-[120px] text-right pr-4 text-[13px] text-[#1E293B] font-medium flex-shrink-0">
                  Total expenses:
                </div>
                <div className="flex-1 flex gap-2 ml-1">
                  {[0, 1, 2, 3, 4].map(idx => {
                    const norm = parseFloat(localNormal[startIndex + idx]) || 0;
                    const spec = parseFloat(localSpecial[startIndex + idx]) || 0;
                    const total = norm + spec;
                    return (
                      <div key={idx} className="flex-1 text-center text-[13px] text-[#1E293B] font-medium">
                        {formatVal(total)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Inflation Block */}
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
             <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Projecting Normal Expenses</span>
             
             {/* Added flex-wrap so the inputs drop to a new line on small mobile screens */}
             <div className="flex flex-wrap items-center gap-3">
               <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer font-medium">
                 <input type="checkbox" checked={useInflation} onChange={(e) => setUseInflation(e.target.checked)} className="rounded" />
                 Inflation indexed from year:
               </label>
               <div className="w-[60px] relative">
                 <InputField value={inflationStartYear} onChange={setInflationStartYear} suffix="yr" />
               </div>
               <span className="text-[13px] text-[#64748B]">at a rate of:</span>
               <div className="w-[80px]">
                 <InputField value={inflationRate} disabled suffix="%" />
               </div>
             </div>
          </div>

        </div>

        {/* Footer Navigation */}
        {/* Added flex-col-reverse sm:flex-row to neatly stack the button groups on mobile */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-2 rounded-b-[8px] shrink-0">

          <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
             <button onClick={handleStart} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&lt;&lt;</button>
             <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&lt;</button>
             <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&gt;</button>
             <button onClick={() => setStartIndex(15)} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&gt;&gt;</button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
             {/* Added flex-1 sm:flex-none to stretch buttons across screen on mobile only */}
             <button onClick={handleOk} className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] transition-colors shadow-sm">OK</button>
             <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-medium">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
     document.body
  );
}