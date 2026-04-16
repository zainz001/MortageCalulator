import React from "react";

export default function ProjectionsGrid({ projections, metrics }) {
  if (!projections || projections.length === 0) return null;

  const displayYears = [1, 2, 3, 5, 10];
  const formatCur = (val) => "$" + Math.round(val).toLocaleString();

  const Row = ({ label, dataKey, isNegativeRed = false, isBold = false }) => (
    <div className={`flex border-b border-[#F1F5F9] py-3 min-w-[700px] ${isBold ? 'font-bold text-[#1E293B]' : 'text-[#4A5568] text-[13px]'}`}>
      <div className={`w-[220px] shrink-0 sticky left-0 bg-white z-10 px-4 ${isBold ? 'bg-[#FAFAFA]' : ''}`}>{label}</div>
      {displayYears.map(yr => {
        const yearData = projections.find(p => p.index === yr);
        const val = yearData ? yearData[dataKey] : 0;
        const color = isNegativeRed && val < 0 ? 'text-red-500' : '';
        return (
          <div key={yr} className={`flex-1 text-right px-4 ${color}`}>
            {formatCur(val)}
          </div>
        );
      })}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="flex border-b border-[#E2E8F0] py-2 bg-[#F8F8F8] min-w-[700px]">
      <div className="w-[220px] shrink-0 sticky left-0 bg-[#F8F8F8] z-10 px-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">{title}</div>
      {displayYears.map(yr => <div key={yr} className="flex-1"></div>)}
    </div>
  );

  return (
    <div className="overflow-x-auto w-full bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm custom-scrollbar">
      {/* Header */}
      <div className="flex border-b-2 border-[#E2E8F0] py-4 bg-[#FAFAFA] min-w-[700px] font-bold text-[#1E293B] text-[13px]">
        <div className="w-[220px] shrink-0 sticky left-0 bg-[#FAFAFA] z-10 px-4">Metrics Output</div>
        {displayYears.map(yr => (
          <div key={yr} className="flex-1 text-right px-4">Year {yr}</div>
        ))}
      </div>
      
      <SectionHeader title="Capital & Income" />
      <Row label="Property Value" dataKey="propertyValue" />
      <Row label="Equity" dataKey="equity" />
      <Row label="Gross Rent (Annual)" dataKey="annualGrossRent" />
      
      <SectionHeader title="Cash Deductions" />
      <Row label="Interest (I/O)" dataKey="annualInterest" />
      <Row label="Rental Expenses" dataKey="annualRentalExpenses" />
      <Row label="Pre-tax Cash Flow" dataKey="preTaxCashFlow" isNegativeRed isBold />
      
      <SectionHeader title="Non-Cash Deductions & Tax" />
      <Row label="Depreciation (Chattels)" dataKey="chattelsDepreciation" />
      <Row label="Total Deductions" dataKey="deductions" />
      <Row label="Tax Credit" dataKey="taxCredit" />
      
      <SectionHeader title="Summary Outputs" />
      <Row label="After-tax Cash Flow" dataKey="afterTaxCashFlow" isNegativeRed isBold />
      <Row label="Cost / Income per Week" dataKey="costPerWeek" isNegativeRed isBold />
      
      {/* IRR Row Special handling since it's a single metric */}
      <div className="flex border-b border-[#F1F5F9] py-3 min-w-[700px] font-bold text-[#1E293B] bg-[#FAFAFA]">
        <div className="w-[220px] shrink-0 sticky left-0 bg-[#FAFAFA] z-10 px-4">10-Year IRR (Internal Rate of Return)</div>
        <div className="flex-1 text-right px-4 col-span-5 w-full">
          {metrics?.irr ? metrics.irr.toFixed(2) + '%' : 'N/A'}
        </div>
      </div>
    </div>
  );
}