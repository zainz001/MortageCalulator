import React from "react";
import ReactDOM from "react-dom";

// Formatting helper tailored to match the screenshot
const fmtPlainNum = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === "") return "";
  return Math.round(val).toLocaleString("en-NZ");
};

export default function AfterTaxCashFlowModal({ isOpen, onClose, projections, inputs }) {
  if (!isOpen) return null;

  // Helper to extract the exact data needed for each row
  const getVal = (yr, key) => {
    // Handle the 'Initial' column logic
    if (yr === 'Initial') {
      const initialInvestment = inputs?.investments || inputs?.equity || 75000;
      if (key === 'cashOutlays' || key === 'preTax' || key === 'afterTax') {
        return -Math.abs(initialInvestment);
      }
      return ""; // Blank for other initial fields
    }

    // Handle standard projection years
    const proj = projections?.find((p) => p.index === yr);
    if (!proj) return 0; // Fallback if data is missing

    switch (key) {
      case 'rent': return proj.annualGrossRent || 0;
      case 'cashOutlays': return 0;
      case 'principal': return proj.annualPrincipal || 0;
      case 'interest': return -(proj.annualInterest || 0); // Displayed as negative
      case 'expenses': return -(proj.annualRentalExpenses || 0); // Displayed as negative
      case 'preTax': return proj.preTaxCashFlow || 0;
      case 'taxCredits': return proj.taxCredit || 0;
      case 'afterTax': return proj.afterTaxCashFlow || 0;
      case 'costPerWeek': return proj.costPerWeek || 0;
      default: return 0;
    }
  };

  const years = [1, 2, 3, 5, 10];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="bg-[#F0F4F8] rounded-[6px] shadow-2xl w-full max-w-[650px] max-h-[95vh] flex flex-col border border-slate-300 text-[13px] text-slate-800 font-sans overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-slate-200 rounded-t-[6px] shrink-0">
          <span className="font-normal text-slate-700">After-tax Cash Flow</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-[20px] leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[550px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-normal text-slate-600 pb-2 w-[140px]">Year:</th>
                  <th className="font-normal text-slate-600 pb-2">Initial</th>
                  {years.map(yr => (
                    <th key={yr} className="font-normal text-slate-600 pb-2">{yr}yr</th>
                  ))}
                </tr>
                <tr>
                  <td colSpan="7" className="border-b border-slate-400"></td>
                </tr>
              </thead>
              <tbody>
                {/* Block 1 */}
                <tr>
                  <td className="text-left py-1.5 pt-3">Rent:</td>
                  <td className="py-1.5 pt-3">{fmtPlainNum(getVal('Initial', 'rent'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5 pt-3">{fmtPlainNum(getVal(yr, 'rent'))}</td>)}
                </tr>
                <tr>
                  <td className="text-left py-1.5">Cash outlays:</td>
                  <td className="py-1.5">{fmtPlainNum(getVal('Initial', 'cashOutlays'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5">{fmtPlainNum(getVal(yr, 'cashOutlays'))}</td>)}
                </tr>
                <tr>
                  <td className="text-left py-1.5">Principal payments:</td>
                  <td className="py-1.5">{fmtPlainNum(getVal('Initial', 'principal'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5">{fmtPlainNum(getVal(yr, 'principal'))}</td>)}
                </tr>
                <tr>
                  <td className="text-left py-1.5">Interest:</td>
                  <td className="py-1.5">{fmtPlainNum(getVal('Initial', 'interest'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5">{fmtPlainNum(getVal(yr, 'interest'))}</td>)}
                </tr>
                <tr>
                  <td className="text-left py-1.5 pb-3">Expenses:</td>
                  <td className="py-1.5 pb-3">{fmtPlainNum(getVal('Initial', 'expenses'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5 pb-3">{fmtPlainNum(getVal(yr, 'expenses'))}</td>)}
                </tr>
                <tr><td colSpan="7" className="border-b border-slate-300"></td></tr>

                {/* Block 2 */}
                <tr>
                  <td className="text-left py-1.5 pt-3">Pre-tax cash flow:</td>
                  <td className="py-1.5 pt-3">{fmtPlainNum(getVal('Initial', 'preTax'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5 pt-3">{fmtPlainNum(getVal(yr, 'preTax'))}</td>)}
                </tr>
                <tr>
                  <td className="text-left py-1.5 pb-3">Tax credits:</td>
                  <td className="py-1.5 pb-3">{fmtPlainNum(getVal('Initial', 'taxCredits'))}</td>
                  {years.map(yr => <td key={yr} className="py-1.5 pb-3">{fmtPlainNum(getVal(yr, 'taxCredits'))}</td>)}
                </tr>
                <tr><td colSpan="7" className="border-b border-slate-300"></td></tr>

                {/* Block 3 */}
                <tr>
                  <td className="text-left py-2 pb-3 pt-3">After-tax cash flow:</td>
                  <td className="py-2 pb-3 pt-3">{fmtPlainNum(getVal('Initial', 'afterTax'))}</td>
                  {years.map(yr => <td key={yr} className="py-2 pb-3 pt-3">{fmtPlainNum(getVal(yr, 'afterTax'))}</td>)}
                </tr>
                <tr><td colSpan="7" className="border-b border-slate-300"></td></tr>

                {/* Block 4 */}
                <tr>
                  <td className="text-left py-3">Cost per week:</td>
                  <td className="py-3">{fmtPlainNum(getVal('Initial', 'costPerWeek'))}</td>
                  {years.map(yr => <td key={yr} className="py-3">{fmtPlainNum(getVal(yr, 'costPerWeek'))}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end items-center gap-4 mt-6">
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-slate-600 flex items-center justify-center transition-colors">?</button>
              <button className="w-10 h-8 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-slate-600 flex items-center justify-center transition-colors">&lt;&lt;</button>
              <button className="w-8 h-8 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-slate-600 flex items-center justify-center transition-colors">&lt;</button>
              <button className="w-8 h-8 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-slate-600 flex items-center justify-center transition-colors">&gt;</button>
              <button className="w-10 h-8 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm text-slate-600 flex items-center justify-center transition-colors">&gt;&gt;</button>
            </div>
            <button 
              onClick={onClose} 
              className="px-8 py-1.5 border border-slate-400 bg-white hover:bg-slate-50 shadow-sm rounded-[2px] transition-colors"
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