import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import LoanCostsModal from "./LoanCostsModal"; // Ensure path is correct

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function LoanAmountModal({
  isOpen,
  onClose,
  propertyCost = 0,
  renovationCosts = 0,
  purchaseCosts = 0,
  furnitureCosts = 0,
  holdingCosts = 0,
  initialCashInvested = 0,
  initialEquityInvested = 0,
  initialAdditionalLoan = 0,
  setCashInvested,
  setEquityInvested,
  setAdditionalLoan,
  setLoanCosts,
  loanA, setLoanA,
  loanB, setLoanB,
  splitRate, setSplitRate
}) {
  const [isLoanTypeOpen, setIsLoanTypeOpen] = useState(false);

  const [grid, setGrid] = useState({
    property: { cash: "0", equity: "0", loan: "0" },
    renovation: { cash: "0", equity: "0", loan: "0" },
    purchase: { cash: "0", equity: "0", loan: "0" },
    furniture: { cash: "0", equity: "0", loan: "0" },
    holding: { cash: "0", equity: "0", loan: "0" },
    loanCosts: { cash: "0", equity: "0", loan: "0" },
  });

  const [addLoan, setAddLoan] = useState("0");

  const costs = useMemo(() => ({
    property: parseNum(propertyCost),
    renovation: parseNum(renovationCosts),
    purchase: parseNum(purchaseCosts),
    furniture: parseNum(furnitureCosts),
    holding: parseNum(holdingCosts),
  }), [propertyCost, renovationCosts, purchaseCosts, furnitureCosts, holdingCosts]);

  useEffect(() => {
    if (isOpen) {
      const propCost = costs.property;
      const initialCash = parseNum(initialCashInvested);
      const initialEquity = parseNum(initialEquityInvested);

      setGrid({
        property: {
          cash: String(initialCash),
          equity: String(initialEquity),
          loan: String(propCost - initialCash - initialEquity)
        },
        renovation: { cash: "0", equity: "0", loan: String(costs.renovation) },
        purchase: { cash: "0", equity: "0", loan: String(costs.purchase) },
        furniture: { cash: "0", equity: "0", loan: String(costs.furniture) },
        holding: { cash: "0", equity: "0", loan: String(costs.holding) },
        loanCosts: { cash: "0", equity: "0", loan: "0" },
      });
      setAddLoan(String(parseNum(initialAdditionalLoan)));
    }
  }, [isOpen, initialCashInvested, initialEquityInvested, initialAdditionalLoan, costs]);

  if (!isOpen) return null;

  const handleGridChange = (rowId, field, val) => {
    const cleanVal = val.replace(/,/g, "");
    if (cleanVal !== "" && !/^-?\d*\.?\d*$/.test(cleanVal)) return;
    const numVal = parseNum(cleanVal);
    const rowCost = rowId === "loanCosts" ? dynamicLoanCosts : costs[rowId];

    setGrid(prev => {
      const row = { ...prev[rowId] };
      row[field] = cleanVal;
      if (field === "cash" || field === "equity") {
        const c = field === "cash" ? numVal : parseNum(row.cash);
        const e = field === "equity" ? numVal : parseNum(row.equity);
        row.loan = String(rowCost - c - e);
      } else if (field === "loan") {
        const l = numVal;
        const e = parseNum(row.equity);
        row.cash = String(rowCost - l - e);
      }
      return { ...prev, [rowId]: row };
    });
  };

  const currentCashSum = Object.keys(grid).filter(k => k !== "loanCosts").reduce((sum, k) => sum + parseNum(grid[k].cash), 0);
  const currentEquitySum = Object.keys(grid).filter(k => k !== "loanCosts").reduce((sum, k) => sum + parseNum(grid[k].equity), 0);
  const baseCostSum = Object.values(costs).reduce((sum, c) => sum + c, 0);
  const baseRequiredForLoanCost = baseCostSum + 363 + parseNum(addLoan) - currentCashSum - currentEquitySum;
  const dynamicTotalLoan = baseRequiredForLoanCost / 0.99;
  const dynamicLoanCosts = (dynamicTotalLoan * 0.01) + 363;

  const getRowLoan = (id) => {
    if (id === "loanCosts") return dynamicLoanCosts - parseNum(grid.loanCosts.cash) - parseNum(grid.loanCosts.equity);
    return parseNum(grid[id].loan);
  };

  const totalCash = Object.values(grid).reduce((sum, row) => sum + parseNum(row.cash), 0);
  const totalEquity = Object.values(grid).reduce((sum, row) => sum + parseNum(row.equity), 0);
  const totalCosts = baseCostSum + dynamicLoanCosts;
  const totalLoan = Object.keys(grid).reduce((sum, id) => sum + getRowLoan(id), 0) + parseNum(addLoan);

  const handleOk = () => {
    if (setCashInvested) setCashInvested(Math.round(totalCash).toString());
    if (setEquityInvested) setEquityInvested(Math.round(totalEquity).toString());
    if (setAdditionalLoan) setAdditionalLoan(Math.round(parseNum(addLoan)).toString());
    if (setLoanCosts) setLoanCosts(Math.round(dynamicLoanCosts).toString());
    onClose();
  };

  const rowDefs = [
    { id: "property", label: "Property cost" },
    { id: "renovation", label: "Renovation costs" },
    { id: "purchase", label: "Purchase costs" },
    { id: "furniture", label: "Furniture" },
    { id: "holding", label: "Holding costs" },
  ];

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
        <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[640px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh]">

          <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
            <h2 className="text-[14px] font-bold text-[#1E293B]">Loan Amount</h2>
            <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
          </div>

          <div className="p-4 pt-6 overflow-y-auto">

            {/* THE FIX: mt-2 gives space for the absolute label. overflow-x-auto allows swiping on mobile. */}
            <div className="border border-[#CBD5E1] rounded-[6px] bg-white relative mt-2">

              {/* The Label: Now it can safely sit on top of the border without being hidden */}
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#1E293B] whitespace-nowrap z-10">
                At {new Date().getFullYear()}
              </span>
              <div className="overflow-x-auto md:overflow-x-visible p-4 pt-6">
                {/* 3. Table Wrapper: Forces the width for the scroll to work */}
                <div className="min-w-[560px]">
                  <div className="flex items-center mb-2 pb-1 border-b border-[#F1F5F9] text-[11px] font-bold text-[#64748B]">
                    <div className="w-[95px] text-center">Cash Invested</div>
                    <div className="w-[95px] text-center">Equity Invested*</div>
                    <div className="w-[100px] text-center">Loan</div>
                    <div className="w-[100px] text-center">Costs</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {rowDefs.map(row => (
                    <div key={row.id} className="flex items-center">
                      <div className="w-[140px] pr-2 flex items-center justify-end shrink-0">
                        <span className="text-[13px] text-[#1E293B] text-right leading-tight">{row.label}</span>
                      </div>
                      <div className="w-[95px] px-1 shrink-0">
                        <input
                          type="text"
                          value={grid[row.id].cash}
                          onChange={(e) => handleGridChange(row.id, "cash", e.target.value)}
                          className="w-full border border-[#CBD5E1] rounded-[4px] py-1 px-1.5 text-[13px] text-right text-[#0052CC] bg-white shadow-sm focus:outline-none"
                        />
                      </div>
                      <div className="w-[95px] px-1 shrink-0">
                        <input
                          type="text"
                          value={grid[row.id].equity}
                          onChange={(e) => handleGridChange(row.id, "equity", e.target.value)}
                          className="w-full border border-[#CBD5E1] rounded-[4px] py-1 px-1.5 text-[13px] text-right text-[#1E293B] focus:outline-none"
                        />
                      </div>
                      <div className="w-[100px] px-1 shrink-0">
                        <input
                          type="text"
                          value={grid[row.id].loan}
                          onChange={(e) => handleGridChange(row.id, "loan", e.target.value)}
                          className="w-full border border-[#CBD5E1] rounded-[4px] py-1 px-1.5 text-[13px] text-right text-[#1E293B] focus:outline-none"
                        />
                      </div>
                      <div className="w-[100px] px-2 text-right text-[13px] text-[#1E293B] shrink-0 font-medium">
                        {formatVal(costs[row.id])}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center mt-1">
                    <div className="w-[140px] pr-2 flex items-center justify-end shrink-0">
                      <div className="px-2 py-0.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded text-[11px] font-bold text-[#64748B]">Loan costs</div>
                    </div>
                    <div className="w-[95px] px-1 shrink-0"><input type="text" value={grid.loanCosts.cash} onChange={(e) => handleGridChange("loanCosts", "cash", e.target.value)} className="w-full border border-[#CBD5E1] rounded-[4px] py-1 px-1.5 text-[13px] text-right text-[#0052CC] focus:outline-none" /></div>
                    <div className="w-[95px] px-1 shrink-0"><input type="text" value={grid.loanCosts.equity} onChange={(e) => handleGridChange("loanCosts", "equity", e.target.value)} className="w-full border border-[#CBD5E1] rounded-[4px] py-1 px-1.5 text-[13px] text-right text-[#1E293B] focus:outline-none" /></div>
                    <div className="w-[100px] px-1 text-right text-[13px] text-[#1E293B] shrink-0">{formatVal(getRowLoan("loanCosts"))}</div>
                    <div className="w-[100px] px-2 text-right text-[13px] text-[#1E293B] shrink-0">{formatVal(dynamicLoanCosts)}</div>
                  </div>

                  <div className="flex items-center mt-1">
                    <div className="w-[140px] pr-2 text-[13px] text-[#1E293B] text-right shrink-0">Additional loan</div>
                    <div className="w-[95px] px-1 shrink-0"></div>
                    <div className="w-[95px] px-1 shrink-0"></div>
                    <div className="w-[100px] px-1 shrink-0"><input type="text" value={addLoan} onChange={(e) => setAddLoan(e.target.value.replace(/,/g, ""))} className="w-full border border-[#CBD5E1] rounded-[4px] py-1 px-1.5 text-[13px] text-right text-[#1E293B] focus:outline-none" /></div>
                    <div className="w-[100px] px-2 shrink-0"></div>
                  </div>

                  <div className="flex items-center mt-2 pt-3 border-t-2 border-[#F1F5F9] font-bold">
                    <div className="w-[140px] pr-2 text-[13px] text-[#1E293B] text-right shrink-0 uppercase tracking-tight">Totals</div>
                    <div className="w-[95px] px-2 text-right text-[13px] text-[#1E293B] shrink-0">{formatVal(totalCash)}</div>
                    <div className="w-[95px] px-2 text-right text-[13px] text-[#1E293B] shrink-0">{formatVal(totalEquity)}</div>
                    <div className="w-[100px] px-2 text-right text-[14px] text-[#0052CC] shrink-0">{formatVal(totalLoan)}</div>
                    <div className="w-[100px] px-2 text-right text-[13px] text-[#1E293B] shrink-0">{formatVal(totalCosts)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pl-1 text-[11px] text-[#64748B] italic">
              * To be used where you already have equity in the property
            </div>
          </div>

          <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-2 rounded-b-[8px] shrink-0">
            <button
              onClick={() => setIsLoanTypeOpen(true)}
              className="w-full sm:w-auto px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] shadow-sm font-bold transition-colors"
            >
              Loan Type
            </button>

            <div className="flex gap-2 w-full sm:w-auto justify-center">
              <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-white active:bg-slate-200 shadow-sm">?</button>
              <button onClick={handleOk} className="flex-1 sm:flex-none px-8 py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] shadow-sm">OK</button>
              <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-slate-50 shadow-sm">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <LoanCostsModal
        isOpen={isLoanTypeOpen}
        onClose={() => setIsLoanTypeOpen(false)}
        loanA={loanA}
        setLoanA={setLoanA}
        loanB={loanB}
        setLoanB={setLoanB}
        splitRate={splitRate}
        setSplitRate={setSplitRate}
      />
    </>
    ,
    document.body
  );
}