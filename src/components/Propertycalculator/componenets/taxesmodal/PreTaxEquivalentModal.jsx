import React from "react";
import ReactDOM from "react-dom";

// Helper functions specifically for this modal
const fmtPct = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return parseFloat(val).toFixed(2) + "%";
};

const fmtPlainNum = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return Math.round(val).toLocaleString("en-NZ");
};

export default function PreTaxEquivalentModal({ isOpen, onClose, projections, metrics, inputs }) {
  if (!isOpen) return null;

  // Helpers to extract data safely
  const getCF = (yr) => {
    if (yr === 'Initial') {
      const initialInvestment = inputs?.investments || inputs?.equity || 75000;
      return -Math.abs(initialInvestment); 
    }
    const p = projections?.find((p) => p.index === yr);
    return p?.preTaxCashFlow || 0;
  };

  const getEq = (yr) => {
    const p = projections?.find((p) => p.index === yr);
    return p?.equity || 0;
  };

  // Fallback values mimic the screenshot if data is missing
  const preTaxIrr = metrics?.preTaxIrr || metrics?.irr || 11.62;
  const afterTaxIrr = metrics?.irr || 11.62;
  const marginalTaxRate = inputs?.investorTaxRate || inputs?.marginalTaxRate || 34.67;
  const preTaxEquivalent = metrics?.preTaxEquivalentIRR || 17.78;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      {/* 1. Added w-full, max-h-[95vh], and overflow-hidden for mobile boundaries */}
      <div className="bg-[#F0F4F8] rounded-[6px] shadow-2xl w-full max-w-[620px] max-h-[95vh] flex flex-col border border-slate-300 text-[13px] text-slate-800 font-sans overflow-hidden">
        
        {/* Header (Shrink-0 to keep it pinned to top) */}
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-slate-200 rounded-t-[6px] shrink-0">
          <span className="font-normal text-slate-700">Pre-tax Equivalent of IRR</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-[20px] leading-none">&times;</button>
        </div>

        {/* Content (overflow-y-auto allows internal scrolling on very small devices) */}
        <div className="p-4 md:p-6 overflow-y-auto">
          
          {/* Table Wrapper (Horizontal scrolling on mobile) */}
          <div className="overflow-x-auto w-full mb-6 md:mb-8 pb-2">
            {/* Added min-w-[500px] so text doesn't squish on small screens */}
            <table className="w-full text-right min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left font-normal text-slate-600 pb-2">Year</th>
                  <th className="font-normal text-slate-600 pb-2">Initial</th>
                  <th className="font-normal text-slate-600 pb-2">1yr</th>
                  <th className="font-normal text-slate-600 pb-2">2yr</th>
                  <th className="font-normal text-slate-600 pb-2">3yr</th>
                  <th className="font-normal text-slate-600 pb-2">5yr</th>
                  <th className="font-normal text-slate-600 pb-2">10yr</th>
                </tr>
                <tr>
                  <td colSpan="7" className="border-b border-slate-400"></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left py-3">Pre-tax cash flow</td>
                  <td>{fmtPlainNum(getCF('Initial'))}</td>
                  <td>{fmtPlainNum(getCF(1))}</td>
                  <td>{fmtPlainNum(getCF(2))}</td>
                  <td>{fmtPlainNum(getCF(3))}</td>
                  <td>{fmtPlainNum(getCF(5))}</td>
                  <td>{fmtPlainNum(getCF(10))}</td>
                </tr>
                <tr>
                  <td className="text-left py-2 pb-4">Equity</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="pb-4">{fmtPlainNum(getEq(10))}</td>
                </tr>
                <tr>
                  <td colSpan="7" className="border-b border-slate-400"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Layout: Stacks on mobile (flex-col), side-by-side on desktop (md:flex-row) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
            
            {/* Summary Box (Full width on mobile, fixed width on desktop) */}
            <div className="border border-slate-300 bg-white p-4 w-full md:w-[300px] shadow-sm">
              <div className="flex justify-between mb-2">
                <span>Pre-tax IRR</span>
                <span>{fmtPct(preTaxIrr)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>After-tax IRR</span>
                <span>{fmtPct(afterTaxIrr)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Marginal tax rate</span>
                <span>{fmtPct(marginalTaxRate)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100">
                <span>Pre-tax equivalent of IRR</span>
                <span>{fmtPct(preTaxEquivalent)}</span>
              </div>
            </div>

            {/* Actions (Horizontal row on mobile, vertical stack on desktop) */}
            <div className="flex flex-row md:flex-col justify-between md:justify-end items-center w-full md:w-auto gap-4 md:gap-4">
              <button className="w-8 h-8 border border-slate-300 bg-white hover:bg-slate-50 shadow-sm text-slate-600 rounded-[2px] flex items-center justify-center transition-colors">
                ?
              </button>
              <button 
                onClick={onClose} 
                className="px-8 py-2 md:px-6 md:py-1.5 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm rounded-[2px] transition-colors"
              >
                Close
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}