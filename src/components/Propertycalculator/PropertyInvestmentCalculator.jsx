import React from "react";
import { fmt, fmtPct } from "../../utils/calculatorUtils";
import { useCalculator } from "../../hooks/useCalculator";
import { useModalManager } from "../../hooks/useModalManager";
import CalculatorModals from "./CalculatorModals";

import PropertyDetailsSection from "./sections/property/PropertyDetailsSection";
import FinancingInputsSection from "./sections/finance/FinancingInputsSection";
import WhatIfSection from "./sections/whatif/WhatIfSection";

export default function PropertyInvestmentCalculator() {
  const calc = useCalculator();
  const modals = useModalManager();

  const m = calc.result?.metrics;
  const { inputs, updateInput } = calc;

  return (
    <div className="min-h-screen bg-white flex justify-center p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] w-full">

        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-[24px] font-bold text-[#0052CC]"></h2>
          <button
            onClick={calc.handleReset}
            className="text-[#64748B] text-[13px] font-bold hover:text-[#0052CC] transition-colors underline"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          <div className="w-full lg:w-[420px] flex-shrink-0 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col border border-[#E2E8F0]">
            <h3 className="text-[15px] font-bold text-[#23303B] mb-6 leading-snug">
              Model investment property performance over 10 years.
            </h3>

            <div className="flex-1 overflow-y-auto pr-1">
              <PropertyDetailsSection
                propertyAddress={inputs.propertyAddress} setPropertyAddress={(v) => updateInput("propertyAddress", v)}
                propertyDescription={inputs.propertyDescription} setPropertyDescription={(v) => updateInput("propertyDescription", v)}
                propertyValue={inputs.propertyValue} setPropertyValue={(v) => updateInput("propertyValue", v)}
                purchaseCosts={inputs.purchaseCosts} setPurchaseCosts={(v) => updateInput("purchaseCosts", v)}
                grossRentWeekly={inputs.grossRentWeekly} setGrossRentWeekly={(v) => updateInput("grossRentWeekly", v)}
                rentalExpensesPercent={inputs.rentalExpensesPercent} setRentalExpensesPercent={(v) => updateInput("rentalExpensesPercent", v)}
                setActiveModal={modals.setActiveModal}
                vacancyRate={inputs.vacancyRate ?? 2}
                renovationCosts={inputs.renovationCosts}
                renovationTimeline={inputs.renovationTimeline}
                buildingDepreciation={inputs.buildingDepreciation} setBuildingDepreciation={(v) => updateInput("buildingDepreciation", v)}
                chattelsDepreciation={inputs.chattelsDepreciation} setChattelsDepreciation={(v) => updateInput("chattelsDepreciation", v)}
              />

              <FinancingInputsSection
                cashInvested={inputs.cashInvested} setCashInvested={(v) => updateInput("cashInvested", v)}
                equityInvested={inputs.equityInvested} setEquityInvested={(v) => updateInput("equityInvested", v)}
                loanCosts={inputs.loanCosts} setLoanCosts={(v) => updateInput("loanCosts", v)}
                interestRate={inputs.interestRate} setInterestRate={(v) => updateInput("interestRate", v)}
                loanType={inputs.loanType} setLoanType={(v) => updateInput("loanType", v)}
                additionalLoan={inputs.additionalLoan} setAdditionalLoan={(v) => updateInput("additionalLoan", v)}
                taxWriteOffPeriod={inputs.taxWriteOffPeriod} setTaxWriteOffPeriod={(v) => updateInput("taxWriteOffPeriod", v)}
                loanError={calc.loanError}
                loanA={calc.loanA}
                loanB={calc.loanB}
                setLoanA={calc.setLoanA}
                setIsModalOpen={modals.setIsModalOpen}
                propertyValue={inputs.propertyValue}
                purchaseCosts={inputs.purchaseCosts}
                renovationCosts={inputs.renovationCosts}
              />

              <WhatIfSection
                inflationRate={inputs.inflationRate} setInflationRate={(v) => updateInput("inflationRate", v)}
                rentalIncomeRate={inputs.rentalIncomeRate} setRentalIncomeRate={(v) => updateInput("rentalIncomeRate", v)}
                rentalExpenseRate={inputs.rentalExpenseRate} setRentalExpenseRate={(v) => updateInput("rentalExpenseRate", v)}
                taxableIncomeRate={inputs.taxableIncomeRate} setTaxableIncomeRate={(v) => updateInput("taxableIncomeRate", v)}
                livingExpensesRate={inputs.livingExpensesRate} setLivingExpensesRate={(v) => updateInput("livingExpensesRate", v)}
                capitalGrowthRate={inputs.capitalGrowthRate} setCapitalGrowthRate={(v) => updateInput("capitalGrowthRate", v)}
                setActiveModal={modals.setActiveModal}
              />
            </div>

            <button
              onClick={calc.performCalculation}
              className="mt-6 w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors shadow-sm"
            >
              CALCULATE
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-5 w-full min-w-0">
            <div className="bg-[#F8F8F8] rounded-[16px] p-6 border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">Property Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["Property cost", fmt((parseFloat(inputs.propertyValue) || 0) + (parseFloat(inputs.renovationCosts) || 0))],
                  ["Total cost", fmt(calc.result?.totalCost)],
                  ["Gross rent (yr 1)", fmt(calc.result?.projections?.[0]?.annualGrossRent)],
                  ["Gross yield (yr 1)", fmtPct(m?.grossYieldYr1)],
                  ["Net rent (yr 1)", fmt(m?.netRentYr1)],
                  ["Net yield (yr 1)", fmtPct(m?.netYieldYr1)],
                  ["Cash neutral investment", fmt(m?.cashNeutralInvestment)],
                  ["Cash positive by", m?.cashPositiveYear ? m.cashPositiveYear : "—"],
                ].map(([label, val]) => (
                  <React.Fragment key={label}>
                    <span className="text-[13px] text-[#64748B]">{label}</span>
                    <span className="text-[13px] font-medium text-[#1E293B] text-right">{val}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="bg-[#F8F8F8] rounded-[16px] p-6 border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">10-Year Summary</h3>
              <div className="bg-[#0052CC] rounded-[8px] py-4 px-5 flex justify-between items-center mb-5">
                <span className="text-white font-medium text-[14px]">Total equity in 10 years</span>
                <span className="text-white font-bold text-[18px]">
                  {calc.result ? fmt(m.totalEquityIn10Years) : "—"}
                </span>
              </div>
              {[
                ["Average rent per week", fmt(m?.avgWeeklyRent)],
                ["Average expenses per week", fmt(m?.avgWeeklyExpenses)],
                ["Average cashflow per week", fmt(m?.avgWeeklyCashflow)],
                ["10-year IRR", m?.irr != null ? m.irr.toFixed(2) + "%" : "N/A"],
                ["Pre-tax equivalent IRR", m?.preTaxEquivalentIRR != null ? m.preTaxEquivalentIRR.toFixed(2) + "%" : "N/A"],
                ["Over 10 years, property is", m?.isCashflowPositive ? "Cashflow positive ✓" : "Cashflow negative"],
                ["Average equity gain / week", fmt(m?.avgEquityGainWeekly)],
                ["Average net gain / week", fmt(m?.avgNetGainWeekly)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-[6px] border-b border-[#F1F5F9] last:border-0">
                  <span className="text-[13px] text-[#64748B]">{label}</span>
                  <span className="text-[13px] font-medium text-[#1E293B]">{val}</span>
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <button className="flex-1 bg-[#23303B] hover:bg-[#1a242c] text-white font-medium py-3 rounded-[8px] transition-colors text-[13px]">
                  Talk to an advisor
                </button>
              </div>
              <div className="flex gap-3 mt-3">
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">Save scenario</button>
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">Share report (PDF)</button>
              </div>
            </div>
          </div>
        </div>

        {calc.result && (
          <div className="mt-8 mb-8 flex justify-center">
            <button
              onClick={() => modals.setIsProjectionsModalOpen(true)}
              className="bg-white border-2 border-[#0052CC] text-[#0052CC] font-bold py-3 px-8 rounded-[8px] hover:bg-[#F1F5F9] transition-colors shadow-sm"
            >
              View Detailed Data Grid
            </button>
          </div>
        )}
      </div>

      <CalculatorModals calc={calc} modals={modals} />

    </div>
  );
}