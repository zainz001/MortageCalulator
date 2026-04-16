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
  const [contributionMode, setContributionMode] = useState("direct");
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

  const effectiveMonthlyContribution =
    contributionMode === "income"
      ? Math.max(
        0,
        toNum(monthlyIncome) -
        toNum(monthlyExpenses) -
        monthlyMortgageEstimate
      )
      : toNum(monthlyContribution);

  // ── NEW: warn when savings will exceed the loan balance ──
  const contributionWarning = useMemo(() => {
    if (!result) return "";
    if (toNum(initialSavings) >= result.loanAmount) {
      return "ℹ️ Your initial savings already cover the full loan — you'd owe no interest from day one.";
    }
    return "";
  }, [initialSavings, result]);
  const performCalculation = (isAuto = false) => {
    const principal = toNum(loanAmount);
    const r = toNum(rate);
    const y = toNum(years);

    if (principal <= 0) {
      if (!isAuto) alert("Loan Amount must be greater than 0.");
      return;
    }
    if (r < 0) {
      if (!isAuto) alert("Interest Rate must be 0 or greater.");
      return;
    }
    if (!y || y <= 0 || y > 30) {
      if (!isAuto) alert("Loan Term must be between 1 and 30 years.");
      return;
    }

    const res = calculateOffsetMortgageSavings({
      propertyPrice: principal,
      depositAmount: 0,
      rate: r,
      years: y,
      frequency,
      currentSavings: toNum(initialSavings),
      monthlyContribution: effectiveMonthlyContribution,
      // ADD THESE TWO LINES SO THE MATH KNOWS ABOUT THE INCOME:
      monthlyIncome: contributionMode === "income" ? toNum(monthlyIncome) : 0,
      monthlyExpenses: contributionMode === "income" ? toNum(monthlyExpenses) : 0,
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
    initialSavings, monthlyContribution,
    monthlyIncome, monthlyExpenses, contributionMode,
  ]);
// 1. Fix the mergedChartData to include years BEYOND when offset hits 0
// so both lines share the same x-axis domain

// In OffsetMortgageCalculator.jsx - fix mergedChartData
const mergedChartData = useMemo(() => {
  if (!result) return [];

  const schedule = result.unifiedSchedule;
  if (!schedule.length) return [];

  const startYear = Math.ceil(schedule[0].year);
  const endYear = Math.floor(schedule[schedule.length - 1].year);

  let offsetPaidOff = false;  // track when offset hits zero

  const yearly = [];
  for (let yr = startYear; yr <= endYear; yr++) {
    const closest = schedule.reduce((a, b) =>
      Math.abs(b.year - yr) < Math.abs(a.year - yr) ? b : a
    );

    const rawOffset = closest.offset;

    // Once offset hits 0, mark it paid off and use null from here on
    if (!offsetPaidOff && rawOffset <= 0) {
      offsetPaidOff = true;
      yearly.push({
        year: yr,
        standard: closest.standard > 0 ? closest.standard : 0,
        offset: 0,  // include the zero point so the line touches the axis
      });
      continue;
    }

    yearly.push({
      year: yr,
      standard: closest.standard > 0 ? closest.standard : 0,
      offset: offsetPaidOff ? null : (rawOffset > 0 ? rawOffset : 0),
    });
  }

  return yearly;
}, [result]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full">
        {/* <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] mb-4 md:mb-6">
          Offset Mortgage Calculator
        </h2> */}

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">

          <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#23303B] mb-[32px] leading-snug">
              Calculate how much you could save in time and interest by linking
              an offset account to your home loan.
            </h3>

            <div className="flex flex-col gap-[16px] flex-1">
              <InputField
                label="Loan Amount"
                prefix="$"
                // placeholder="640,000"
                value={loanAmount}
                onChange={setLoanAmount}
              />
              <InputField
                label="Annual Interest Rate (%)"
                // placeholder="6.95"
                value={rate}
                onChange={setRate}
              />
              <InputField
                label="Loan Term (Years)"
                // placeholder="30"
                value={years}
                onChange={setYears}
              />

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">
                  Repayment Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]"
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
                  // placeholder="20,000"
                  value={initialSavings}
                  tooltip="How much money you currently have in your offset account on day one."
                  onChange={setInitialSavings}
                />

                <div className="flex flex-col gap-[8px]">
                  <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">
                    Monthly Savings Mode
                  </label>
                  <select
                    value={contributionMode}
                    onChange={(e) => setContributionMode(e.target.value)}
                    className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]"
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
                          <span className="text-[13px] font-bold text-[#23303B]">Monthly Offset Contribution</span>
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
              className="mt-[32px] w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors"
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