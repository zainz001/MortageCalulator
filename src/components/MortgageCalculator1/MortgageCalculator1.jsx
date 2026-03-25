import React, { useState, useEffect, useMemo, useRef } from "react";
import InputField from "../inputField";
import Chart from "./chart1"; 
import { calculateOffsetMortgageSavings } from "../../helpers/mortgageHelpers";

export default function OffsetMortgageCalculator() {
  // --- Mortgage inputs ---
  const [loanAmount, setLoanAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  
  // --- Offset specific inputs ---
  const [offsetMode, setOffsetMode] = useState("constant");
  const [offsetBalance, setOffsetBalance] = useState("");
  const [schedule, setSchedule] = useState([{ month: 1, balance: 10000 }]);

  // --- Manual Override Repayment Inputs ---
  const [extraRepayment, setExtraRepayment] = useState("");
  const [baseRepayment, setBaseRepayment] = useState(0);
  const [repaymentError, setRepaymentError] = useState("");
  const prevFrequency = useRef(frequency);
  
  // --- Outputs & Status ---
  const [hasCalculated, setHasCalculated] = useState(false);
  const [result, setResult] = useState(null);

  // --- Safe number parse ---
  const toNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  // Convert the user's milestone schedule into a flat 360-month array for the helper
  const buildMonthlyOffsetArray = (scheduleParams, totalYears) => {
    const totalMonths = totalYears * 12;
    const arr = new Array(totalMonths).fill(0);
    
    const sorted = [...scheduleParams]
      .map(s => ({ month: toNum(s.month), balance: toNum(s.balance) }))
      .sort((a, b) => a.month - b.month);
    
    let currentBal = 0;
    let paramIndex = 0;

    for(let m = 0; m < totalMonths; m++) {
      const currentMonthNum = m + 1;
      while (paramIndex < sorted.length && sorted[paramIndex].month <= currentMonthNum) {
        currentBal = sorted[paramIndex].balance;
        paramIndex++;
      }
      arr[m] = currentBal;
    }
    return arr;
  };

  // --- Calculate Logic ---
  const performCalculation = (isAuto = false) => {
    const principal = toNum(loanAmount);
    const r = toNum(rate);
    const y = toNum(years);
    const offsetConst = toNum(offsetBalance);
    const overrideRepayment = toNum(extraRepayment);

    // Guard clauses
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

    let offsetScheduleArray = [];
    if (offsetMode === "schedule") {
      offsetScheduleArray = buildMonthlyOffsetArray(schedule, y);
    }

    const res = calculateOffsetMortgageSavings({
      propertyPrice: principal,
      depositAmount: 0,
      rate: r,
      years: y,
      frequency,
      offsetMode,
      offsetBalance: offsetConst,
      offsetScheduleArray,
      manualRepayment: overrideRepayment
    });

    if (!res) return;

    // Save the bare minimum repayment exactly as calculated by the bank formula
    const minimumRepayment = res.repayment; 
    setBaseRepayment(minimumRepayment);
    
    // Update the UI Chart with whatever the user is actively paying (minimum or custom)
    res.repayment = res.activeRepayment;
    setResult(res);

    // ONLY auto-fill the custom field if it is currently completely empty.
    // We let the user type smaller numbers without fighting them, we just won't apply them to the chart.
    if (extraRepayment === "") {
      setExtraRepayment(String(Math.round(minimumRepayment)));
    }

    // Force recalculate if frequency changed
    if (prevFrequency.current !== frequency) {
      setExtraRepayment(String(Math.round(minimumRepayment)));
      prevFrequency.current = frequency;
    }

    setHasCalculated(true);
  };

  // Automatically recalculate when primary inputs change
  useEffect(() => {
    if (hasCalculated) {
      performCalculation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanAmount, rate, years, frequency, offsetMode, offsetBalance, schedule, extraRepayment]);

  const mergedChartData = useMemo(() => {
    if (!result) return [];
    return result.scheduleStandard.map((row, i) => ({
      year: row.year,
      standard: row.balance,
      offset: result.scheduleOffset[i] ? Math.max(0, result.scheduleOffset[i].balance) : 0,
    }));
  }, [result]);

  // Handlers
  const handleExtraRepaymentChange = (val) => {
    setExtraRepayment(val);
    const minVal = Math.round(baseRepayment);
    // Give visual warning if they type a number too low, but DO NOT block the input.
    if (val !== "" && toNum(val) < minVal) {
      setRepaymentError(`Minimum required is $${minVal}`);
    } else {
      setRepaymentError("");
    }
  };

  const handleRepaymentBlur = () => {
    const currentVal = toNum(extraRepayment);
    const minVal = Math.round(baseRepayment);
    // If they leave the field empty OR leave a number that is too small, snap it back to minimum
    if (extraRepayment === "" || currentVal < minVal) {
      setExtraRepayment(String(minVal));
      setRepaymentError("");
    }
  };

  const addScheduleRow = () => setSchedule([...schedule, { month: "", balance: "" }]);
  const updateScheduleRow = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };
  const removeScheduleRow = (index) => {
    if (schedule.length === 1) return;
    setSchedule(schedule.filter((_, i) => i !== index));
  };

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
              <InputField label="Loan Amount" prefix="$" placeholder="640,000" value={loanAmount} onChange={setLoanAmount} />
              <InputField label="Annual Interest Rate (%)" placeholder="6.95" value={rate} onChange={setRate} />
              <InputField label="Loan Term (Years)" placeholder="30" value={years} onChange={setYears} />
              
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">Repayment Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]">
                  <option value="monthly">Monthly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* Advanced Mode Toggle */}
              <div className="pt-4 border-t border-[#E2E8F0] mt-2 flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">Offset Balance Mode</label>
                <select value={offsetMode} onChange={(e) => setOffsetMode(e.target.value)} className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]">
                  <option value="constant">Constant Balance</option>
                  <option value="schedule">Advanced Schedule Builder</option>
                </select>
              </div>

              {/* Constant Mode UI */}
              {offsetMode === "constant" && (
                <InputField
                  label="Constant Offset Balance"
                  prefix="$"
                  placeholder="40,000"
                  value={offsetBalance}
                  tooltip="The balance in your linked account. We calculate interest as if this amount is deducted from your loan."
                  onChange={setOffsetBalance}
                />
              )}

              {/* Schedule Mode UI */}
              {offsetMode === "schedule" && (
                <div className="flex flex-col gap-3 mt-2 p-4 bg-white border border-[#E2E8F0] rounded-[8px]">
                  <p className="text-[12px] text-[#64748B] leading-tight m-0">
                    Model future salary inflows or savings build-up. Define when your offset balance changes.
                  </p>
                  {schedule.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-1 flex flex-col">
                        <label className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wide">From Month</label>
                        <input
                          type="number"
                          placeholder="e.g. 1"
                          value={item.month}
                          onChange={(e) => updateScheduleRow(idx, "month", e.target.value)}
                          className="h-[38px] px-3 border border-[#E2E8F0] rounded-[6px] text-[14px]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wide">Balance</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-[#64748B] text-[14px]">$</span>
                          <input
                            type="number"
                            placeholder="e.g. 10000"
                            value={item.balance}
                            onChange={(e) => updateScheduleRow(idx, "balance", e.target.value)}
                            className="h-[38px] pl-6 pr-3 border border-[#E2E8F0] rounded-[6px] w-full text-[14px]"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeScheduleRow(idx)}
                        className={`mt-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${schedule.length > 1 ? 'bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FECACA]' : 'bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed'}`}
                        disabled={schedule.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button onClick={addScheduleRow} className="mt-2 text-[13px] font-bold text-[#0052CC] text-left hover:underline">
                    + Add milestone
                  </button>
                </div>
              )}

              {/* Repayment Override Field */}
              <div className="pt-2">
                <InputField
                  label={`Repayment Amount ${frequency ? `(per ${frequency.charAt(0).toUpperCase() + frequency.slice(1)})` : ""}`}
                  prefix="$"
                  type="number"
                  value={extraRepayment}
                  disabled={!hasCalculated}
                  tooltip={!hasCalculated ? "Your minimum repayment will be determined once the mortgage is calculated." : "Increase this number to see how extra manual repayments affect your loan."}
                  error={repaymentError}
                  onChange={(num) => handleExtraRepaymentChange(num)}
                  onBlur={handleRepaymentBlur}
                  min={0} // Changed from baseRepayment so the HTML input element stops fighting the user
                  step={1}
                />
              </div>

            </div>
            
            <button
              onClick={() => performCalculation(false)}
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
            frequency={frequency}
          />
        </div>
      </div>
    </div>
  );
}