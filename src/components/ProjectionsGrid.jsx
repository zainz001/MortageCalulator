import React from "react";

/**
 * ProjectionsGrid
 *
 * Spec ref: PIA Functional Spec §6.1 — Main Projections Grid
 */

const DISPLAY_YEAR_INDICES = [1, 2, 3, 5, 10];

// Formatting helpers
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

const cashflowColour = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "";
  if (val < 0) return "text-red-500";
  return "text-[#1E293B]";
};

export default function ProjectionsGrid({ projections, metrics, inputs }) {
  if (!projections || projections.length === 0) return null;

  // Safely extract inputs, falling back to 0 if missing
  const inVal = (key) => (inputs && inputs[key] !== undefined ? inputs[key] : 0);

  // ─── Row definitions with DUAL FORMATTING ─────────────────────────────────
  const SECTIONS = [
    {
      title: null, 
      rows: [
        {
          label: "Property value",
          inputVal: inVal("propertyValue"),
          yearFn: (p) => p.propertyValue,
          format: fmtCur,
        },
        {
          label: "Purchase costs",
          inputVal: inVal("purchaseCosts") || metrics?.purchaseCosts,
          yearFn: null,
          format: fmtCur,
          inputOnly: true,
        },
        {
          label: "Investments",
          inputVal: inVal("cashInvested") || 75000, 
          yearFn: null,
          format: fmtCur,
          inputOnly: true,
        },
        {
          label: "Loan amount",
          inputVal: metrics?.loanAmount || inVal("loanAmount"),
          yearFn: (p) => p.loanAmount,
          format: fmtCur,
        },
        {
          label: "Equity",
          inputVal: metrics?.startingEquity || inVal("equity"),
          yearFn: (p) => p.equity,
          format: fmtCur,
        },
      ],
    },
    {
      title: null,
      rows: [
        {
          label: "Capital growth rate",
          inputVal: inVal("capitalGrowthRate"),
          yearFn: () => inVal("capitalGrowthRate"),
          format: fmtPct,
        },
        {
          label: "Inflation rate (CPI)",
          inputVal: inVal("inflationRate"),
          yearFn: () => inVal("inflationRate"),
          format: fmtPct,
        },
        {
          label: "Gross rent /week",
          inputVal: inVal("grossRentWeekly"),
          inputFormat: fmtCur,             // Shows $700 in Input column
          yearFn: (p) => p.annualGrossRent, // Shows $35,672 in Yr 1
          format: fmtCur,
        },
      ],
    },
    {
      title: "Cash Deductions",
      rows: [
        {
          label: "Interest (I/O)",
          inputVal: inVal("interestRate"), // Shows 6.50% in Input column
          inputFormat: fmtPct,
          yearFn: (p) => p.annualInterest,  // Shows $44,594 in Yr 1
          format: fmtCur,
        },
        {
          label: "Rental expenses",
          inputVal: inVal("rentalExpensesPercent"),
          inputFormat: fmtPct,
          yearFn: (p) => p.annualRentalExpenses,
          format: fmtCur,
        },
        {
          label: "Pre-tax cash flow",
          inputVal: -(inVal("cashInvested") || 75000), // Simulating initial outlay
          inputFormat: fmtCur,
          yearFn: (p) => p.preTaxCashFlow,
          format: fmtCur,
          isBold: true,
          isNegativeRed: true,
        },
      ],
    },
    {
      title: "Non-cash deductions",
      rows: [
        {
          label: "Deprec.of building",
          inputVal: inVal("buildingDepreciationRate") || 0,
          inputFormat: fmtPct,
          yearFn: (p) => p.buildingDepreciation,
          format: fmtCur,
        },
        {
          label: "Deprec.of chattels",
          inputVal: inVal("chattelsValue") || 45000,
          inputFormat: fmtCur,
          yearFn: (p) => p.chattelsDepreciation,
          format: fmtCur,
        },
        {
          label: "Loan costs",
          inputVal: metrics?.loanCosts || inVal("loanCosts"),
          inputFormat: fmtCur,
          yearFn: (p) => (p.index === 1 ? (metrics?.loanCosts || inVal("loanCosts")) : null),
          format: fmtCur,
        },
        {
          label: "Total deductions",
          inputVal: null,
          yearFn: (p) => p.deductions,
          format: fmtCur,
        },
      ],
    },
    {
      title: "Summary",
      rows: [
        {
          label: "Tax credit (single)",
          inputVal: inVal("investorIncome") || 120000,
          inputFormat: fmtCur,
          yearFn: (p) => p.taxCredit,
          format: fmtCur,
        },
        {
          label: "After-tax cash flow",
          inputVal: -(inVal("cashInvested") || 75000),
          inputFormat: fmtCur,
          yearFn: (p) => p.afterTaxCashFlow,
          format: fmtCur,
          isBold: true,
          isNegativeRed: true,
        },
        {
          label: "Rate of return (IRR)",
          inputVal: metrics?.irr,
          inputFormat: fmtPct,
          yearFn: null,
          inputOnly: true,
          isBold: true,
        },
        {
          label: "Pre-tax equivalent",
          inputVal: metrics?.preTaxEquivalentIRR,
          inputFormat: fmtPct,
          yearFn: null,
          inputOnly: true,
          isBold: false,
        },
        {
          label: "Your cost /(income) per week",
          inputVal: null,
          yearFn: (p) => p.costPerWeek,
          format: fmtPlainNum, // Shows plain number like 380, no dollar sign
          isBold: true,
        },
      ],
    },
  ];

  return (
    <div className="overflow-x-auto w-full bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm">
      {/* ── Column header row ── */}
      <div
        className="flex border-b-2 border-[#E2E8F0] bg-[#FAFAFA] font-bold text-[#1E293B] text-[13px]"
        style={{ minWidth: 700 }}
      >
        <div className="w-[220px] shrink-0 sticky left-0 bg-[#FAFAFA] z-10 px-4 py-4 border-r border-[#E2E8F0]">
          Metric
        </div>
        <div className="w-[110px] shrink-0 text-right px-4 py-4 border-r border-[#E2E8F0] text-[#0052CC]">
          Input
        </div>
        {DISPLAY_YEAR_INDICES.map((yr) => (
          <div key={yr} className="flex-1 text-right px-4 py-4 min-w-[90px]">
            {yr}yr
          </div>
        ))}
      </div>

      {/* ── Section rows ── */}
      {SECTIONS.map((section, sIdx) => (
        <React.Fragment key={sIdx}>
          
          {/* Section divider header */}
          {section.title && (
            <div
              className="flex border-b border-[#E2E8F0] bg-[#F8F8F8]"
              style={{ minWidth: 700 }}
            >
              <div className="w-[220px] shrink-0 sticky left-0 bg-[#F8F8F8] z-10 px-4 py-2 text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-r border-[#E2E8F0]">
                {section.title}
              </div>
              <div className="flex-1" />
            </div>
          )}

          {section.rows.map((row, rIdx) => {
            const isLast = sIdx === SECTIONS.length - 1 && rIdx === section.rows.length - 1;

            // Determine specific color for the Input column to match legacy app
            let inputColor = "text-[#0052CC]"; // Default legacy blue
            if (row.isNegativeRed && row.inputVal < 0) {
              inputColor = "text-red-500";
            } else if (row.inputOnly && row.isBold) {
              inputColor = "text-[#1E293B]"; // e.g. IRR is black
            }

            return (
              <div
                key={rIdx}
                className={`flex ${isLast ? "" : "border-b border-[#F1F5F9]"} ${
                  row.isBold ? "bg-[#FAFAFA]" : ""
                }`}
                style={{ minWidth: 700 }}
              >
                {/* Row label */}
                <div
                  className={`w-[220px] shrink-0 sticky left-0 z-10 px-4 py-3 border-r border-[#E2E8F0] text-[13px] ${
                    row.isBold ? "font-bold text-[#1E293B] bg-[#FAFAFA]" : "text-[#4A5568] bg-white"
                  }`}
                >
                  {row.label}
                </div>

                {/* Input column */}
                <div
                  className={`w-[110px] shrink-0 text-right px-4 py-3 border-r border-[#E2E8F0] text-[13px] ${
                    row.isBold ? "font-bold" : "font-medium"
                  } ${inputColor}`}
                >
                  {row.inputVal !== null && row.inputVal !== undefined
                    ? (row.inputFormat ? row.inputFormat(row.inputVal) : row.format(row.inputVal))
                    : "—"}
                </div>

                {/* Year columns */}
                {DISPLAY_YEAR_INDICES.map((yrIdx) => {
                  if (row.inputOnly) {
                    return (
                      <div key={yrIdx} className="flex-1 text-right px-4 py-3 min-w-[90px] text-[#CBD5E1] text-[13px]">
                        —
                      </div>
                    );
                  }

                  const projection = projections.find((p) => p.index === yrIdx);
                  const val = projection && row.yearFn ? row.yearFn(projection) : null;
                  
                  let colourClass = "text-[#1E293B]";
                  if (row.isNegativeRed) colourClass = cashflowColour(val);

                  return (
                    <div
                      key={yrIdx}
                      className={`flex-1 text-right px-4 py-3 min-w-[90px] text-[13px] ${
                        row.isBold ? "font-bold" : "font-medium"
                      } ${colourClass}`}
                    >
                      {val !== null ? row.format(val) : "—"}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}