import React, { useState, useEffect, useMemo } from "react";

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function LoanAmountModal({
  isOpen,
  onClose,
  
  // Costs (Read-only data from the main engine)
  propertyCost = 0,
  renovationCosts = 0,
  purchaseCosts = 0,
  furnitureCosts = 0,
  holdingCosts = 0,
  loanCosts = 0, // This is the incoming prop, but we will calculate our own locally

  // Initial investments from the parent state
  initialCashInvested = 0,
  initialEquityInvested = 0,
  initialAdditionalLoan = 0,

  // Setters to send totals back to the parent
  setCashInvested,
  setEquityInvested,
  setAdditionalLoan,
  setLoanCosts // <-- NEW PROP ADDED HERE
}) {
  
  const [grid, setGrid] = useState({
    property: { cash: "0", equity: "0", loan: "0" },
    renovation: { cash: "0", equity: "0", loan: "0" },
    purchase: { cash: "0", equity: "0", loan: "0" },
    furniture: { cash: "0", equity: "0", loan: "0" },
    holding: { cash: "0", equity: "0", loan: "0" },
    loanCosts: { cash: "0", equity: "0", loan: "0" },
  });

  const [addLoan, setAddLoan] = useState("0");

  // Derived costs array (Static inputs)
  const costs = useMemo(() => ({
    property: parseNum(propertyCost),
    renovation: parseNum(renovationCosts),
    purchase: parseNum(purchaseCosts),
    furniture: parseNum(furnitureCosts),
    holding: parseNum(holdingCosts),
  }), [propertyCost, renovationCosts, purchaseCosts, furnitureCosts, holdingCosts]);

  // Sync initial values when modal opens
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
        loanCosts: { cash: "0", equity: "0", loan: "0" }, // Loan will be auto-calculated below
      });
      setAddLoan(String(parseNum(initialAdditionalLoan)));
    }
  }, [isOpen, initialCashInvested, initialEquityInvested, initialAdditionalLoan, costs]);

  if (!isOpen) return null;

  // Handlers
  const handleGridChange = (rowId, field, val) => {
    const cleanVal = val.replace(/,/g, "");
    if (cleanVal !== "" && !/^-?\d*\.?\d*$/.test(cleanVal)) return;

    const numVal = parseNum(cleanVal);
    
    // We get the cost dynamically to account for the auto-calculating loanCosts row
    const rowCost = rowId === "loanCosts" ? dynamicLoanCosts : costs[rowId];

    setGrid(prev => {
      const row = { ...prev[rowId] };
      row[field] = cleanVal;

      if (field === "cash" || field === "equity") {
        const c = field === "cash" ? numVal : parseNum(row.cash);
        const e = field === "equity" ? numVal : parseNum(row.equity);
        row.loan = String(rowCost - c - e);
      } 
      else if (field === "loan") {
        const l = numVal;
        const e = parseNum(row.equity);
        row.cash = String(rowCost - l - e);
      }

      return { ...prev, [rowId]: row };
    });
  };

  // THE FIX: Dynamic Loan Costs Calculation
  // We must recalculate Loan Costs based on the *current* state of the grid's cash/equity inputs
  const currentCashSum = Object.keys(grid).filter(k => k !== "loanCosts").reduce((sum, k) => sum + parseNum(grid[k].cash), 0);
  const currentEquitySum = Object.keys(grid).filter(k => k !== "loanCosts").reduce((sum, k) => sum + parseNum(grid[k].equity), 0);
  const baseCostSum = Object.values(costs).reduce((sum, c) => sum + c, 0);

  // Algebra: Loan Amount = (Base Costs + 363 + Additional Loan - Total Cash - Total Equity) / 0.99
  const baseRequiredForLoanCost = baseCostSum + 363 + parseNum(addLoan) - currentCashSum - currentEquitySum;
  const dynamicTotalLoan = baseRequiredForLoanCost / 0.99;
  const dynamicLoanCosts = (dynamicTotalLoan * 0.01) + 363;

  // Dynamic Loan Row Value
  const getRowLoan = (id) => {
    if (id === "loanCosts") {
      return dynamicLoanCosts - parseNum(grid.loanCosts.cash) - parseNum(grid.loanCosts.equity);
    }
    return parseNum(grid[id].loan);
  };

  // Totals Calculation
  const totalCash = Object.values(grid).reduce((sum, row) => sum + parseNum(row.cash), 0);
  const totalEquity = Object.values(grid).reduce((sum, row) => sum + parseNum(row.equity), 0);
  const totalCosts = baseCostSum + dynamicLoanCosts;
  
  const baseLoanSum = Object.keys(grid).reduce((sum, id) => sum + getRowLoan(id), 0);
  const totalLoan = baseLoanSum + parseNum(addLoan);

  const handleOk = () => {
    if (setCashInvested) setCashInvested(Math.round(totalCash).toString());
    if (setEquityInvested) setEquityInvested(Math.round(totalEquity).toString());
    if (setAdditionalLoan) setAdditionalLoan(Math.round(parseNum(addLoan)).toString());
    if (setLoanCosts) setLoanCosts(Math.round(dynamicLoanCosts).toString()); // <-- PUSHES NEW LOAN COST BACK!
    onClose();
  };

  const rowDefs = [
    { id: "property", label: "Property cost" },
    { id: "renovation", label: "Renovation costs" },
    { id: "purchase", label: "Purchase costs" },
    { id: "furniture", label: "Furniture" },
    { id: "holding", label: "Holding costs" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Loan Amount</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-4">
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#1E293B]">At {new Date().getFullYear()}</span>
            
            <div className="flex items-center mb-2 pb-1 border-b border-[#F1F5F9]">
              <div className="w-[140px]"></div>
              <div className="w-[90px] text-center text-[12px] text-[#64748B] font-bold">Cash Invested</div>
              <div className="w-[90px] text-center text-[12px] text-[#64748B] font-bold">Equity Invested*</div>
              <div className="w-[100px] text-center text-[12px] text-[#64748B] font-bold">Loan</div>
              <div className="w-[100px] text-center text-[12px] text-[#64748B] font-bold">Costs</div>
            </div>

            <div className="flex flex-col gap-2">
              {/* Static Rows */}
              {rowDefs.map(row => (
                <div key={row.id} className="flex items-center">
                  <div className="w-[140px] pr-2 flex items-center justify-end">
                    <span className="text-[13px] text-[#1E293B]">{row.label}</span>
                  </div>
                  <div className="w-[90px] px-1">
                    <input 
                      type="text" 
                      value={grid[row.id].cash}
                      onChange={(e) => handleGridChange(row.id, "cash", e.target.value)}
                      onBlur={(e) => handleGridChange(row.id, "cash", formatVal(parseNum(e.target.value)))}
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#0052CC] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div className="w-[90px] px-1">
                    <input 
                      type="text" 
                      value={grid[row.id].equity}
                      onChange={(e) => handleGridChange(row.id, "equity", e.target.value)}
                      onBlur={(e) => handleGridChange(row.id, "equity", formatVal(parseNum(e.target.value)))}
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div className="w-[100px] px-1">
                    <input 
                      type="text" 
                      value={grid[row.id].loan}
                      onChange={(e) => handleGridChange(row.id, "loan", e.target.value)}
                      onBlur={(e) => handleGridChange(row.id, "loan", formatVal(parseNum(e.target.value)))}
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div className="w-[100px] px-2 text-right text-[13px] text-[#1E293B]">
                    {formatVal(costs[row.id])}
                  </div>
                </div>
              ))}

              {/* Loan Costs Row (Dynamic) */}
              <div className="flex items-center mt-1">
                <div className="w-[140px] pr-2 flex items-center justify-end">
                  <div className="px-2 py-0.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded text-[12px] text-[#64748B] cursor-default">
                    Loan costs
                  </div>
                </div>
                <div className="w-[90px] px-1">
                  <input 
                    type="text" 
                    value={grid.loanCosts.cash}
                    onChange={(e) => handleGridChange("loanCosts", "cash", e.target.value)}
                    onBlur={(e) => handleGridChange("loanCosts", "cash", formatVal(parseNum(e.target.value)))}
                    className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#0052CC] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div className="w-[90px] px-1">
                  <input 
                    type="text" 
                    value={grid.loanCosts.equity}
                    onChange={(e) => handleGridChange("loanCosts", "equity", e.target.value)}
                    onBlur={(e) => handleGridChange("loanCosts", "equity", formatVal(parseNum(e.target.value)))}
                    className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div className="w-[100px] px-1">
                  <div className="w-full px-1.5 py-1 text-[13px] text-right text-[#1E293B]">
                    {formatVal(getRowLoan("loanCosts"))}
                  </div>
                </div>
                <div className="w-[100px] px-2 text-right text-[13px] text-[#1E293B]">
                  {formatVal(dynamicLoanCosts)}
                </div>
              </div>

              {/* Additional Loan Row */}
              <div className="flex items-center mt-1">
                <div className="w-[140px] pr-2 text-[13px] text-[#1E293B] text-right">Additional loan</div>
                <div className="w-[90px] px-1"></div>
                <div className="w-[90px] px-1"></div>
                <div className="w-[100px] px-1">
                  <input 
                    type="text" 
                    value={addLoan}
                    onChange={(e) => setAddLoan(e.target.value.replace(/,/g, ""))}
                    onBlur={(e) => setAddLoan(formatVal(parseNum(e.target.value)))}
                    className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div className="w-[100px] px-2"></div>
              </div>

              {/* Totals Row */}
              <div className="flex items-center mt-2 pt-3 border-t border-[#CBD5E1]">
                <div className="w-[140px] pr-2 text-[13px] font-bold text-[#1E293B] text-right">Totals</div>
                <div className="w-[90px] px-2 text-right text-[13px] font-medium text-[#1E293B]">{formatVal(totalCash)}</div>
                <div className="w-[90px] px-2 text-right text-[13px] font-medium text-[#1E293B]">{formatVal(totalEquity)}</div>
                <div className="w-[100px] px-2 text-right text-[14px] font-bold text-[#1E293B]">{formatVal(totalLoan)}</div>
                <div className="w-[100px] px-2 text-right text-[13px] font-medium text-[#1E293B]">{formatVal(totalCosts)}</div>
              </div>

            </div>
          </div>
          
          <div className="mt-3 pl-3 text-[11px] text-[#64748B]">
            * To be used where you already have equity in the property
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <button className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
            Loan Type
          </button>
          
          <div className="flex gap-2">
             <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">?</button>
             <button onClick={handleOk} className="px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
             <button onClick={onClose} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>
  );
}