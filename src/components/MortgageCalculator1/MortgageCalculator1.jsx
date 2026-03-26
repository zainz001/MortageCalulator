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

  const effectiveMonthlyContribution =
    contributionMode === "income"
      ? Math.max(0, toNum(monthlyIncome) - toNum(monthlyExpenses))
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
              <InputField
                label="Loan Amount"
                prefix="$"
                placeholder="640,000"
                value={loanAmount}
                onChange={setLoanAmount}
              />
              <InputField
                label="Annual Interest Rate (%)"
                placeholder="6.95"
                value={rate}
                onChange={setRate}
              />
              <InputField
                label="Loan Term (Years)"
                placeholder="30"
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
                  placeholder="20,000"
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
                    <option value="direct">Enter monthly contribution directly</option>
                    <option value="income">Calculate from income &amp; expenses</option>
                  </select>
                </div>

                {contributionMode === "direct" && (
                  <>
                    <InputField
                      label="Target Monthly Increase"
                      prefix="$"
                      placeholder="1,500"
                      value={monthlyContribution}
                      tooltip="How much extra you plan to add to your offset account every month."
                      onChange={setMonthlyContribution}
                    />
                    {/* ── NEW: warning chip under the contribution field ── */}
                    {contributionWarning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 text-[13px] text-amber-700 leading-snug">
                        {contributionWarning}
                      </div>
                    )}
                  </>
                )}

                {contributionMode === "income" && (
                  <>
                    <InputField
                      label="Monthly Income"
                      prefix="$"
                      placeholder="8,000"
                      value={monthlyIncome}
                      tooltip="Your total take-home income each month."
                      onChange={setMonthlyIncome}
                    />
                    <InputField
                      label="Monthly Expenses"
                      prefix="$"
                      placeholder="5,500"
                      value={monthlyExpenses}
                      tooltip="Your total monthly spending. The leftover goes into your offset account."
                      onChange={setMonthlyExpenses}
                    />
                    {(toNum(monthlyIncome) > 0 || toNum(monthlyExpenses) > 0) && (
                      <div className="bg-white border border-[#E2E8F0] rounded-[8px] px-4 py-3 flex justify-between items-center">
                        <span className="text-[13px] text-[#64748B]">
                          Monthly contribution to offset
                        </span>
                        <span className="text-[14px] font-bold text-[#0052CC]">
                          ${Math.max(0, toNum(monthlyIncome) - toNum(monthlyExpenses)).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {/* ── NEW: same warning in income mode ── */}
                    {contributionWarning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 text-[13px] text-amber-700 leading-snug">
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