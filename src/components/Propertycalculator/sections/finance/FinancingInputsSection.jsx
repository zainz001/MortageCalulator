import React, { useEffect } from "react";
import InputField from "../../../inputField";
import SelectField from "../../../SelectField";
import CollapsibleSection from "../../../CollapsibleSection";

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

export default function FinancingInputsSection({
  cashInvested, setCashInvested,
  equityInvested, setEquityInvested,
  loanCosts, setLoanCosts,
  
  interestRate, setInterestRate, 
  
  loanA, 
  loanB,
  setLoanA, 
  
  additionalLoan, setAdditionalLoan,
  taxWriteOffPeriod, setTaxWriteOffPeriod,
  loanError,

  isModalOpen,
  setIsModalOpen,

  propertyValue = 0,
  purchaseCosts = 0,
  renovationCosts = 0,
  furnitureCosts = 0,
  holdingCosts = 0
}) {

  const pv = parseNum(propertyValue);
  const rc = parseNum(renovationCosts);
  const pc = purchaseCosts && String(purchaseCosts).trim() !== "" ? parseNum(purchaseCosts) : (pv * 0.005);
  const ci = parseNum(cashInvested);
  const ei = parseNum(equityInvested);
  const addLoan = parseNum(additionalLoan);
  const ir = parseNum(interestRate);

  let loanAmount = 0;
  let lc = 0;
  let amountRequired = 0;

  const isLcAuto = !loanCosts || String(loanCosts).trim() === "";

  if (isLcAuto) {
    const baseRequired = pv + pc + rc + 363 + addLoan - ci - ei;
    loanAmount = baseRequired / 0.99;
    lc = (loanAmount * 0.01) + 363;
    amountRequired = pv + pc + lc + rc;
  } else {
    lc = parseNum(loanCosts);
    amountRequired = pv + pc + lc + rc;
    loanAmount = amountRequired + addLoan - ci - ei;
  }

  // =========================================================================
  // THE FIX: Actively sync the calculated loan amount to the Loan A object!
  // =========================================================================
  useEffect(() => {
    if (setLoanA && loanA && (!loanB || parseNum(loanB.amount) === 0)) {
      setLoanA(prev => {
        const roundedAmount = String(Math.round(loanAmount));
        // Only update if it actually changed to prevent infinite render loops
        if (prev.amount !== roundedAmount) {
          return { ...prev, amount: roundedAmount };
        }
        return prev;
      });
    }
  }, [loanAmount, setLoanA, loanB, loanA]);
  // =========================================================================

  const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

  // --- MATH ENGINE ---
  const calcTranchePayment = (loanData) => {
    if (!loanData || !loanData.amount) return 0; 
    
    const L = parseNum(loanData.amount); // Now pulls the perfectly synced amount!
    const R = parseNum(loanData.rates ? loanData.rates[0] : 0) / 100;
    const type = loanData.type || "IO";
    
    const prefix = type.toLowerCase();
    const startYr = parseNum(loanData[`${prefix}From`]) || 1;
    const endYr = parseNum(loanData[`${prefix}To`]) || 40;
    const years = endYr - startYr + 1;

    if (L === 0 || isNaN(L) || years <= 0) return 0;
    if (type === "IO") return L * R;
    if (type === "CAP") return 0; 
    
    if (type === "PI") {
      if (R === 0) return L / years;
      const M = R / 12;
      const n = years * 12;
      const monthlyPmt = (L * M) / (1 - Math.pow(1 + M, -n));
      return monthlyPmt * 12;
    }

    if (type === "CL") {
      if (R === 0) return L / years;
      const annualPmt = L * (R + 0.0219676); 
      return annualPmt;
    }
    return 0;
  };

  const loanRepayments = calcTranchePayment(loanA) + calcTranchePayment(loanB);

  // --- EVENT HANDLERS ---
  const handleAmountRequiredChange = (val) => {
    const newAmount = parseNum(val);
    const newLc = newAmount - pv - pc - rc;
    setLoanCosts(Math.round(newLc).toString());
  };

  const handleLoanAmountChange = (val) => {
    const newLoan = parseNum(val);
    const newCi = amountRequired + addLoan - ei - newLoan;
    setCashInvested(Math.round(newCi).toString());
  };

  const handleLoanRepaymentsChange = (val) => {
    const newRepay = parseNum(val);
    const newLoan = ir > 0 ? newRepay / (ir / 100) : 0;
    const newCi = amountRequired + addLoan - ei - newLoan;
    setCashInvested(Math.round(newCi).toString());
  };

  const handleInterestRateChange = (val) => {
    setInterestRate(val);
    if (setLoanA) {
      setLoanA(prev => ({
        ...prev,
        rates: Array(5).fill(val) 
      }));
    }
  };

  const handleTypeChange = (newType) => {
    if (setLoanA) {
      const prefix = newType.toLowerCase(); 
      let toVal = "40";
      if (newType === "PI") toVal = "25"; 
      
      setLoanA(prev => ({ 
        ...prev, 
        type: newType,
        [`${prefix}From`]: prev[`${prefix}From`] || "1",
        [`${prefix}To`]: prev[`${prefix}To`] || toVal
      }));
    }
  };

  return (
    <CollapsibleSection title="2. Financing Inputs">

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Loan Amount"
            prefix="$"
            value={formatVal(loanAmount)}
            onChange={handleLoanAmountChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("loanAmount")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Cash invested (deposit)"
            prefix="$"
            value={cashInvested}
            onChange={setCashInvested}
            error={loanError}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("loanAmount")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Amount Required"
            prefix="$"
            value={formatVal(amountRequired)}
            onChange={handleAmountRequiredChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("loanAmount")} 
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <SelectField
            label="Loan type"
            value={loanA?.type || "IO"} 
            onChange={handleTypeChange}
            options={[
              { label: "Interest only", value: "IO" },
              { label: "Principal & Interest", value: "PI" },
              { label: "Capitalise Interest", value: "CAP" },
              { label: "Credit Line", value: "CL" },
            ]}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("interestRate")} 
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Interest rate (p.a.)"
            suffix="%"
            value={interestRate}
            onChange={handleInterestRateChange} 
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("interestRate")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Loan Repayments"
            prefix="$"
            value={formatVal(loanRepayments)}
            onChange={handleLoanRepaymentsChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("interestRate")} 
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Loan costs"
            prefix="$"
            value={isLcAuto ? Math.round(lc) : loanCosts}
            onChange={setLoanCosts}
            placeholder={`Auto: $${Math.round(lc).toLocaleString("en-NZ")}`}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen("loanCosts")} 
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <InputField
        label="Tax Write-Off Period"
        suffix="yr"
        value={taxWriteOffPeriod}
        onChange={setTaxWriteOffPeriod}
      />

    </CollapsibleSection>
  );
}