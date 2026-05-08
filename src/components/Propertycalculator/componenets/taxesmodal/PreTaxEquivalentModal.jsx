import React from "react";
import ReactDOM from "react-dom";

// Formatting helpers tailored to match the screenshot exactly
const fmtPct = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return parseFloat(val).toFixed(2) + "%";
};

const fmtPlainNum = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === "") return "—";
  const rounded = Math.round(val);
  return (rounded < 0 ? "-" : "") + Math.abs(rounded).toLocaleString("en-NZ");
};

export default function PreTaxEquivalentModal({ isOpen, onClose, projections, metrics, inputs }) {
  if (!isOpen) return null;

  // Fully dynamic: pulls initial investment from inputs, and yearly data from projections
  const getCF = (yr) => {
    if (yr === 'Initial') {
      const initialInvestment = inputs?.investments || inputs?.equity || 0;
      return -Math.abs(initialInvestment); 
    }
    const p = projections?.find((p) => p.index === yr);
    return p?.preTaxCashFlow || 0;
  };

  const getEq = (yr) => {
    const p = projections?.find((p) => p.index === yr);
    return p?.equity || 0;
  };

  // Fully dynamic metrics pulling straight from your calculator engine
  const baseIrr = metrics?.irr || 0;
  const afterTaxIrr = metrics?.afterTaxIrr || metrics?.irr || 0;
  const marginalTaxRate = inputs?.investorTaxRate || 0;
  const preTaxEquivalent = metrics?.preTaxEquivalentIRR || 0;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[700px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh] font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[15px] font-bold text-[#1E293B]">Pre-tax Equivalent of IRR</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          
          {/* Table Wrapper */}
          <div className="border border-[#CBD5E1] rounded-[6px] bg-white p-4 mb-6 overflow-x-auto">
            <table className="w-full text-right border-collapse text-[13px] text-[#1E293B] min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">Year</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">Initial</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">1yr</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">2yr</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">3yr</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">5yr</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0]">10yr</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left py-2.5 pt-4">Pre-tax cash flow</td>
                  <td className="py-2.5 pt-4">{fmtPlainNum(getCF('Initial'))}</td>
                  <td className="py-2.5 pt-4">{fmtPlainNum(getCF(1))}</td>
                  <td className="py-2.5 pt-4">{fmtPlainNum(getCF(2))}</td>
                  <td className="py-2.5 pt-4">{fmtPlainNum(getCF(3))}</td>
                  <td className="py-2.5 pt-4">{fmtPlainNum(getCF(5))}</td>
                  <td className="py-2.5 pt-4">{fmtPlainNum(getCF(10))}</td>
                </tr>
                <tr>
                  <td className="text-left py-2.5 pb-4">Equity</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="py-2.5 pb-4">{fmtPlainNum(getEq(10))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="flex justify-center">
            <div className="border border-[#CBD5E1] rounded-[6px] bg-white p-5 w-full max-w-[400px] shadow-sm text-[13px] text-[#1E293B]">
              <div className="flex justify-between mb-2.5">
                <span>Pre-tax IRR</span>
                <span className="font-medium">{fmtPct(baseIrr)}</span>
              </div>
              <div className="flex justify-between mb-2.5">
                <span>After-tax IRR</span>
                <span className="font-medium">{fmtPct(afterTaxIrr)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Marginal tax rate</span>
                <span className="font-medium">{fmtPct(marginalTaxRate)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E2E8F0]">
                <span className="font-bold">Pre-tax equivalent of IRR</span>
                <span className="font-bold text-[#0052CC]">{fmtPct(preTaxEquivalent)}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-center items-center gap-4 shrink-0">
          <button className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm transition-colors">
            ?
          </button>
          <button 
            onClick={onClose} 
            className="px-10 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
        
      </div>
    </div>,
    document.body
  );
}

