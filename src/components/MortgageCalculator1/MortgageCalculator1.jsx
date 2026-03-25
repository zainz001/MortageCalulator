import React, { useState, useEffect, useMemo } from "react";
import InputField from "../inputField";
import Chart from "./chart1"; 
import { calculateOffsetMortgageSavings } from "../../helpers/mortgageHelpers";

export default function OffsetMortgageCalculator() {
  // --- Mortgage inputs (Strictly from Spec MVP) ---
  const [loanAmount, setLoanAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  
  // --- Offset specific inputs ---
  const [offsetBalance, setOffsetBalance] = useState("");
  
  // --- Outputs & Status ---
  const [hasCalculated, setHasCalculated] = useState(false);
  const [result, setResult] = useState(null);
  const [payoffDateStandard, setPayoffDateStandard] = useState("");
  const [payoffDateOffset, setPayoffDateOffset] = useState("");

  // --- Safe number parse ---
  const toNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  // --- Calculate Logic ---
  const performCalculation = () => {
    const principal = toNum(loanAmount);
    const r = toNum(rate);
    const y = toNum(years);
    const offset = toNum(offsetBalance);

    if (principal <= 0) return alert("Loan Amount must be greater than 0.");
    if (r < 0) return alert("Interest Rate must be 0 or greater.");
    if (!y || y <= 0 || y > 30) return alert("Loan Term must be between 1 and 30 years.");
    if (offset < 0) return alert("Offset balance cannot be negative.");

    // Passing principal as propertyPrice and 0 as deposit to reuse the existing helper logic 
    // seamlessly without needing to rewrite the helper function.
    const res = calculateOffsetMortgageSavings({
      propertyPrice: principal,
      depositAmount: 0,
      rate: r,
      years: y,
      frequency,
      offsetBalance: offset,
    });

    if (!res) return;

    setResult(res);

    // Calculate payoff dates based on periods saved
    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
    
    const standardMonths = Math.round((res.numberOfRepaymentsStandard / periodsPerYear) * 12);
    const payoffStd = new Date();
    payoffStd.setMonth(payoffStd.getMonth() + standardMonths);
    setPayoffDateStandard(payoffStd.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }));

    const offsetMonths = Math.round((res.numberOfRepaymentsOffset / periodsPerYear) * 12);
    const payoffOff = new Date();
    payoffOff.setMonth(payoffOff.getMonth() + offsetMonths);
    setPayoffDateOffset(payoffOff.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }));

    setHasCalculated(true);
  };

  // Re-run calculation automatically on input change IF they have already calculated once
  useEffect(() => {
    if (hasCalculated) {
      performCalculation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanAmount, rate, years, frequency, offsetBalance]);

  // Merge chart data for the Chart component
  const mergedChartData = useMemo(() => {
    if (!result) return [];
    return result.scheduleStandard.map((row, i) => ({
      year: row.year,
      standard: row.balance,
      offset: result.scheduleOffset[i] ? Math.max(0, result.scheduleOffset[i].balance) : 0,
    }));
  }, [result]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full">
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] mb-4 md:mb-6">
          Offset Mortgage Calculator
        </h2>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">
          {/* Left Panel: Inputs */}
          <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#23303B] mb-[32px] leading-snug">
              Calculate how much you could save in time and interest by linking an offset account to your home loan.
            </h3>

            <div className="flex flex-col gap-[16px] flex-1">
              <InputField
                label="Loan Amount"
                prefix="$"
                placeholder="640,000"
                value={loanAmount}
                onChange={(val) => setLoanAmount(val)}
              />
              <InputField
                label="Annual Interest Rate (%)"
                placeholder="6.95"
                value={rate}
                onChange={(val) => setRate(val)}
              />
              <InputField
                label="Loan Term (Years)"
                placeholder="30"
                value={years}
                onChange={(val) => setYears(val)}
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

              {/* Offset Input */}
              <div className="pt-4 border-t border-[#E2E8F0] mt-2">
                <InputField
                  label="Constant Offset Balance"
                  prefix="$"
                  placeholder="40,000"
                  value={offsetBalance}
                  tooltip="The balance in your linked account. We calculate interest as if this amount is deducted from your loan."
                  onChange={(val) => setOffsetBalance(val)}
                />
              </div>
            </div>

          
              <button
                onClick={performCalculation}
                className="mt-[32px] w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors"
              >
                CALCULATE
              </button>
            
          </div>

          {/* Right Panel: Chart / Results */}
          <Chart
            key={frequency}
            chartData={mergedChartData}
            savings={result ? result.interestSaved : 0}
            yearsSaved={result ? result.yearsSaved : 0}
            monthsSaved={result ? result.monthsSaved : 0}
            result={result}
            loanAmount={toNum(loanAmount)}
            frequency={frequency}
            payoffDate={payoffDateOffset || payoffDateStandard}
          />
        </div>
      </div>
    </div>
  );
}