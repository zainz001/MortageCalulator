import React from "react";
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
  loanType, setLoanType,
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

  // 1. Base Variables
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

  // 2. Auto-Calculate formula for Loan Costs
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

  const loanRepayments = loanAmount * (ir / 100);

  const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

  // 3. Reverse Math Handlers 
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

  return (
    <CollapsibleSection title="2. Financing Inputs">

      {/* 1. Loan Amount */}
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

      {/* 2. Cash Invested */}
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

      {/* 3. Amount Required */}
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
          onClick={() => setIsModalOpen("loanAmount")} // Usually Amount Required shares the Loan Amount breakdown modal
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <SelectField
        label="Loan type"
        value={loanType}
        onChange={setLoanType}
        options={[
          { label: "Interest only", value: "Interest only" },
          { label: "Principal & Interest", value: "P+I" },
        ]}
      />

      {/* 4. Interest Rate */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Interest rate (p.a.)"
            suffix="%"
            value={interestRate}
            onChange={setInterestRate}
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

      {/* 5. Loan Repayments */}
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
          onClick={() => setIsModalOpen("loanRepayments")} // Might need a specific modal later, for now we can just leave the button
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      {/* 6. Loan Costs */}
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
          onClick={() => setIsModalOpen("loanCosts")} // Usually Loan Costs shares the Loan Amount breakdown modal
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