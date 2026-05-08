import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const fmtPlainNum = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === "") return "";
  const rounded = Math.round(val);
  return (rounded < 0 ? "-" : "") + Math.abs(rounded).toLocaleString("en-NZ");
};

export default function AfterTaxCashFlowModal({ isOpen, onClose, projections, inputs }) {
  const [startYear, setStartYear] = useState(1);
  const COLUMNS_TO_SHOW = 5;

  useEffect(() => {
    if (isOpen) setStartYear(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const maxYears = projections && projections.length > 0 ? projections.length : 30;
  
  const handleFirst = () => setStartYear(1);
  const handlePrev = () => setStartYear((prev) => Math.max(1, prev - 1));
  const handleNext = () => setStartYear((prev) => Math.min(maxYears - COLUMNS_TO_SHOW + 1, prev + 1));
  const handleLast = () => setStartYear(Math.max(1, maxYears - COLUMNS_TO_SHOW + 1));

  const displayYears = Array.from({ length: COLUMNS_TO_SHOW }, (_, i) => startYear + i).filter(y => y <= maxYears);

  const getVal = (yr, key) => {
    if (yr === 'Initial') {
      // FULLY DYNAMIC: Removed the hardcoded 75000.
      const initialInvestment = inputs?.investments || inputs?.equity || 0; 
      if (key === 'cashOutlays' || key === 'preTax' || key === 'afterTax') {
        return -Math.abs(initialInvestment);
      }
      return ""; 
    }

    const proj = projections?.find((p) => p.index === yr);
    if (!proj) return 0;

    switch (key) {
      case 'rent': return proj.annualGrossRent || 0;
      case 'cashOutlays': return 0;
      case 'principal': return proj.annualPrincipal || 0;
      case 'interest': return -(proj.annualInterest || 0);
      case 'expenses': return -(proj.annualRentalExpenses || 0);
      case 'preTax': return proj.preTaxCashFlow || 0;
      case 'taxCredits': return proj.taxCredit || 0;
      case 'afterTax': return proj.afterTaxCashFlow || 0;
      case 'costPerWeek': return proj.costPerWeek || 0;
      default: return 0;
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[800px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh] font-sans">
        
        <div className="flex justify-between items-center px-5 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[15px] font-bold text-[#1E293B]">After-tax Cash Flow</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="border border-[#CBD5E1] rounded-[6px] bg-white relative">
            <div className="overflow-x-auto p-4 pt-6">
              <div className="min-w-[600px]">
                
                <div className="flex items-center mb-2 w-full border-b border-[#E2E8F0] pb-2">
                  <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">Year:</div>
                  <div className="w-[80px] text-right px-2 font-medium text-[#1E293B] text-[13px]">Initial</div>
                  <div className="flex-1 flex gap-2 ml-4">
                    {displayYears.map((yr) => (
                      <div key={yr} className="flex-1 text-center text-[13px] text-[#1E293B] font-medium">
                        {yr}yr
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 py-2">
                  {/* Block 1 */}
                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Rent:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'rent'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'rent'))}</div>)}
                    </div>
                  </div>

                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Cash outlays:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'cashOutlays'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'cashOutlays'))}</div>)}
                    </div>
                  </div>

                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Principal payments:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'principal'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'principal'))}</div>)}
                    </div>
                  </div>

                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Interest:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'interest'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'interest'))}</div>)}
                    </div>
                  </div>

                  <div className="flex items-center w-full pb-3 border-b border-[#E2E8F0]">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Expenses:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'expenses'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'expenses'))}</div>)}
                    </div>
                  </div>

                  {/* Block 2 */}
                  <div className="flex items-center w-full pt-1.5">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Pre-tax cash flow:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'preTax'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'preTax'))}</div>)}
                    </div>
                  </div>

                  <div className="flex items-center w-full pb-3 border-b border-[#E2E8F0]">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Tax credits:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'taxCredits'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'taxCredits'))}</div>)}
                    </div>
                  </div>

                  {/* Block 3 */}
                  <div className="flex items-center w-full pt-1.5 pb-3 border-b border-[#E2E8F0]">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B] font-bold">After-tax cash flow:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B] font-bold">{fmtPlainNum(getVal('Initial', 'afterTax'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B] font-bold">{fmtPlainNum(getVal(yr, 'afterTax'))}</div>)}
                    </div>
                  </div>

                  {/* Block 4 */}
                  <div className="flex items-center w-full pt-1.5">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Cost per week:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal('Initial', 'costPerWeek'))}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayYears.map(yr => <div key={yr} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">{fmtPlainNum(getVal(yr, 'costPerWeek'))}</div>)}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-center items-center gap-4 shrink-0">
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">?</button>
            <button 
              onClick={handleFirst} 
              disabled={startYear === 1}
              className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors disabled:opacity-40"
            >
              &lt;&lt;
            </button>
            <button 
              onClick={handlePrev} 
              disabled={startYear === 1}
              className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors disabled:opacity-40"
            >
              &lt;
            </button>
            <button 
              onClick={handleNext} 
              disabled={startYear + COLUMNS_TO_SHOW > maxYears}
              className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors disabled:opacity-40"
            >
              &gt;
            </button>
            <button 
              onClick={handleLast} 
              disabled={startYear + COLUMNS_TO_SHOW > maxYears}
              className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors disabled:opacity-40"
            >
              &gt;&gt;
            </button>
          </div>

          <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
            <button 
              onClick={onClose} 
              className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
        
      </div>
    </div>,
    document.body
  );
}