import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import TimelineRow from "./TimelineRow"; 
import { generateInflationTimeline } from "../../../../services/timelineService";

const TOTAL_YEARS = 30; 
const YEARS_PER_PAGE = 5;
const MAX_START_INDEX = TOTAL_YEARS - YEARS_PER_PAGE;

// Simple formatter for the Total row
const formatVal = (raw) => {
  if (raw === "" || raw === undefined || raw === null) return "";
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  return Math.abs(Math.trunc(num)).toLocaleString("en-NZ");
};

export default function AnnualSpecialExpensesModal({
  isOpen,
  onClose,
  baseNormalExpense,
  inflationRate,
  normalExpensesTimeline,
  setNormalExpensesTimeline,
  specialExpensesTimeline,
  setSpecialExpensesTimeline
}) {
  // --- STATE ---
  const [startIndex, setStartIndex] = useState(0);
  const [useInflation, setUseInflation] = useState(true);
  
  // Local state to allow editing these values inside the modal
  const [localStartYear, setLocalStartYear] = useState("1");
  const [localInflationRate, setLocalInflationRate] = useState(inflationRate || "3.00");
  
  const [localNormal, setLocalNormal] = useState([]);
  const [localSpecial, setLocalSpecial] = useState([]);

  // --- EFFECTS ---
  useEffect(() => {
    if (!isOpen) return;

    const baseExpense = Math.round(parseFloat(baseNormalExpense) || 0);

    // 1. Generate or Load Normal Expenses
    if (normalExpensesTimeline && normalExpensesTimeline.length > 0) {
      setLocalNormal([...normalExpensesTimeline]);
    } else {
      const generatedNormals = generateInflationTimeline({
        baseAmount: baseExpense,
        inflationRate: localInflationRate,
        inflationStartYear: localStartYear,
        useInflation,
        totalYears: TOTAL_YEARS,
      });
      setLocalNormal(generatedNormals);
    }

    // 2. Load or Initialize Special Expenses
    if (specialExpensesTimeline && specialExpensesTimeline.length > 0) {
      setLocalSpecial([...specialExpensesTimeline]);
    } else {
      setLocalSpecial(Array(TOTAL_YEARS).fill("0"));
    }

    setStartIndex(0);
  }, [isOpen, baseNormalExpense, localInflationRate, useInflation, localStartYear, normalExpensesTimeline, specialExpensesTimeline]);

  // If the user actively changes the inflation inputs, recalculate the normal timeline
  useEffect(() => {
    if (isOpen && localNormal.length > 0) {
      const baseExpense = Math.round(parseFloat(baseNormalExpense) || 0);
      const generatedNormals = generateInflationTimeline({
        baseAmount: baseExpense,
        inflationRate: localInflationRate,
        inflationStartYear: localStartYear,
        useInflation,
        totalYears: TOTAL_YEARS,
      });
      setLocalNormal(generatedNormals);
    }
  }, [localInflationRate, localStartYear, useInflation, baseNormalExpense]);


  // --- MEMOIZED TOTALS ---
  const localTotal = useMemo(() => {
    return Array.from({ length: TOTAL_YEARS }, (_, i) => {
      const norm = parseFloat(localNormal[i]) || 0;
      const spec = parseFloat(localSpecial[i]) || 0;
      return String(norm + spec);
    });
  }, [localNormal, localSpecial]);

  // --- HANDLERS ---
  const handleSave = () => {
    if (setNormalExpensesTimeline) setNormalExpensesTimeline(localNormal);
    if (setSpecialExpensesTimeline) setSpecialExpensesTimeline(localSpecial);
    onClose();
  };

  // Pagination
  const goFirst = () => setStartIndex(0);
  const goPrev = () => setStartIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setStartIndex((prev) => Math.min(MAX_START_INDEX, prev + 1));
  const goLast = () => setStartIndex(MAX_START_INDEX);

  // --- RENDER ---
  if (!isOpen) return null;

  const visibleIndices = Array.from({ length: YEARS_PER_PAGE }, (_, i) => i);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Annual & Special Rental Expenses</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px] transition-colors leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          
          {/* Data Grid Section */}
          <div className="border border-[#CBD5E1] rounded-[6px] p-5 bg-white relative mb-5">
            <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[12px] font-bold text-[#64748B]">
              Expense Projections
            </span>

            <div className="overflow-x-auto w-full">
              <div className="min-w-[450px]">
                
                {/* Years Header Row */}
                <div className="flex items-center mb-4 w-full">
                   <div className="w-[130px] text-right pr-4 text-[13px] text-[#1E293B] font-bold flex-shrink-0">Year:</div>
                   <div className="flex-1 flex gap-2 ml-4">
                      {visibleIndices.map(offset => (
                         <div key={offset} className="flex-1 text-center text-[13px] text-[#64748B] font-bold">
                           {startIndex + offset + 1}yr
                         </div>
                      ))}
                   </div>
                </div>

                {/* Data Rows using Reusable TimelineRow */}
                <TimelineRow
                  label="Normal expenses"
                  timelineValues={localNormal}
                  onTimelineChange={setLocalNormal}
                  startIndex={startIndex}
                />

                <TimelineRow
                  label="Special expenses"
                  timelineValues={localSpecial}
                  onTimelineChange={setLocalSpecial}
                  startIndex={startIndex}
                />

                {/* FIXED: Plain text Total Row (Matches the screenshot) */}
                <div className="flex items-center w-full mt-5 pt-4 border-t border-[#E2E8F0]">
                   <div className="w-[130px] text-right pr-4 text-[13px] text-[#1E293B] font-bold flex-shrink-0">
                     Total expenses:
                   </div>
                   <div className="flex-1 flex gap-2 ml-4">
                      {visibleIndices.map(offset => (
                         <div key={offset} className="flex-1 text-center text-[13px] text-[#1E293B] font-bold">
                           {formatVal(localTotal[startIndex + offset])}
                         </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          </div>

          <div className="border border-[#CBD5E1] rounded-[6px] p-5 bg-white relative">
             <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[12px] font-bold text-[#64748B]">Projecting Normal Expenses</span>
             
             <div className="overflow-x-auto w-full">
               <div className="flex flex-wrap items-center gap-3 min-w-[450px] pb-1">
                 <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer font-bold">
                   <input 
                      type="checkbox" 
                      checked={useInflation} 
                      onChange={(e) => setUseInflation(e.target.checked)} 
                      className="rounded text-[#0052CC] w-4 h-4 cursor-pointer" 
                    />
                   Inflation indexed from year:
                 </label>
                 
                 <div className="w-[70px] relative">
                   <input 
                      type="text" 
                      value={localStartYear} 
                      onChange={(e) => setLocalStartYear(e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-[4px] pl-2 pr-6 py-1.5 text-[13px] text-center text-[#1E293B] focus:outline-none focus:border-[#0052CC] shadow-sm"
                   />
                   <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B] pointer-events-none">yr</span>
                 </div>
                 
                 <span className="text-[13px] text-[#64748B] font-medium">at a rate of:</span>
                 
                 <div className="w-[80px] relative">
                   <input 
                      type="text" 
                      value={localInflationRate} 
                      onChange={(e) => setLocalInflationRate(e.target.value)} 
                      className="w-full border border-[#CBD5E1] rounded-[4px] pl-2 pr-6 py-1.5 text-[13px] text-center text-[#1E293B] focus:outline-none focus:border-[#0052CC] shadow-sm"
                   />
                   <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B] pointer-events-none">%</span>
                 </div>
               </div>
             </div>
          </div>

        </div>

        <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-2 rounded-b-[8px] shrink-0">

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
             <button onClick={goFirst} disabled={startIndex === 0} className="w-9 h-9 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#F1F5F9] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">&lt;&lt;</button>
             <button onClick={goPrev} disabled={startIndex === 0} className="w-9 h-9 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#F1F5F9] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">&lt;</button>
             <button onClick={goNext} disabled={startIndex === MAX_START_INDEX} className="w-9 h-9 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#F1F5F9] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">&gt;</button>
             <button onClick={goLast} disabled={startIndex === MAX_START_INDEX} className="w-9 h-9 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#F1F5F9] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">&gt;&gt;</button>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
             <button onClick={handleSave} className="flex-1 sm:flex-none px-8 py-2 border border-[#0052CC] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] hover:border-[#003d99] transition-colors shadow-sm">OK</button>
             <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-2 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#F1F5F9] transition-colors shadow-sm font-bold">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
     document.body
  );
}