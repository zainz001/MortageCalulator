import React, { useState, useEffect } from "react";
import InputField from "../../../inputField";
import ReactDOM from "react-dom";

export default function AnnualRentalIncomeModal({
  isOpen,
  onClose,
  actualAnnualRent, // The 35672 string passed from the parent
  inflationRate,
  rentTimeline,
  setRentTimeline
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [useInflation, setUseInflation] = useState(true);
  const [inflationStartYear, setInflationStartYear] = useState("1");

  const [localProjections, setLocalProjections] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(null);

  const formatVal = (raw) => {
    if (raw === "" || raw === undefined || raw === null) return "";
    const num = parseFloat(raw);
    if (isNaN(num)) return raw;
    const parts = String(raw).split(".");
    const intFormatted = Math.abs(Math.trunc(num)).toLocaleString("en-NZ");
    const sign = num < 0 ? "-" : "";
    return parts.length > 1 ? `${sign}${intFormatted}.${parts[1]}` : `${sign}${intFormatted}`;
  };

  useEffect(() => {
    if (isOpen) {
      const baseActualRent = parseFloat(actualAnnualRent) || 0;

      if (rentTimeline && rentTimeline.length > 0) {
        const savedYear1 = parseFloat(rentTimeline[0]);
        if (savedYear1 === Math.round(baseActualRent)) {
          setLocalProjections([...rentTimeline]);
          return;
        }
      }
      // -----------------------------

      const rate = parseFloat(inflationRate) || 0;
      const startYear = parseInt(inflationStartYear) || 1;

      let newProjections = [];

      // THE FIX: Loop now calculates a full 30 years
      for (let i = 1; i <= 30; i++) {
        if (!useInflation || i < startYear) {
          newProjections.push(Math.round(baseActualRent).toString());
        } else {
          const yearsOfGrowth = i - startYear;
          const projected = baseActualRent * Math.pow(1 + rate / 100, yearsOfGrowth);
          newProjections.push(Math.round(projected).toString());
        }
      }

      setLocalProjections(newProjections);
      setStartIndex(0); // Reset to start when opened
    }
  }, [isOpen, actualAnnualRent, inflationRate, useInflation, inflationStartYear, rentTimeline]);

  if (!isOpen) return null;

  // THE FIX: Navigation now allows going up to index 25 (which shows years 26-30)
  const handleStart = () => setStartIndex(0);
  const handlePrev = () => setStartIndex(Math.max(0, startIndex - 1));
  const handleNext = () => setStartIndex(Math.min(25, startIndex + 1));

  const handleOk = () => {
    setRentTimeline(localProjections);
    onClose();
  };

  const handleInputChange = (idx, val) => {
    const raw = val.replace(/,/g, "");
    if (raw !== "" && !/^-?\d*\.?\d*$/.test(raw)) return;

    let newArr = [...localProjections];
    while (newArr.length <= startIndex + idx) newArr.push("0");

    newArr[startIndex + idx] = raw;
    setLocalProjections(newArr);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      {/* THE FIX: Added max-w and max-h for mobile responsiveness */}
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[600px] max-h-[95vh] flex flex-col border border-[#CBD5E1] overflow-hidden">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Annual Rental Income</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-4 overflow-y-auto overflow-x-auto">
          
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative mb-4 min-w-[450px]">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Annual Rental Income</span>

            <div className="flex items-center mb-4 w-full">
              <div className="w-[110px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">Year:</div>
              <div className="flex-1 flex gap-2 ml-1">
                {[1, 2, 3, 4, 5].map(y => (
                  <div key={y} className="flex-1 text-center text-[12px] text-[#64748B] font-bold">
                    {startIndex + y}yr
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center mb-2 w-full">
              <div className="w-[110px] text-right pr-4 text-[13px] text-[#64748B] font-bold flex-shrink-0">
                Annual rent:
              </div>
              <div className="flex-1 flex gap-2 ml-1">
                {[0, 1, 2, 3, 4].map(idx => {
                  const absoluteIdx = startIndex + idx;
                  const rawVal = localProjections[absoluteIdx] || "";
                  const isFocused = focusedIdx === absoluteIdx;
                  const displayVal = isFocused ? rawVal : formatVal(rawVal);

                  return (
                    <div key={idx} className="flex-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={displayVal}
                        onChange={(e) => handleInputChange(idx, e.target.value)}
                        onFocus={() => setFocusedIdx(absoluteIdx)}
                        onBlur={() => setFocusedIdx(null)}
                        className="w-full border border-[#CBD5E1] rounded-[4px] px-1 py-1.5 text-[13px] text-center text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative min-w-[450px]">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Rental Projections</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer font-medium">
                <input type="checkbox" checked={useInflation} onChange={(e) => setUseInflation(e.target.checked)} className="rounded text-[#0052CC]" />
                Inflation indexed from year
              </label>
              <div className="w-[60px] relative">
                <InputField value={inflationStartYear} onChange={setInflationStartYear} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B] pointer-events-none">yr</span>
              </div>
              <span className="text-[13px] text-[#64748B]">at a rate of:</span>
              <div className="w-[80px]">
                <InputField value={inflationRate} disabled suffix="%" />
              </div>
            </div>
          </div>

        </div>

        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row justify-between items-center gap-4 rounded-b-[8px] shrink-0">
          
          <button className="hidden sm:block px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">
            ?
          </button>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
            <button onClick={handleStart} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&lt;&lt;</button>
            <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&lt;</button>
            <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&gt;</button>
            <button onClick={() => setStartIndex(25)} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&gt;&gt;</button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleOk} className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] transition-colors shadow-sm">OK</button>
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-medium">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}