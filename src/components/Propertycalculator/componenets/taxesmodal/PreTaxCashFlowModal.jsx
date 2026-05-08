import React, { useState } from "react";
import ReactDOM from "react-dom";

const fmtCur = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  const rounded = Math.round(val);
  return (rounded < 0 ? "-" : "") + Math.abs(rounded).toLocaleString("en-NZ");
};

export default function PreTaxCashFlowModal({ isOpen, onClose, projections = [], inputs = {} }) {
  const [startIndex, setStartIndex] = useState(0);

  if (!isOpen) return null;

  const handleStart = () => setStartIndex(0);
  const handlePrev = () => setStartIndex(Math.max(0, startIndex - 1));
  const handleNext = () => setStartIndex(startIndex + 1);
  const handleEnd = () => setStartIndex(Math.max(0, projections.length - 5));

  const displayProjections = [];
  for (let i = 0; i < 5; i++) {
    const proj = projections[startIndex + i];
    displayProjections.push(proj || null);
  }

  const initialOutlay = inputs.preTaxCashFlow || 0; 

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[800px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh] font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[15px] font-bold text-[#1E293B]">Pre-tax Cash Flow</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          <div className="border border-[#CBD5E1] rounded-[6px] bg-white relative">
            <div className="overflow-x-auto p-4 pt-6">
              <div className="min-w-[600px]">
                
                {/* Table Header */}
                <div className="flex items-center mb-2 w-full border-b border-[#E2E8F0] pb-2">
                  <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">Year:</div>
                  <div className="w-[80px] text-right px-2 font-medium text-[#1E293B] text-[13px]">Initial</div>
                  <div className="flex-1 flex gap-2 ml-4">
                    {[1, 2, 3, 4, 5].map((y) => {
                      const yrIndex = startIndex + y;
                      return (
                        <div key={y} className="flex-1 text-center text-[13px] text-[#1E293B] font-medium">
                          {yrIndex}yr
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-2 py-2">
                  {/* Rental Income */}
                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Rental income:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]"></div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayProjections.map((p, i) => (
                        <div key={i} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">
                          {p ? fmtCur(p.annualGrossRent) : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cash Outlays */}
                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Cash outlays:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtCur(initialOutlay)}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayProjections.map((p, i) => (
                        <div key={i} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">
                          {p ? "0" : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Principal Payments */}
                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Principal payments:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]"></div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayProjections.map((p, i) => {
                        const princ = p?.annualPrincipal ? -Math.abs(p.annualPrincipal) : 0;
                        return (
                          <div key={i} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">
                            {p ? fmtCur(princ) : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interest Paid */}
                  <div className="flex items-center w-full">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Interest paid:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]"></div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayProjections.map((p, i) => {
                        const int = p?.annualInterest ? -Math.abs(p.annualInterest) : 0;
                        return (
                          <div key={i} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">
                            {p ? fmtCur(int) : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rental Expenses */}
                  <div className="flex items-center w-full pb-3 border-b border-[#E2E8F0]">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B]">Rental expenses:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]"></div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayProjections.map((p, i) => {
                        const exp = p?.annualRentalExpenses ? -Math.abs(p.annualRentalExpenses) : 0;
                        return (
                          <div key={i} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">
                            {p ? fmtCur(exp) : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pre-tax cash flow Total */}
                  <div className="flex items-center w-full pt-2">
                    <div className="w-[140px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">Pre-tax cash flow:</div>
                    <div className="w-[80px] text-right px-2 text-[13px] text-[#1E293B]">{fmtCur(initialOutlay)}</div>
                    <div className="flex-1 flex gap-2 ml-4">
                      {displayProjections.map((p, i) => (
                        <div key={i} className="flex-1 text-right px-2 text-[13px] text-[#1E293B]">
                          {p ? fmtCur(p.preTaxCashFlow) : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-center items-center gap-4 shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={handleStart} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">?</button>
            <button onClick={handleStart} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&lt;&lt;</button>
            <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&lt;</button>
            <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&gt;</button>
            <button onClick={handleEnd} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">&gt;&gt;</button>
          </div>

          <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">Close</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}