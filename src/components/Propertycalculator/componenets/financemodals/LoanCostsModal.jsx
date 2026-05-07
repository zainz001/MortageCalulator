import React, { useState } from "react";
import ReactDOM from "react-dom";

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

const INITIAL_ROWS = [
  { id: "est", name: "Establishment fees", pct: "1.00%", cost: "0", isFlat: false },
  { id: "stamp", name: "Mortgagee stamp duty", pct: "0.00%", cost: "0", isFlat: false },
  { id: "ins", name: "Mortgage insurance", pct: "0.00%", cost: "0", isFlat: false },
  { id: "sol", name: "Mortgagee's solicitor's fees", pct: "0.00%", cost: "0", isFlat: true },
  { id: "val", name: "Valuation fees", pct: "0.00%", cost: "250", isFlat: true },
  { id: "reg1", name: "Registration of 1st mortgage", pct: "0.00%", cost: "46", isFlat: true },
  { id: "reg2", name: "Registration of 2nd mortgage", pct: "0.00%", cost: "46", isFlat: true },
  { id: "search", name: "Search fees", pct: "0.00%", cost: "21", isFlat: true },
  { id: "other", name: "Other loan costs", pct: "0.00%", cost: "0", isFlat: true },
];

export default function LoanCostsModal({
  isOpen,
  onClose,
  baseLoanRequired = 0,
  setLoanCosts
}) {
  const [rows, setRows] = useState(INITIAL_ROWS);

  if (!isOpen) return null;

  // 1. Math Engine
  const totalFlatCosts = rows.filter(r => r.isFlat).reduce((sum, r) => sum + parseNum(r.cost), 0);
  const totalPctCosts = rows.filter(r => !r.isFlat).reduce((sum, r) => sum + (parseNum(r.pct) / 100), 0);

  const safePctCosts = Math.min(totalPctCosts, 0.99);
  const newTotalLoan = baseLoanRequired > 0 ? (baseLoanRequired + totalFlatCosts) / (1 - safePctCosts) : 0;

  const computedRows = rows.map(row => {
    if (row.isFlat) {
      const actualCost = parseNum(row.cost);
      const actualPct = newTotalLoan > 0 ? (actualCost / newTotalLoan) * 100 : 0;
      return { ...row, calculatedPct: actualPct, calculatedCost: actualCost };
    } else {
      const actualPct = parseNum(row.pct);
      const actualCost = newTotalLoan * (actualPct / 100);
      return { ...row, calculatedPct: actualPct, calculatedCost: actualCost };
    }
  });

  const totalCostSum = computedRows.reduce((sum, r) => sum + r.calculatedCost, 0);
  const totalPctSum = newTotalLoan > 0 ? (totalCostSum / newTotalLoan) * 100 : 0;

  // 2. Event Handler with Auto-Toggling
  const handleRowChange = (index, field, val) => {
    const newRows = [...rows];

    if (field === "isFlat") {
      newRows[index].isFlat = val;
      // Freeze the calculated values so the numbers don't jump when manually clicking the checkbox
      if (val) {
        newRows[index].cost = Math.round(computedRows[index].calculatedCost).toString();
      } else {
        newRows[index].pct = computedRows[index].calculatedPct.toFixed(2) + "%";
      }
    } else {
      // Strip formatting safely for validation
      let cleanVal = String(val).replace(/,/g, "");
      if (field === "pct") {
        cleanVal = cleanVal.replace(/%/g, "").trim();
      }

      // Stop typing if they enter invalid characters (letters)
      if (cleanVal !== "" && !/^-?\d*\.?\d*$/.test(cleanVal)) return;

      newRows[index][field] = val;

      // MAGIC: Auto-toggle the checkbox based on which input the user is typing in!
      if (field === "pct" && newRows[index].isFlat) {
        newRows[index].isFlat = false;
      } else if (field === "cost" && !newRows[index].isFlat) {
        newRows[index].isFlat = true;
      }
    }

    setRows(newRows);
  };

  const handleOk = () => {
    if (setLoanCosts) {
      setLoanCosts(Math.round(totalCostSum).toString());
    }
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[480px] flex flex-col border border-[#CBD5E1] overflow-hidden">

        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Loan Costs</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-5 pt-4">

          {/* Header Row */}
          <div className="flex gap-3 mb-2 pb-1 border-b border-[#E2E8F0]">
            <div className="w-[180px] text-[12px] text-[#4A5568] font-bold">Cost Component</div>
            <div className="w-[60px] text-right text-[12px] text-[#4A5568] font-bold">% of Loan</div>
            <div className="w-[80px] text-right text-[12px] text-[#4A5568] font-bold">Cost ($)</div>
            <div className="w-[60px] text-center text-[12px] text-[#4A5568] font-bold">Flat Fee</div>
          </div>

          {/* Data Rows */}
          <div className="flex flex-col gap-1.5 mb-6">
            {computedRows.map((row, i) => (
              <div key={row.id} className="flex gap-3 items-center">

                {/* 1. Name */}
                <div className="w-[180px]">
                  <input
                    type="text"
                    value={row.name}
                    readOnly
                    className="w-full border border-[#CBD5E1] bg-white rounded-[3px] py-1 px-2 text-[12px] text-[#1E293B] shadow-sm cursor-default focus:outline-none"
                  />
                </div>

                {/* 2. % of Loan Input (ALWAYS EDITABLE) */}
                <div className="w-[60px]">
                  <input
                    type="text"
                    // If flat is checked, show the computed percentage. Otherwise, show what the user typed.
                    value={row.isFlat ? row.calculatedPct.toFixed(2) + "%" : rows[i].pct}
                    onChange={(e) => handleRowChange(i, "pct", e.target.value)}
                    onBlur={(e) => {
                      if (!row.isFlat) handleRowChange(i, "pct", parseNum(e.target.value).toFixed(2) + "%");
                    }}
                    className="w-full border border-[#CBD5E1] bg-white text-[#1E293B] shadow-sm rounded-[3px] py-1 px-1.5 text-[12px] text-right focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                {/* 3. Cost ($) Input (ALWAYS EDITABLE) */}
                <div className="w-[80px]">
                  <input
                    type="text"
                    // If flat is checked, show what the user typed. Otherwise, show the computed cost.
                    value={row.isFlat ? rows[i].cost : formatVal(row.calculatedCost)}
                    onChange={(e) => handleRowChange(i, "cost", e.target.value)}
                    onBlur={(e) => {
                      if (row.isFlat) handleRowChange(i, "cost", formatVal(parseNum(e.target.value)));
                    }}
                    className="w-full border border-[#CBD5E1] bg-white rounded-[3px] py-1 px-2 text-[12px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                {/* 4. Checkbox */}
                <div className="w-[60px] flex justify-center">
                  <input
                    type="checkbox"
                    checked={row.isFlat}
                    onChange={(e) => handleRowChange(i, "isFlat", e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#0052CC] border-[#CBD5E1] focus:ring-[#0052CC]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="pt-3 border-t border-[#CBD5E1]">
            <div className="flex gap-3 items-center mb-2">
              <div className="w-[180px] text-[13px] text-[#4A5568]">Total costs</div>
              <div className="w-[60px] text-[13px] text-[#1E293B] text-right pr-1">
                {totalPctSum.toFixed(2)}%
              </div>
              <div className="w-[80px] text-[13px] font-bold text-[#1E293B] text-right pr-2">
                {formatVal(totalCostSum)}
              </div>
              <div className="w-[60px]"></div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="w-[180px] text-[13px] text-[#4A5568]">Total loan <span className="text-[11px]">(including costs)</span></div>
              <div className="w-[60px]"></div>

              <div className="w-[80px] text-[13px] font-bold text-[#1E293B] text-right pr-2">
                {formatVal(newTotalLoan)}
              </div>

              <div className="w-[60px]"></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] shadow-sm">?</button>

          <div className="flex gap-2">
            <button onClick={handleOk} className="px-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] shadow-sm">OK</button>
            <button onClick={onClose} className="px-5 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
