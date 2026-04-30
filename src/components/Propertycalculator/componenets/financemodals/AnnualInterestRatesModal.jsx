import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function AnnualInterestRatesModal({
  isOpen,
  onClose,
  loanA,
  loanB,
  splitRate,
  setLoanA,
  setLoanB
}) {
  const [ratesA, setRatesA] = useState(["", "", "", "", ""]);
  const [ratesB, setRatesB] = useState(["", "", "", "", ""]);

  useEffect(() => {
    if (isOpen) {
      setRatesA(loanA.rates.map(r => Number(r || 0).toFixed(2)));
      setRatesB(loanB.rates.map(r => Number(r || 0).toFixed(2)));
    }
  }, [isOpen, loanA.rates, loanB.rates]);

  if (!isOpen) return null;

  // --- THE FIX: Cascading Update Logic ---
  // When you change a rate, it updates that year AND all subsequent years.
  const handleRateChange = (tranche, index, val) => {
    const cleanVal = val.replace(/,/g, "");
    if (cleanVal !== "" && !/^-?\d*\.?\d*$/.test(cleanVal)) return;

    if (tranche === "A") {
      const newRates = [...ratesA];
      // Loop from the changed index to the end of the array (year 5)
      for (let i = index; i < 5; i++) {
        newRates[i] = cleanVal;
      }
      setRatesA(newRates);
    } else {
      const newRates = [...ratesB];
      for (let i = index; i < 5; i++) {
        newRates[i] = cleanVal;
      }
      setRatesB(newRates);
    }
  };

  // --- THE FIX: Cascading Formatting Logic ---
  const handleRateBlur = (tranche, index, val) => {
    const num = parseNum(val);
    const formattedVal = num.toFixed(2); 
    
    if (tranche === "A") {
      const newRates = [...ratesA];
      for (let i = index; i < 5; i++) {
        newRates[i] = formattedVal;
      }
      setRatesA(newRates);
    } else {
      const newRates = [...ratesB];
      for (let i = index; i < 5; i++) {
        newRates[i] = formattedVal;
      }
      setRatesB(newRates);
    }
  };

  const handleOk = () => {
    if (setLoanA) setLoanA(prev => ({ ...prev, rates: ratesA }));
    if (setLoanB) setLoanB(prev => ({ ...prev, rates: ratesB }));
    onClose();
  };

  const calcYear = (loanData, rateStr) => {
    const L = parseNum(loanData.amount);
    const R = parseNum(rateStr) / 100;
    const type = loanData.type;

    const prefix = type.toLowerCase();
    const startYr = parseNum(loanData[`${prefix}From`]) || 1;
    const endYr = parseNum(loanData[`${prefix}To`]) || 40;
    const years = endYr - startYr + 1;

    if (L === 0 || isNaN(L) || years <= 0) return { interest: 0, payment: 0 };

    if (type === "IO") return { interest: L * R, payment: L * R };
    if (type === "CAP") return { interest: L * (Math.pow(1 + R / 12, 12) - 1), payment: 0 };
    
    if (type === "PI") {
      if (R === 0) return { interest: 0, payment: L / years };
      const M = R / 12;
      const n = years * 12;
      const monthlyPmt = (L * M) / (1 - Math.pow(1 + M, -n));
      const annualPmt = monthlyPmt * 12;
      
      let balance = L;
      let intTotal = 0;
      for (let i = 0; i < 12; i++) {
        const intMonth = balance * M;
        intTotal += intMonth;
        balance -= (monthlyPmt - intMonth);
      }
      return { interest: intTotal, payment: annualPmt };
    }

    if (type === "CL") {
      if (R === 0) return { interest: 0, payment: L / years };
      const annualPmt = L * (R + 0.0219676); 
      const monthlyPmt = annualPmt / 12;
      const M = R / 12;
      
      let balance = L;
      let intTotal = 0;
      for (let i = 0; i < 12; i++) {
        const intMonth = balance * M;
        intTotal += intMonth;
        balance -= (monthlyPmt - intMonth);
      }
      return { interest: intTotal, payment: annualPmt };
    }

    return { interest: 0, payment: 0 };
  };

  const TrancheRow = ({ title, loanData, rates, isDisabled }) => {
    const trancheId = title.charAt(title.length-1);
    
    return (
      <div className={`mb-4 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
        <h3 className="font-bold text-[#1E293B] text-[13px] mb-2">{title}</h3>
        
        {/* Rates Row */}
        <div className="flex gap-4 items-center mb-1">
          <div className="w-[60px] text-right text-[12px] text-[#4A5568]">Rates</div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 relative">
              <input 
                type="text" 
                value={rates[i]}
                onChange={(e) => handleRateChange(trancheId, i, e.target.value)}
                onBlur={(e) => handleRateBlur(trancheId, i, e.target.value)}
                disabled={isDisabled}
                className={`w-full border border-[#CBD5E1] rounded-[3px] py-0.5 px-1 text-[12px] text-right focus:outline-none focus:border-[#0052CC] ${isDisabled ? "bg-[#F1F5F9]" : "bg-white text-[#0052CC]"}`}
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-[#64748B]">%</span>
            </div>
          ))}
        </div>

        {/* Interest Row */}
        <div className="flex gap-4 items-center mb-1">
          <div className="w-[60px] text-right text-[12px] text-[#4A5568]">Interest</div>
          {[0, 1, 2, 3, 4].map(i => {
            const { interest } = calcYear(loanData, rates[i]);
            return <div key={i} className="flex-1 text-right text-[12px] text-[#1E293B]">{isDisabled ? "" : formatVal(interest)}</div>
          })}
        </div>

        {/* Principal Row */}
        <div className="flex gap-4 items-center">
          <div className="w-[60px] text-right text-[12px] text-[#4A5568]">Principal</div>
          {[0, 1, 2, 3, 4].map(i => {
            const { interest, payment } = calcYear(loanData, rates[i]);
            const principal = payment > 0 ? payment - interest : 0;
            return <div key={i} className="flex-1 text-right text-[12px] text-[#1E293B]">{isDisabled ? "" : (principal > 0 ? formatVal(principal) : "")}</div>
          })}
        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Annual Interest Rates</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-4 pt-2">
          
          {/* Header Row */}
          <div className="flex gap-4 mb-2 border-b border-[#E2E8F0] pb-2">
            <div className="w-[60px] text-left text-[12px] text-[#4A5568] font-bold">Year</div>
            {[1, 2, 3, 4, 5].map(yr => (
              <div key={yr} className="flex-1 text-center">
                <div className="text-[12px] text-[#64748B]">{yr}yr</div>
                <div className="text-[12px] font-medium text-[#1E293B] mt-1">{formatVal(parseNum(loanA.amount) + (splitRate ? parseNum(loanB.amount) : 0))}</div>
              </div>
            ))}
          </div>

          <TrancheRow title="Loan A" loanData={loanA} rates={ratesA} isDisabled={false} />
          <TrancheRow title="Loan B" loanData={loanB} rates={ratesB} isDisabled={!splitRate} />

          {/* Totals Section */}
          <div className="mt-4 pt-3 border-t border-[#CBD5E1]">
            
            <div className="flex gap-4 items-center mb-1">
              <div className="w-[60px] text-right text-[12px] font-bold text-[#1E293B]">Totals</div>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex-1 text-center text-[12px] font-bold text-[#1E293B]">
                  {formatVal(parseNum(loanA.amount) + (splitRate ? parseNum(loanB.amount) : 0))}
                </div>
              ))}
            </div>

            <div className="flex gap-4 items-center mb-1">
              <div className="w-[60px] text-right text-[12px] text-[#4A5568]">Interest</div>
              {[0, 1, 2, 3, 4].map(i => {
                const intA = calcYear(loanA, ratesA[i]).interest;
                const intB = splitRate ? calcYear(loanB, ratesB[i]).interest : 0;
                return <div key={i} className="flex-1 text-center text-[12px] text-[#1E293B]">{formatVal(intA + intB)}</div>
              })}
            </div>

            <div className="flex gap-4 items-center mb-2">
              <div className="w-[60px] text-right text-[12px] text-[#4A5568]">Payment</div>
              {[0, 1, 2, 3, 4].map(i => {
                const pmtA = calcYear(loanA, ratesA[i]).payment;
                const pmtB = splitRate ? calcYear(loanB, ratesB[i]).payment : 0;
                return <div key={i} className="flex-1 text-center text-[12px] text-[#1E293B]">{formatVal(pmtA + pmtB)}</div>
              })}
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-[60px] text-right text-[12px] text-[#4A5568] leading-tight">Average rate</div>
              {[0, 1, 2, 3, 4].map(i => {
                const L_A = parseNum(loanA.amount);
                const L_B = splitRate ? parseNum(loanB.amount) : 0;
                const R_A = parseNum(ratesA[i]);
                const R_B = splitRate ? parseNum(ratesB[i]) : 0;
                const totalL = L_A + L_B;
                const blended = totalL > 0 ? ((L_A * R_A) + (L_B * R_B)) / totalL : 0;
                
                return (
                  <div key={i} className="flex-1">
                     <div className="border border-[#CBD5E1] bg-[#F1F5F9] rounded-[3px] py-0.5 px-1 text-[12px] text-center text-[#1E293B]">
                        {blended.toFixed(2)}%
                     </div>
                  </div>
                )
              })}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <div className="flex gap-1">
             <button className="px-3 py-1 border border-[#CBD5E1] bg-white rounded-[3px] text-[12px] text-[#1E293B] shadow-sm">&lt;&lt;</button>
             <button className="px-3 py-1 border border-[#CBD5E1] bg-white rounded-[3px] text-[12px] text-[#1E293B] shadow-sm">&lt;</button>
             <button className="px-3 py-1 border border-[#CBD5E1] bg-white rounded-[3px] text-[12px] text-[#1E293B] shadow-sm">&gt;</button>
             <button className="px-3 py-1 border border-[#CBD5E1] bg-white rounded-[3px] text-[12px] text-[#1E293B] shadow-sm">&gt;&gt;</button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleOk} className="px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] shadow-sm">OK</button>
            <button onClick={onClose} className="px-5 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}