import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import PreTaxEquivalentModal from "../components/Propertycalculator/componenets/taxesmodal/PreTaxEquivalentModal";
import InternalRateOfReturnModal from "../components/Propertycalculator/componenets/taxesmodal/InternalRateOfReturnModal";
import AfterTaxCashFlowModal from "../components/Propertycalculator/componenets/taxesmodal/AfterTaxCashFlowModal"; // <-- 1. New Import

const fmtCur = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const rounded = Math.round(val);
  return (rounded < 0 ? "-$" : "$") + Math.abs(rounded).toLocaleString("en-NZ");
};

const fmtPct = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return parseFloat(val).toFixed(2) + "%";
};

const fmtPlainNum = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return Math.round(val).toLocaleString("en-NZ");
};

const cashflowColour = (val, isNegativeRed) => {
  if (val === null || val === undefined || isNaN(val)) return "text-slate-900";
  if (isNegativeRed && val < 0) return "text-red-600 font-bold";
  return "text-slate-900";
};

export default function ProjectionsGridModal({ isOpen, onClose, projections, metrics, inputs, onOpenModal }) {
  const [startYear, setStartYear] = useState(1);
  const COLUMNS_TO_SHOW = 5;
  const [isPreTaxEqOpen, setIsPreTaxEqOpen] = useState(false);
  const [isIrrOpen, setIsIrrOpen] = useState(false);
  const [isAfterTaxOpen, setIsAfterTaxOpen] = useState(false); // <-- 2. New State

  useEffect(() => {
    if (isOpen) setStartYear(1);
  }, [isOpen]);

  if (!isOpen || !projections || projections.length === 0) return null;

  const maxYears = projections.length;
  const handlePrev = () => setStartYear((prev) => Math.max(1, prev - COLUMNS_TO_SHOW));
  const handleNext = () => setStartYear((prev) => Math.min(maxYears - COLUMNS_TO_SHOW + 1, prev + COLUMNS_TO_SHOW));

  const displayYears = Array.from({ length: COLUMNS_TO_SHOW }, (_, i) => startYear + i).filter(y => y <= maxYears);
  const inVal = (key) => (inputs && inputs[key] !== undefined ? inputs[key] : 0);

  const horizonYear = displayYears[displayYears.length - 1];
  const horizonProjection = projections.find((p) => p.index === horizonYear);

  const displayIrr = horizonProjection && horizonProjection.irr !== undefined
    ? horizonProjection.irr
    : metrics?.irr;

  const displayPreTaxIrr = horizonProjection && horizonProjection.preTaxEquivalentIRR !== undefined
    ? horizonProjection.preTaxEquivalentIRR
    : metrics?.preTaxEquivalentIRR;

  const SECTIONS = [
    {
      title: null,
      rows: [
        { label: "Property value", modalKey: "propertyValue", inputVal: inVal("propertyValue"), yearFn: (p) => p.propertyValue, format: fmtCur },
        { label: "Purchase costs", modalKey: "purchaseCosts", inputVal: inVal("purchaseCosts"), yearFn: null, format: fmtCur, inputOnly: true },
        { label: "Investments", modalKey: "loanAmount", inputVal: inVal("investments"), yearFn: null, format: fmtCur, inputOnly: true },
        { label: "Loan amount", modalKey: "loanAmount", inputVal: inVal("loanAmount"), yearFn: (p) => p.loanAmount, format: fmtCur },
        { label: "Equity", inputVal: inVal("equity"), yearFn: (p) => p.equity, format: fmtCur, isBold: true },
        { label: "Capital growth rate", modalKey: "capitalGrowthRate", inputVal: inVal("capitalGrowthRate"), yearFn: () => inVal("capitalGrowthRate"), format: fmtPct },
        { label: "Inflation rate (CPI)", modalKey: "inflationRate", inputVal: inVal("inflationRate"), yearFn: () => inVal("inflationRate"), format: fmtPct },
        { label: "Gross rent /week", modalKey: "rentalIncome", inputVal: inVal("grossRentWeekly"), inputFormat: fmtCur, yearFn: (p) => p.annualGrossRent, format: fmtCur, isBold: true },
      ],
    },
    {
      title: "Cash Deductions",
      rows: [
        { label: "Interest", modalKey: "interestRate", inputVal: inVal("interestRate"), inputFormat: fmtPct, yearFn: (p) => p.annualInterest, format: fmtCur },
        { label: "Rental expenses", modalKey: "rentalExpenses", inputVal: inVal("rentalExpensesPercent"), inputFormat: fmtPct, yearFn: (p) => p.annualRentalExpenses, format: fmtCur },
        { label: "Pre-tax cash flow", inputVal: inVal("preTaxCashFlow"), inputFormat: fmtCur, yearFn: (p) => p.preTaxCashFlow, format: fmtCur, isBold: true, isNegativeRed: true },
      ],
    },
    {
      title: "Non-cash deductions",
      rows: [
        { label: "Deprec.of building", modalKey: "buildingDepreciation", inputVal: inVal("buildingDepreciationRate"), inputFormat: fmtPct, yearFn: (p) => p.buildingDepreciation, format: fmtCur },
        { label: "Deprec.of chattels", modalKey: "chattelsDepreciation", inputVal: inVal("chattelsValue"), inputFormat: fmtCur, yearFn: (p) => p.chattelsDepreciation, format: fmtCur },
        { label: "Loan costs", modalKey: "loanCosts", inputVal: inVal("loanCosts"), inputFormat: fmtCur, yearFn: (p) => (p.index === 1 ? inVal("loanCosts") : null), format: fmtCur },
        { label: "Total deductions", inputVal: null, yearFn: (p) => p.deductions, format: fmtCur, isBold: true },
      ],
    },
    {
      title: "Summary",
      rows: [
        { label: "Tax credit (single)", modalKey: "taxableIncomeSingle", inputVal: inVal("investorIncome"), inputFormat: fmtCur, yearFn: (p) => p.taxCredit, format: fmtCur },
        // <-- 3. Linked to afterTaxCashFlow key
        { label: "After-tax cash flow", modalKey: "afterTaxCashFlow", inputVal: inVal("afterTaxCashFlow"), inputFormat: fmtCur, yearFn: (p) => p.afterTaxCashFlow, format: fmtCur, isBold: true, isNegativeRed: true },
        { label: "Rate of return (IRR)", modalKey: "irr", inputVal: displayIrr, inputFormat: fmtPct, yearFn: null, inputOnly: true, isBold: true },
        { label: "Pre-tax equivalent", modalKey: "preTaxEquivalent", inputVal: displayPreTaxIrr, inputFormat: fmtPct, yearFn: null, inputOnly: true, isBold: false },
        { label: "Your cost /(income) per week", inputVal: null, yearFn: (p) => p.costPerWeek, format: fmtPlainNum, isBold: true },
      ],
    },
  ];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-[1050px] max-h-[95vh] flex flex-col overflow-hidden font-sans border border-slate-200">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 sm:px-6 sm:py-4 bg-white border-b border-slate-200 gap-3 sm:gap-0 shrink-0">
          <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-800">Property Projections</h2>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[12px] sm:text-[13px] font-medium text-slate-500 mr-1 sm:mr-2">
                Years {displayYears[0]}-{displayYears[displayYears.length - 1]}
              </span>
              <button
                onClick={handlePrev}
                disabled={startYear === 1}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-slate-300 bg-white rounded-[6px] text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                &lt;
              </button>
              <button
                onClick={handleNext}
                disabled={startYear + COLUMNS_TO_SHOW > maxYears}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-slate-300 bg-white rounded-[6px] text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-[24px] leading-none ml-2 transition-colors">&times;</button>
          </div>
        </div>

        <div className="overflow-auto w-full bg-white flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 z-30 shadow-[0_1px_0_0_#e2e8f0]">
              <tr>
                <th className="sticky left-0 bg-slate-50 z-40 px-3 py-2 sm:px-5 sm:py-3 text-[12px] sm:text-[13px] font-bold text-slate-700 border-r border-slate-200 shadow-[1px_0_0_0_#e2e8f0] min-w-[160px] sm:min-w-[220px]">
                  Metric
                </th>
                <th className="px-3 py-2 sm:px-5 sm:py-3 text-[12px] sm:text-[13px] font-bold text-[#0052CC] border-r border-slate-200 text-center min-w-[90px] sm:min-w-[110px]">
                  Input
                </th>
                {displayYears.map((yr) => (
                  <th key={yr} className="px-3 py-2 sm:px-5 sm:py-3 text-[12px] sm:text-[13px] font-bold text-slate-700 text-right min-w-[80px] sm:min-w-[100px]">
                    {yr}yr
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {SECTIONS.map((section, sIdx) => (
                <React.Fragment key={sIdx}>
                  {section.title && (
                    <tr className="bg-slate-100">
                      <td colSpan={2 + displayYears.length} className="sticky left-0 z-20 px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-[1px_0_0_0_#e2e8f0] bg-slate-100 border-y border-slate-200">
                        {section.title}
                      </td>
                    </tr>
                  )}

                  {section.rows.map((row, rIdx) => {
                    let inputColor = "text-[#0052CC]";
                    if (row.isNegativeRed && row.inputVal < 0) inputColor = "text-red-600 font-bold";
                    else if (row.inputOnly && row.isBold) inputColor = "text-slate-900";

                    return (
                      <tr key={rIdx} className="group hover:bg-blue-50/40 transition-colors border-b border-slate-100 last:border-b-0">

                        <td
                          onClick={() => {
                            // <-- 4. Intercept the click for the new modal
                            if (row.modalKey === "preTaxEquivalent") {
                              setIsPreTaxEqOpen(true);
                            } else if (row.modalKey === "irr") {
                              setIsIrrOpen(true);
                            } else if (row.modalKey === "afterTaxCashFlow") {
                              setIsAfterTaxOpen(true);
                            } else if (row.modalKey && onOpenModal) {
                              onOpenModal(row.modalKey);
                            }
                          }}
                          className={`
                            sticky left-0 z-20 px-3 py-2 sm:px-5 sm:py-2.5 border-r border-slate-200 shadow-[1px_0_0_0_#e2e8f0] text-[12px] sm:text-[13px] transition-colors
                            ${row.isBold ? "font-bold text-slate-900 bg-slate-50" : "font-medium text-slate-600 bg-white"}
                            group-hover:bg-[#f8fafc]
                            ${row.modalKey ? "cursor-pointer hover:text-[#0052CC]" : ""}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`truncate ${row.modalKey ? "underline decoration-dashed underline-offset-2 decoration-slate-300 hover:decoration-[#0052CC]" : ""}`}>
                              {row.label}
                            </span>
                            {row.modalKey && (
                              <span className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-[#0052CC] ml-1 sm:ml-2">↗</span>
                            )}
                          </div>
                        </td>

                        <td className={`px-3 py-2 sm:px-5 sm:py-2.5 border-r border-slate-200 text-[12px] sm:text-[13px] text-center ${row.isBold ? "font-bold" : "font-medium"} ${inputColor}`}>
                          {row.inputVal !== null && row.inputVal !== undefined ? (row.inputFormat ? row.inputFormat(row.inputVal) : row.format(row.inputVal)) : "—"}
                        </td>

                        {displayYears.map((yrIdx) => {
                          if (row.inputOnly) {
                            return <td key={yrIdx} className="px-3 py-2 sm:px-5 sm:py-2.5 text-right text-slate-300 text-[12px] sm:text-[13px]">—</td>;
                          }

                          const projection = projections.find((p) => p.index === yrIdx);
                          const val = projection && row.yearFn ? row.yearFn(projection) : null;
                          const colourClass = cashflowColour(val, row.isNegativeRed);

                          return (
                            <td key={yrIdx} className={`px-3 py-2 sm:px-5 sm:py-2.5 text-right text-[12px] sm:text-[13px] ${row.isBold ? "font-bold" : "font-medium"} ${colourClass}`}>
                              {val !== null ? row.format(val) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Render Modals */}
      <PreTaxEquivalentModal
        isOpen={isPreTaxEqOpen}
        onClose={() => setIsPreTaxEqOpen(false)}
        projections={projections}
        metrics={metrics}
        inputs={inputs}
      />
      <InternalRateOfReturnModal 
        isOpen={isIrrOpen} 
        onClose={() => setIsIrrOpen(false)}
        projections={projections}
        metrics={metrics}
        inputs={inputs}
      />
      <AfterTaxCashFlowModal
        isOpen={isAfterTaxOpen} 
        onClose={() => setIsAfterTaxOpen(false)}
        projections={projections}
        inputs={inputs}
      />
    </div>,
    document.body
  );
}