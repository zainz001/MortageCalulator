import React from "react";
import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function WhatIfSection({
  inflationRate, setInflationRate,
  rentalIncomeRate, setRentalIncomeRate,
  rentalExpenseRate, setRentalExpenseRate,
  taxableIncomeRate, setTaxableIncomeRate,
  livingExpensesRate, setLivingExpensesRate,
  capitalGrowthRate, setCapitalGrowthRate,
  setActiveModal
}) {
  return (
    <CollapsibleSection title="4. What If?">
      
      <div className="flex flex-col gap-2">
        
        <div className="flex items-end gap-2 w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label="Inflation Rate (CPI)"
              suffix="%"
              value={inflationRate}
              onChange={setInflationRate}
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("inflationRate")}
            className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
          >
            Edit ↗
          </button>
        </div>

        {/* Rental Income Rate */}
        <div className="flex items-end gap-2 w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label="Rental Income Rate"
              suffix="%"
              value={rentalIncomeRate}
              onChange={setRentalIncomeRate}
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("rentalIncomeRate")}
            className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
          >
            Edit ↗
          </button>
        </div>

        {/* Rental Expense Rate */}
        <div className="flex items-end gap-2 w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label="Rental Expense Rate"
              suffix="%"
              value={rentalExpenseRate}
              onChange={setRentalExpenseRate}
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("rentalExpenseRate")}
            className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
          >
            Edit ↗
          </button>
        </div>

        {/* Taxable Income Rate */}
        <div className="flex items-end gap-2 w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label="Taxable Income Rate"
              suffix="%"
              value={taxableIncomeRate}
              onChange={setTaxableIncomeRate}
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("taxableIncomeRate")}
            className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
          >
            Edit ↗
          </button>
        </div>

        {/* Living Expenses Rate */}
        <div className="flex items-end gap-2 w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label="Living Expenses Rate"
              suffix="%"
              value={livingExpensesRate}
              onChange={setLivingExpensesRate}
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("livingExpensesRate")}
            className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
          >
            Edit ↗
          </button>
        </div>

        {/* Capital Growth Rate */}
        <div className="flex items-end gap-2 w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label="Capital Growth Rate"
              suffix="%"
              value={capitalGrowthRate}
              onChange={setCapitalGrowthRate}
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("capitalGrowthRate")}
            className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
          >
            Edit ↗
          </button>
        </div>
        
        {/* Checkbox */}
        <div className="mt-2 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="useNewDefaults" 
            className="w-3.5 h-3.5 accent-[#0052CC] cursor-pointer"
          />
          <label htmlFor="useNewDefaults" className="text-[12px] text-[#64748B] cursor-pointer">
            Use these values as the new defaults
          </label>
        </div>

      </div>

    </CollapsibleSection>
  );
}