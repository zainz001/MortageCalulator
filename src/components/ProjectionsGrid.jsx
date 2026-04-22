import React from "react";

/**
 * ProjectionsGrid
 *
 * Spec ref: PIA Functional Spec §6.1 — Main Projections Grid
 *
 * §6.1: "Rows = metric, columns = year (Input / 1yr / 2yr / 3yr / 5yr / 10yr)"
 * §6.1: All rows from spec table implemented (see ROWS definition below)
 * §6.1: "Negative cashflow values in red. Positive in black (or green where highlighted)."
 * §6.1: "Cost per week row — display as positive when investor is out-of-pocket"
 *        (costPerWeek is already ×−1 in the engine, so positive = out-of-pocket)
 * §6.1: "Bold formatting on key rows: Pre-tax cash flow, After-tax cash flow, IRR, Cost per week"
 * §8.2: Responsive — horizontally scrollable on mobile, sticky first column
 * §8.2: Section dividers between Cash Deductions, Non-Cash Deductions, Summary rows
 *
 * Props:
 *   projections  {Array}  — from calculatePIA().projections (yrs 1–10)
 *   metrics      {object} — from calculatePIA().metrics
 *   inputs       {object} — original input values for the "Input" column
 */

const DISPLAY_YEAR_INDICES = [1, 2, 3, 5, 10];

// §6.1 formatting helpers
const fmtCur = (val) => {
  if (val === null || val === undefined) return "—";
  const rounded = Math.round(val);
  return (rounded < 0 ? "-$" : "$") + Math.abs(rounded).toLocaleString("en-NZ");
};

const fmtPct = (val) => {
  if (val === null || val === undefined) return "—";
  return val.toFixed(2) + "%";
};

const fmtWeekly = (val) => {
  if (val === null || val === undefined) return "—";
  const rounded = Math.round(val);
  // §6.1: costPerWeek is pre-flipped in engine (positive = out-of-pocket).
  // Display with $ prefix only, no sign manipulation needed.
  return "$" + Math.abs(rounded).toLocaleString("en-NZ") + "/wk";
};

// Returns Tailwind text colour class for cashflow values per §6.1
const cashflowColour = (val) => {
  if (val === null || val === undefined) return "";
  if (val < 0) return "text-red-500";
  return "text-[#1E293B]";
};

export default function ProjectionsGrid({ projections, metrics, inputs }) {
  if (!projections || projections.length === 0) return null;

  const yr = (index) => projections.find((p) => p.index === index);

  // ─── §6.1 Row definitions ─────────────────────────────────────────────────
  // Each entry: { label, inputVal, yearFn, format, isBold, isNegativeRed, inputOnly }
  // inputOnly = true  → only shows in Input column (no year projections)
  // yearFn    = (projection) => value for that year column

  const SECTIONS = [
    {
      title: null, // No header for first block — property fundamentals
      rows: [
        {
          label: "Property value",
          inputVal: inputs.propertyValue,
          yearFn: (p) => p.propertyValue,
          format: fmtCur,
        },
        {
          label: "Purchase costs",
          inputVal: inputs.purchaseCosts,
          yearFn: null, // input only per §6.1 spec table
          format: fmtCur,
          inputOnly: true,
        },
        {
          label: "Investments (cash)",
          inputVal: inputs.investments,
          yearFn: null,
          format: fmtCur,
          inputOnly: true,
        },
        {
          label: "Loan amount",
          inputVal: inputs.loanAmount,
          yearFn: (p) => p.loanAmount,
          format: fmtCur,
        },
        {
          label: "Equity",
          inputVal: inputs.equity,
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
          inputVal: inputs.capitalGrowthRate,
          yearFn: (p) => inputs.capitalGrowthRate, // static assumption
          format: fmtPct,
        },
        {
          label: "Inflation rate (CPI)",
          inputVal: inputs.inflationRate,
          yearFn: (p) => inputs.inflationRate,
          format: fmtPct,
        },
        {
          label: "Gross rent / week",
          inputVal: inputs.grossRentWeekly,
          yearFn: (p) => p.annualGrossRent / 52,
          format: fmtCur,
        },
      ],
    },
    {
      title: "Cash Deductions",
      rows: [
        {
          label: "Interest (I/O)",
          inputVal: inputs.annualInterest,
          yearFn: (p) => p.annualInterest,
          format: fmtCur,
        },
        {
          label: "Rental expenses",
          inputVal: inputs.annualRentalExpenses,
          yearFn: (p) => p.annualRentalExpenses,
          format: fmtCur,
        },
        {
          label: "Pre-tax cash flow",
          inputVal: inputs.preTaxCashFlow,
          yearFn: (p) => p.preTaxCashFlow,
          format: fmtCur,
          isBold: true,      // §6.1 bold
          isNegativeRed: true, // §6.1 red if negative
        },
      ],
    },
    {
      title: "Non-Cash Deductions",
      rows: [
        {
          label: "Depreciation (chattels)",
          inputVal: inputs.chattelsDepreciation,
          yearFn: (p) => p.chattelsDepreciation,
          format: fmtCur,
        },
        {
          label: "Depreciation (building)",
          inputVal: inputs.buildingDepreciation,
          yearFn: null, // §6.1: building dep shown in Input column only
          format: fmtCur,
          inputOnly: true,
        },
        {
          label: "Loan costs",
          inputVal: inputs.loanCosts,
          yearFn: (p) => (p.index === 1 ? inputs.loanCosts : null), // §6.1: yr 1 only
          format: fmtCur,
        },
        {
          label: "Total deductions",
          inputVal: inputs.totalDeductions,
          yearFn: (p) => p.deductions,
          format: fmtCur,
        },
      ],
    },
    {
      title: "Summary",
      rows: [
        {
          label: "Tax credit",
          inputVal: inputs.taxCredit,
          yearFn: (p) => p.taxCredit,
          format: fmtCur,
        },
        {
          label: "After-tax cash flow",
          inputVal: inputs.afterTaxCashFlow,
          yearFn: (p) => p.afterTaxCashFlow,
          format: fmtCur,
          isBold: true,      // §6.1 bold
          isNegativeRed: true,
        },
        {
          // §6.1: IRR shown in Input column only, spans full row
          label: "IRR (10-year)",
          inputVal: metrics?.irr,
          yearFn: null,
          format: (v) => (v !== null && v !== undefined ? v.toFixed(2) + "%" : "N/A"),
          inputOnly: true,
          isBold: true, // §6.1 bold
        },
        {
          // §6.1: "Cost per week — display as positive when out-of-pocket"
          // Engine already flips sign: costPerWeek = preTaxCashFlow/52 × -1
          // So positive costPerWeek = investor out-of-pocket → display as-is
          label: "Cost / income per week",
          inputVal: null, // §6.1: no Input column value for this row
          yearFn: (p) => p.costPerWeek,
          format: fmtWeekly,
          isBold: true, // §6.1 bold
          // §6.1: Red when investor is OUT-of-pocket (costPerWeek > 0 means paying)
          costPerWeekColour: true,
        },
      ],
    },
  ];

  const colCount = 1 + DISPLAY_YEAR_INDICES.length; // Input + 5 year columns

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
        {/* §6.1: Input column */}
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
          {/* §8.2: Section divider header */}
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
            const isLast =
              sIdx === SECTIONS.length - 1 &&
              rIdx === section.rows.length - 1;

            return (
              <div
                key={rIdx}
                className={`flex ${isLast ? "" : "border-b border-[#F1F5F9]"} ${
                  row.isBold ? "bg-[#FAFAFA]" : ""
                }`}
                style={{ minWidth: 700 }}
              >
                {/* Row label — sticky on mobile */}
                <div
                  className={`w-[220px] shrink-0 sticky left-0 z-10 px-4 py-3 border-r border-[#E2E8F0] text-[13px] ${
                    row.isBold
                      ? "font-bold text-[#1E293B] bg-[#FAFAFA]"
                      : "text-[#4A5568] bg-white"
                  }`}
                >
                  {row.label}
                </div>

                {/* Input column */}
                <div
                  className={`w-[110px] shrink-0 text-right px-4 py-3 border-r border-[#E2E8F0] text-[13px] ${
                    row.isBold ? "font-bold" : "font-medium"
                  } ${
                    row.isNegativeRed
                      ? cashflowColour(row.inputVal)
                      : "text-[#1E293B]"
                  }`}
                >
                  {row.inputVal !== null && row.inputVal !== undefined
                    ? row.format(row.inputVal)
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

                  // §6.1: cost per week — red when positive (= out-of-pocket)
                  let colourClass = "";
                  if (row.costPerWeekColour) {
                    colourClass = val > 0 ? "text-red-500" : "text-[#1E293B]";
                  } else if (row.isNegativeRed) {
                    colourClass = cashflowColour(val);
                  } else {
                    colourClass = "text-[#1E293B]";
                  }

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