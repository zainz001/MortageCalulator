import React from "react";
import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function InvestorSection({
  investorDetails, setInvestorDetails,
  jointWorkIncome, setJointWorkIncome,
  jointWorkDeductions, setJointWorkDeductions,
  principalResidence, setPrincipalResidence,
  amountOwing, setAmountOwing,
  homeLoanRepayments, setHomeLoanRepayments,
  livingExpenses, setLivingExpenses,
  portfolioProperties, setPortfolioProperties,
  portfolioValue, setPortfolioValue,
  taxableIncomeSingle, setTaxableIncomeSingle,
  setActiveModal
}) {

  // Dynamically change labels based on current Investor Type
  const isPerson = investorDetails === "Person(s)" || !investorDetails;
  
  const incomeLabel = isPerson ? "Joint Work Income" : `${investorDetails} Income`;
  const deductionLabel = isPerson ? "Joint Work Deductions" : `${investorDetails} Deductions`;
  const taxableLabel = isPerson ? "Taxable Income (Single)" : `Taxable Income (${investorDetails})`;

  return (
    <CollapsibleSection title="3. Investor">
      
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Investor Details"
            value={investorDetails}
            onChange={setInvestorDetails}
            tooltip="e.g., Person(s), Super Fund, Company"
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("investorDetails")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label={incomeLabel}
            prefix="$"
            value={jointWorkIncome}
            onChange={setJointWorkIncome}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("jointWorkIncome")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label={deductionLabel}
            prefix="$"
            value={jointWorkDeductions}
            onChange={setJointWorkDeductions}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("jointWorkDeductions")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Principal Residence"
            prefix="$"
            value={principalResidence}
            onChange={setPrincipalResidence}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("principalResidence")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Amount Owing"
            prefix="$"
            value={amountOwing}
            onChange={setAmountOwing}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("amountOwing")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Home Loan Repayments"
            prefix="$"
            value={homeLoanRepayments}
            onChange={setHomeLoanRepayments}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("homeLoanRepayments")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Living Expenses"
            prefix="$"
            value={livingExpenses}
            onChange={setLivingExpenses}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("livingExpenses")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Portfolio Properties"
            value={portfolioProperties}
            onChange={setPortfolioProperties}
            tooltip="Number of existing properties in the portfolio"
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("portfolioProperties")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Portfolio Value"
            prefix="$"
            value={portfolioValue}
            onChange={setPortfolioValue}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("portfolioValue")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label={taxableLabel}
            prefix="$"
            value={taxableIncomeSingle}
            onChange={setTaxableIncomeSingle}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("taxableIncomeSingle")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

    </CollapsibleSection>
  );
}