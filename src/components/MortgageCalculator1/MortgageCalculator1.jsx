import React, { useState, useEffect, useMemo } from "react";
import InputField from "../inputField";
import Chart from "./chart1";
import { calculateOffsetMortgageSavings } from "../../helpers/mortgageHelpers";

export default function OffsetMortgageCalculator() {
  // --- Mortgage inputs ---
  const [loanAmount, setLoanAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  // --- Offset inputs ---
  const [initialSavings, setInitialSavings] = useState("");
  const [contributionMode, setContributionMode] = useState("income"); // Default to 'income' for NZ model
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");

  // --- Outputs & Status ---
  const [hasCalculated, setHasCalculated] = useState(false);
  const [result, setResult] = useState(null);

  const toNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  // ── Calculate the standard monthly mortgage payment for the budget breakdown ──
  const monthlyMortgageEstimate = useMemo(() => {
    const principal = toNum(loanAmount);
    const annualRate = toNum(rate);
    const termYears = toNum(years);

    if (principal <= 0 || termYears <= 0) return 0;
    
    const rBase = annualRate / 100 / 12; 
    const nBase = termYears * 12; 
    
    if (rBase === 0) return principal / nBase;
    return principal * ((rBase * Math.pow(1 + rBase, nBase)) / (Math.pow(1 + rBase, nBase) - 1));
  }, [loanAmount, rate, years]);

  // ── Derive Leftover Savings (Income - Expenses - Mortgage) ──
  const effectiveMonthlyContribution = useMemo(() => {
    if (contributionMode === "income") {
      const surplus = toNum(monthlyIncome) - toNum(monthlyExpenses) - monthlyMortgageEstimate;
      return Math.max(0, surplus);
    }
    return toNum(monthlyContribution);
  }, [contributionMode, monthlyIncome, monthlyExpenses, monthlyMortgageEstimate, monthlyContribution]);

  const contributionWarning = useMemo(() => {
    if (!result) return "";
    if (toNum(initialSavings) >= toNum(loanAmount)) {
      return "ℹ️ Your initial savings already cover the full loan — you'd owe no interest from day one.";
    }
    return "";
  }, [initialSavings, loanAmount, result]);

  const performCalculation = (isAuto = false) => {
    const principal = toNum(loanAmount);
    const r = toNum(rate);
    const y = toNum(years);

    if (principal <= 0) return; // Silent return for auto-calc if principal is empty

    const res = calculateOffsetMortgageSavings({
      propertyPrice: principal,
      depositAmount: 0,
      rate: r,
      years: y,
      frequency,
      currentSavings: toNum(initialSavings),
      monthlyContribution: effectiveMonthlyContribution,
    });

    if (!res) return;
    setResult(res);
    setHasCalculated(true);
  };

  useEffect(() => {
    if (hasCalculated) performCalculation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loanAmount, rate, years, frequency,
    initialSavings, effectiveMonthlyContribution, contributionMode
  ]);

  const mergedChartData = useMemo(() => {
    if (!result) return [];
    return result.unifiedSchedule;
  }, [result]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full">
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] mb-4 md:mb-6">
          Offset Mortgage Calculator
        </h2>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">
          <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#23303B] mb-[32px] leading-snug">
              Calculate how much you could save in time and interest by linking
              an offset account to your home loan.
            </h3>

            <div className="flex flex-col gap-[16px] flex-1">
              <InputField label="Loan Amount" prefix="$" placeholder="" value={loanAmount} onChange={setLoanAmount} />
              <InputField label="Annual Interest Rate (%)" placeholder="" value={rate} onChange={setRate} />
              <InputField label="Loan Term (Years)" placeholder="" value={years} onChange={setYears} />

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">Repayment Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px] bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] mt-2 flex flex-col gap-[16px]">
                <InputField
                  label="Initial Savings (Offset Starting Balance)"
                  prefix="$"
                  placeholder=""
                  value={initialSavings}
                  tooltip="How much money you currently have in your offset account on day one."
                  onChange={setInitialSavings}
                />

                <div className="flex flex-col gap-[8px]">
                  <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">Monthly Savings Mode</label>
                  <select
                    value={contributionMode}
                    onChange={(e) => setContributionMode(e.target.value)}
                    className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px] bg-white"
                  >
                    <option value="income">Calculate from income & expenses</option>
                    <option value="direct">Enter monthly contribution directly</option>
                  </select>
                </div>

                {contributionMode === "direct" ? (
                  <>
                    <InputField
                      label="Target Monthly Increase"
                      prefix="$"
                      placeholder=""
                      value={monthlyContribution}
                      tooltip="How much extra you plan to add to your offset account every month."
                      onChange={setMonthlyContribution}
                    />
                    {contributionWarning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 text-[13px] text-amber-700">
                        {contributionWarning}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <InputField label="Monthly Income" prefix="$" placeholder="" value={monthlyIncome} onChange={setMonthlyIncome} />
                    <InputField label="Monthly Expenses (Excluding Mortgage)" prefix="$" placeholder="" value={monthlyExpenses} onChange={setMonthlyExpenses} />
                    
                    {(toNum(monthlyIncome) > 0 || toNum(monthlyExpenses) > 0 || monthlyMortgageEstimate > 0) && (
                      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-2 mt-1 shadow-sm">
                        <div className="flex justify-between text-[13px] text-[#64748B]">
                          <span>Income</span>
                          <span>${toNum(monthlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-[13px] text-[#64748B]">
                          <span>Expenses</span>
                          <span>- ${toNum(monthlyExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-[13px] text-[#64748B]">
                          <span>Est. Mortgage</span>
                          <span>- ${monthlyMortgageEstimate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="border-t border-[#E2E8F0] my-1"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-bold text-[#23303B]">Leftover for Offset</span>
                          <span className="text-[15px] font-bold text-[#0052CC]">
                            ${effectiveMonthlyContribution.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                    {contributionWarning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 text-[13px] text-amber-700 mt-2">
                        {contributionWarning}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => performCalculation(false)}
              className="mt-[32px] w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-4 rounded-[8px] transition-colors shadow-sm"
            >
              CALCULATE
            </button>
          </div>

          <Chart
            key={frequency}
            chartData={mergedChartData}
            savings={result ? result.interestSaved : 0}
            yearsSaved={result ? result.yearsSaved : 0}
            monthsSaved={result ? result.monthsSaved : 0}
            result={result}
            frequency={frequency}
          />
        </div>
      </div>
    </div>
  );
}