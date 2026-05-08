import React from "react";
import ReactDOM from "react-dom";

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

  const inflationRate = inputs?.inflationRate !== undefined ? parseFloat(inputs.inflationRate) : 3.00;
  const irr = metrics?.irr || 0;

  const getCF = (yr) => {
    if (yr === 'Initial') return -(inputs?.investments || inputs?.equity || 0);
    const p = projections?.find((proj) => proj.index === yr);
    return p?.preTaxCashFlow || 0;
  };

  const getPV = (yr) => {
    const cf = getCF(yr);
    if (yr === 'Initial') return cf;
    return cf / Math.pow(1 + inflationRate / 100, yr);
  };

  let dynamicTotalInvestmentPV = 0;
  let dynamicNPV = 0;

  const initialCF = getCF('Initial');
  dynamicTotalInvestmentPV += Math.abs(initialCF); 
  dynamicNPV += initialCF;

  // Add yearly cash flows to totals
  projections?.forEach((p) => {
    const pv = p.preTaxCashFlow / Math.pow(1 + inflationRate / 100, p.index);
    if (pv < 0) {
      dynamicTotalInvestmentPV += Math.abs(pv); // Sum of all negative outlays
    }
    dynamicNPV += pv;
  });

  const lastProj = projections && projections.length > 0 ? projections[projections.length - 1] : null;
  const lastYr = lastProj?.index || 10;
  const equityAtEnd = lastProj?.equity || 0;
  const equityAtEndPV = equityAtEnd / Math.pow(1 + inflationRate / 100, lastYr);

  dynamicNPV += equityAtEndPV;

  const realReturn = metrics?.realReturn || (((1 + irr / 100) / (1 + inflationRate / 100) - 1) * 100);

  const totalInvestmentPV = metrics?.totalInvestmentPV || dynamicTotalInvestmentPV;
  const netPresentValue = metrics?.netPresentValue || dynamicNPV;
  const afterSaleEquity = metrics?.afterSaleEquity || equityAtEnd;
  const afterSaleEquityPV = metrics?.afterSaleEquityPV || equityAtEndPV;
  const afterSaleIrr = metrics?.afterSaleIrr || irr;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[500px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh] font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[15px] font-bold text-[#1E293B]">Internal Rate of Return</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <div className="border border-[#CBD5E1] rounded-[6px] bg-white p-4">
            <table className="w-full text-right border-collapse text-[13px] text-[#1E293B]">
              <thead>
                <tr>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0] w-[40%] pr-4 text-right">Year</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0] w-[30%] px-2">Cash Flow</th>
                  <th className="font-medium text-[#1E293B] pb-2 border-b border-[#E2E8F0] w-[30%] px-2">Today's $</th>
                </tr>
              </thead>
              <tbody>
                {/* Cash Flows */}
                <tr>
                  <td className="py-1.5 pr-4 pt-3">Initial investment</td>
                  <td className="py-1.5 px-2 pt-3">{fmtNum(getCF('Initial'))}</td>
                  <td className="py-1.5 px-2 pt-3">{fmtNum(getPV('Initial'))}</td>
                </tr>
                {[1, 2, 3, 5, 10].map(yr => (
                  <tr key={yr}>
                    <td className="py-1.5 pr-4">{yr}yr</td>
                    <td className="py-1.5 px-2">{fmtNum(getCF(yr))}</td>
                    <td className="py-1.5 px-2">{fmtNum(getPV(yr))}</td>
                  </tr>
                ))}

                {/* Summary Block */}
                <tr>
                  <td className="py-1.5 pr-4 pt-4 border-t border-[#E2E8F0]">Total investment</td>
                  <td className="py-1.5 px-2 pt-4 border-t border-[#E2E8F0]"></td>
                  <td className="py-1.5 px-2 pt-4 border-t border-[#E2E8F0]">{fmtCur(totalInvestmentPV)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">Equity at end</td>
                  <td className="py-1.5 px-2">{fmtCur(equityAtEnd)}</td>
                  <td className="py-1.5 px-2">{fmtCur(equityAtEndPV)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 pb-3">Net present value</td>
                  <td className="py-1.5 px-2 pb-3"></td>
                  <td className="py-1.5 px-2 pb-3 font-bold">{fmtCur(netPresentValue)}</td>
                </tr>
                
                {/* Rates */}
                <tr>
                  <td className="py-1.5 pr-4 font-bold border-t border-[#E2E8F0] pt-3">Internal rate of return</td>
                  <td className="py-1.5 px-2 border-t border-[#E2E8F0] pt-3"></td>
                  <td className="py-1.5 px-2 font-bold border-t border-[#E2E8F0] pt-3">{fmtPct(irr)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">Inflation rate</td>
                  <td className="py-1.5 px-2"></td>
                  <td className="py-1.5 px-2">{fmtPct(inflationRate)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 pb-3">Real return</td>
                  <td className="py-1.5 px-2 pb-3"></td>
                  <td className="py-1.5 px-2 font-bold pb-3">{fmtPct(realReturn)}</td>
                </tr>

                {/* If Sold Block */}
                <tr>
                  <td className="py-2 pr-4 font-bold text-left border-t border-[#E2E8F0]" colSpan="3">
                    If Sold...
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">After-sale equity</td>
                  <td className="py-1.5 px-2">{fmtCur(afterSaleEquity)}</td>
                  <td className="py-1.5 px-2">{fmtCur(afterSaleEquityPV)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">Internal rate of return</td>
                  <td className="py-1.5 px-2"></td>
                  <td className="py-1.5 px-2">{fmtPct(afterSaleIrr)}</td>
                </tr>
              </tbody>
            </table>
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