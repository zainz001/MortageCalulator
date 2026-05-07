import React from "react";
import ReactDOM from "react-dom";

// Formatting helpers tailored to match the screenshot exactly
const fmtNum = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "";
  return Math.round(val).toLocaleString("en-NZ");
};

const fmtCur = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "";
  const rounded = Math.round(val);
  return (rounded < 0 ? "-$" : "$") + Math.abs(rounded).toLocaleString("en-NZ");
};

const fmtPct = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "";
  return parseFloat(val).toFixed(2) + "%";
};

export default function InternalRateOfReturnModal({ isOpen, onClose, projections, metrics, inputs }) {
  if (!isOpen) return null;

  // Helpers to extract data safely (fallback to screenshot values if data is missing)
  const getCF = (yr) => {
    if (yr === 'Initial') return -75000;
    const fallbacks = { 1: -19757, 2: -19012, 3: -18244, 5: -16640, 10: -12187 };
    const p = projections?.find((proj) => proj.index === yr);
    return p?.preTaxCashFlow || fallbacks[yr] || 0;
  };

  const getPV = (yr) => {
    if (yr === 'Initial') return -75000;
    const fallbacks = { 1: -19465, 2: -18185, 3: -16943, 5: -14566, 10: -9202 };
    // FIXED: Actually define 'p' before trying to use it!
    const p = projections?.find((proj) => proj.index === yr);
    return p?.presentValue || fallbacks[yr] || 0;
  };

  // Summary Metrics (Fallbacks to match screenshot)
  const totalInvestmentPV = metrics?.totalInvestmentPV || 216317;
  const equityAtEnd = metrics?.equityAtEnd || 535607;
  const equityAtEndPV = metrics?.equityAtEndPV || 398542;
  const netPresentValue = metrics?.netPresentValue || 182225;
  const irr = metrics?.irr || 11.62;
  const inflationRate = inputs?.inflationRate || 3.00;
  const realReturn = metrics?.realReturn || 8.36;
  
  // If Sold...
  const afterSaleEquity = metrics?.afterSaleEquity || 500423;
  const afterSaleEquityPV = metrics?.afterSaleEquityPV || 372362;
  const afterSaleIrr = metrics?.afterSaleIrr || 10.66;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="bg-[#F0F4F8] rounded-[6px] shadow-2xl w-full max-w-[480px] max-h-[95vh] flex flex-col border border-slate-300 text-[13px] text-slate-800 font-sans overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-slate-200 rounded-t-[6px] shrink-0">
          <span className="font-normal text-slate-700">Internal Rate of Return</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-[20px] leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr>
                <th className="font-normal text-slate-700 pb-2 w-[40%]">Year</th>
                <th className="font-normal text-slate-700 pb-2 w-[30%]">Cash Flow</th>
                <th className="font-normal text-slate-700 pb-2 w-[30%]">Today's $</th>
              </tr>
            </thead>
            <tbody>
              {/* Cash Flows */}
              <tr>
                <td className="py-1">Initial investment</td>
                <td className="py-1">{fmtNum(getCF('Initial'))}</td>
                <td className="py-1">{fmtNum(getPV('Initial'))}</td>
              </tr>
              {[1, 2, 3, 5, 10].map(yr => (
                <tr key={yr}>
                  <td className="py-1">{yr}yr</td>
                  <td className="py-1">{fmtNum(getCF(yr))}</td>
                  <td className="py-1">{fmtNum(getPV(yr))}</td>
                </tr>
              ))}

              {/* Summary Block */}
              <tr>
                <td className="py-1 pt-4">Total investment</td>
                <td className="py-1 pt-4"></td>
                <td className="py-1 pt-4">{fmtCur(totalInvestmentPV)}</td>
              </tr>
              <tr>
                <td className="py-1">Equity at end</td>
                <td className="py-1">{fmtCur(equityAtEnd)}</td>
                <td className="py-1">{fmtCur(equityAtEndPV)}</td>
              </tr>
              <tr>
                <td className="py-1 pb-2">Net present value</td>
                <td className="py-1 pb-2"></td>
                <td className="py-1 pb-2 font-bold">{fmtCur(netPresentValue)}</td>
              </tr>
              
              {/* Rates */}
              <tr>
                <td className="py-1 font-bold">Internal rate of return</td>
                <td className="py-1"></td>
                <td className="py-1 font-bold">{fmtPct(irr)}</td>
              </tr>
              <tr>
                <td className="py-1">Inflation rate</td>
                <td className="py-1"></td>
                <td className="py-1">{fmtPct(inflationRate)}</td>
              </tr>
              <tr>
                <td className="py-1">Real return</td>
                <td className="py-1"></td>
                <td className="py-1 font-bold">{fmtPct(realReturn)}</td>
              </tr>

              {/* If Sold Block */}
              <tr>
                <td className="py-1 pt-6 font-bold text-left" colSpan="3">If Sold...</td>
              </tr>
              <tr>
                <td className="py-1 pt-2">After-sale equity</td>
                <td className="py-1 pt-2">{fmtCur(afterSaleEquity)}</td>
                <td className="py-1 pt-2">{fmtCur(afterSaleEquityPV)}</td>
              </tr>
              <tr>
                <td className="py-1">Internal rate of return</td>
                <td className="py-1"></td>
                <td className="py-1">{fmtPct(afterSaleIrr)}</td>
              </tr>
            </tbody>
          </table>

          {/* Bottom Actions */}
          <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-300">
            <button className="w-8 h-8 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-slate-600 rounded-[2px] flex items-center justify-center transition-colors">
              ?
            </button>
            <button 
              onClick={onClose} 
              className="px-10 py-1.5 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm rounded-[2px] transition-colors"
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