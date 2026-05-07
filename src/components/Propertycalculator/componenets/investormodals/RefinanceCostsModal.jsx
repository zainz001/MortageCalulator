import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";

// Helper functions
const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function RefinanceCostsModal({ isOpen, onClose, onSave, currentLoanAmount }) {
  const [costs, setCosts] = useState([
    { id: 1, label: "Establishment fees", pct: "1.00", amt: "6,300", flat: false },
    { id: 2, label: "Mortgagee stamp duty", pct: "0.00", amt: "0", flat: false },
    { id: 3, label: "Mortgage insurance", pct: "0.00", amt: "0", flat: false },
    { id: 4, label: "Mortgagee's solicitor's fees", pct: "0.00", amt: "0", flat: true },
    { id: 5, label: "Valuation fees", pct: "0.04", amt: "250", flat: true },
    { id: 6, label: "Registration of mortgage", pct: "0.01", amt: "46", flat: true },
    { id: 7, label: "Other loan costs", pct: "0.00", amt: "0", flat: true }
  ]);

  const [applyToLoan, setApplyToLoan] = useState(false);

  // Totals state
  const [totalPct, setTotalPct] = useState("0.00");
  const [totalCost, setTotalCost] = useState("0");

  const baseLoanAmount = parseNum(currentLoanAmount || "630,000");

  // Advanced Math: Calculates the GROSS loan (Base + Capitalized Costs)
  const recalculateAll = useCallback((currentCosts) => {
    const flatFeesSum = currentCosts.filter(c => c.flat).reduce((acc, c) => acc + parseNum(c.amt), 0);
    const pctSum = currentCosts.filter(c => !c.flat).reduce((acc, c) => acc + parseNum(c.pct), 0);

    let grossLoan = baseLoanAmount;
    if (pctSum < 100) {
      grossLoan = (baseLoanAmount + flatFeesSum) / (1 - pctSum / 100);
    }

    return currentCosts.map(c => {
      if (!c.flat) {
        // Percentage fee: derive amount from gross loan
        return { ...c, amt: formatVal(grossLoan * (parseNum(c.pct) / 100)) };
      } else {
        // Flat fee: derive representation percentage from base loan
        return { ...c, pct: baseLoanAmount > 0 ? ((parseNum(c.amt) / baseLoanAmount) * 100).toFixed(2) : "0.00" };
      }
    });
  }, [baseLoanAmount]);

  // Recalculate on open
  useEffect(() => {
    if (isOpen) {
      setApplyToLoan(false); // Reset checkbox on open
      setCosts(prev => recalculateAll(prev));
    }
  }, [isOpen, recalculateAll]);

  // Update display totals anytime costs change
  useEffect(() => {
    let sumPct = 0;
    let sumCost = 0;
    costs.forEach(c => {
      sumPct += parseNum(c.pct);
      sumCost += parseNum(c.amt);
    });
    setTotalPct(sumPct.toFixed(2));
    setTotalCost(formatVal(sumCost));
  }, [costs]);

  if (!isOpen) return null;

  const handlePctChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9.,]/g, '');
    let newCosts = [...costs];
    newCosts[index].pct = cleanVal;
    setCosts(recalculateAll(newCosts));
  };

  const handleAmtChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9.,]/g, '');
    let newCosts = [...costs];
    newCosts[index].amt = formatVal(parseNum(cleanVal));

    if (!newCosts[index].flat) {
       const flatFeesSum = newCosts.filter(c => c.flat).reduce((acc, c) => acc + parseNum(c.amt), 0);
       const pctSumOther = newCosts.filter((c, i) => !c.flat && i !== index).reduce((acc, c) => acc + parseNum(c.pct), 0);

       const numVal = parseNum(cleanVal);
       const impliedGross = (baseLoanAmount + flatFeesSum + numVal) / (1 - pctSumOther / 100);
       const impliedPct = impliedGross > 0 ? (numVal / impliedGross) * 100 : 0;
       newCosts[index].pct = impliedPct.toFixed(2);
    }

    setCosts(recalculateAll(newCosts));
  };

  const handleLabelChange = (index, value) => {
    const newCosts = [...costs];
    newCosts[index].label = value;
    setCosts(newCosts);
  };

  const handleCheckboxChange = (index) => {
    let newCosts = [...costs];
    newCosts[index].flat = !newCosts[index].flat;
    setCosts(recalculateAll(newCosts));
  };

  const handleOk = () => {
    if (onSave) {
      onSave(totalCost.replace(/,/g, ''), applyToLoan);
    }
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden transition-all">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Home Loan Refinance Costs</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-6 bg-white flex flex-col gap-4">

          <div className="grid grid-cols-[2fr_0.8fr_1fr_0.6fr] gap-3 text-[12px] font-medium text-[#1E293B] items-end px-1">
            <div>Cost Component</div>
            <div className="text-right">%. of Loan</div>
            <div className="text-right pr-2">Cost ($)</div>
            <div className="text-center">Flat Fee</div>
          </div>

          <div className="flex flex-col gap-2">
            {costs.map((cost, idx) => (
              <div key={cost.id} className="grid grid-cols-[2fr_0.8fr_1fr_0.6fr] gap-3 items-center">
                <input
                  type="text"
                  value={cost.label}
                  onChange={(e) => handleLabelChange(idx, e.target.value)}
                  className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                />

                <div className="relative">
                  <input
                    type="text"
                    value={cost.pct}
                    onChange={(e) => handlePctChange(idx, e.target.value)}
                    className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right pr-4 shadow-sm focus:outline-none focus:border-[#0052CC] ${cost.flat ? 'bg-gray-50 text-gray-500' : 'bg-[#EFF6FF] text-[#0052CC] font-medium'}`}
                    readOnly={cost.flat}
                  />
                  <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
                </div>

                <input
                  type="text"
                  value={cost.amt}
                  onChange={(e) => handleAmtChange(idx, e.target.value)}
                  className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                />

                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={cost.flat}
                    onChange={() => handleCheckboxChange(idx)}
                    className="w-4 h-4 text-[#0052CC] border-[#CBD5E1] rounded focus:ring-[#0052CC] cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[2fr_0.8fr_1fr_0.6fr] gap-3 items-center mt-2 pt-4 border-t border-[#E2E8F0]">
            <div className="text-[13px] text-[#1E293B]">Total costs</div>
            <div className="text-[13px] text-[#1E293B] text-right pr-2">{totalPct}%</div>
            <div className="text-[14px] font-bold text-[#1E293B] text-right pr-2">{totalCost}</div>
            <div></div>
          </div>

          <div className="grid grid-cols-[2fr_0.8fr_1fr_0.6fr] gap-3 items-center mt-1">
            <div className="text-[13px] text-[#1E293B]">Total loan</div>
            <div></div>
            {/* FIX: Dynamically update this value based on the applyToLoan checkbox */}
            <div className="text-[14px] font-bold text-[#1E293B] text-right pr-2">
              {formatVal(baseLoanAmount + (applyToLoan ? parseNum(totalCost) : 0))}
            </div>
            <div></div>
          </div>

          <div className="flex justify-between items-end mt-4">

            <div className="border border-[#CBD5E1] rounded-[6px] p-4 relative min-w-[150px]">
              <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[12px] font-bold text-[#64748B]">Refinance costs</span>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={applyToLoan}
                  onChange={() => setApplyToLoan(!applyToLoan)}
                  className="w-4 h-4 text-[#0052CC] border-[#CBD5E1] rounded focus:ring-[#0052CC]"
                />
                <span className="text-[13px] text-[#1E293B]">Apply to loan</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] shadow-sm">?</button>
              <button onClick={handleOk} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>
              <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
