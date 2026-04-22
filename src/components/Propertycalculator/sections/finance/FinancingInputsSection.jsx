import React from "react";
import InputField from "../../../inputField";
import SelectField from "../../../SelectField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function FinancingInputsSection({
  cashInvested, setCashInvested,
  equityInvested, setEquityInvested,
  loanCosts, setLoanCosts,
  interestRate, setInterestRate,
  loanType, setLoanType,
  additionalLoan, setAdditionalLoan,
  loanError,
  setIsModalOpen
}) {
  return (
    <CollapsibleSection title="2. Financing Inputs">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[12px] text-[#0052CC] font-bold hover:underline"
        >
          View loan breakdown →
        </button>
      </div>
      <InputField
        label="Cash invested (deposit)"
        prefix="$"
        value={cashInvested}
        onChange={setCashInvested}
        error={loanError}
      />
      <InputField
        label="Equity invested"
        prefix="$"
        value={equityInvested}
        onChange={setEquityInvested}
        tooltip="Existing equity leveraged from another property."
      />
      <InputField
        label="Loan costs"
        prefix="$"
        value={loanCosts}
        onChange={setLoanCosts}
        placeholder="Auto-calculated"
        tooltip="Establishment fees, broker, valuation. Auto-calculated if blank."
      />
      <InputField
        label="Interest rate (p.a.)"
        suffix="%"
        value={interestRate}
        onChange={setInterestRate}
        tooltip="Blended rate across fixed/floating tranches. Interest-only basis."
      />
      <SelectField
        label="Loan type"
        value={loanType}
        onChange={setLoanType}
        options={[
          { label: "Interest only", value: "Interest only" },
          { label: "Principal & Interest", value: "P+I" },
        ]}
      />
      <InputField
        label="Additional loan"
        prefix="$"
        value={additionalLoan}
        onChange={setAdditionalLoan}
        tooltip="Renovation drawdown or top-up facility."
      />
    </CollapsibleSection>
  );
}