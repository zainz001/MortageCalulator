import React, { useState, useRef, useEffect } from "react";
import InputField from "../inputField";
import Chart from "./Chart";
import { calculateMortgageWithSavings } from "../../helpers/mortgageHelpers";

export default function MortgageCalculator() {
  // --- Mortgage inputs (stored as raw strings to allow "6." while typing) ---
  const [propertyPrice, setPropertyPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [extraRepayment, setExtraRepayment] = useState("");
  const [repaymentError, setRepaymentError] = useState("");
  const [frequency, setFrequency] = useState("");
  const [repaymentType, setRepaymentType] = useState("principal_interest");
  const [baseRepayment, setBaseRepayment] = useState(0);
  // --- Informational only ---
  const [hasCalculated, setHasCalculated] = useState(false);
  // --- Outputs ---
  const [chartDataBank, setChartDataBank] = useState([]);
  const [chartDataSwish, setChartDataSwish] = useState([]);
  const [result, setResult] = useState(null);
  const [payoffDate, setPayoffDate] = useState("");
  const [extraEdited, setExtraEdited] = useState(false);

  const lastDepositEdit = useRef("amount");
  useEffect(() => {
    if (!extraEdited) {
      setExtraRepayment(String(Math.round(baseRepayment))); // ← not .toFixed(2)
    }
  }, [baseRepayment, extraEdited]);
  // --- Safe number parse — returns 0 if NaN/empty ---
  const toNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  // --- Handlers: store raw string, only cross-calculate numeric parts ---
  const handlePropertyPriceChange = (val) => {
    setPropertyPrice(val);
    const price = toNum(val);
    if (price > 0) {
      if (lastDepositEdit.current === "percent") {
        const pct = toNum(depositPercent);
        setDepositAmount(String(parseFloat(((pct / 100) * price).toFixed(2))));
      } else {
        const amt = toNum(depositAmount);
        setDepositPercent(String(parseFloat(((amt / price) * 100).toFixed(2))));
      }
    }
  };

  const handleDepositAmountChange = (val) => {
    lastDepositEdit.current = "amount";
    setDepositAmount(val);
    const price = toNum(propertyPrice);
    if (price > 0) {
      setDepositPercent(String(parseFloat(((toNum(val) / price) * 100).toFixed(2))));
    }
  };

  const handleDepositPercentChange = (val) => {
    lastDepositEdit.current = "percent";
    setDepositPercent(val);
    const price = toNum(propertyPrice);
    setDepositAmount(String(parseFloat(((toNum(val) / 100) * price).toFixed(2))));
  };

  const handleRateChange = (val) => setRate(val);
  const handleYearsChange = (val) => setYears(val);
  const handleExtraRepaymentChange = (val) => {
    setExtraRepayment(val);
    setExtraEdited(true);
    const minVal = Math.round(baseRepayment); // this IS the Repayment/fn value
    if (val !== "" && toNum(val) < minVal) {
      setRepaymentError(`Cannot be less than minimum repayment $${minVal}`);
    } else {
      setRepaymentError("");
    }
  };
  // ✅ Removed auto-set of extraRepayment
  // When frequency changes, reset extraEdited so extraRepayment can update automatically
  const handleFrequencyChange = (value) => {
    setFrequency(value);
    setExtraEdited(false); // allow auto-sync with new baseRepayment
  };
  // --- Calculate ---
  const handleCalculate = () => {
    if (repaymentError) return alert(repaymentError);
    const price = toNum(propertyPrice);
    const deposit = toNum(depositAmount);
    const r = toNum(rate);
    const y = toNum(years);
    const repaymentAmount = toNum(extraRepayment);

    if (!price || price <= 0) return alert("Property Price must be greater than 0.");
    if (deposit < 0 || deposit >= price) return alert("Deposit Amount must be between $0 and Property Price.");
    if (r < 0) return alert("Interest Rate must be 0 or greater.");
    if (!y || y <= 0 || y > 30) return alert("Loan Term must be between 1 and 30 years.");

    // First, get the base repayment with no extra
    const baseRes = calculateMortgageWithSavings({
      propertyPrice: price,
      depositAmount: deposit,
      rate: r,
      years: y,
      frequency,
      repaymentType,
      extraRepayment: 0,
    });

    const base = Math.round(baseRes.repayment);
    setBaseRepayment(base);

    // Extra = whatever user typed MINUS the base repayment
    const extraAboveBase = Math.max(0, repaymentAmount - base);

    const res = calculateMortgageWithSavings({
      propertyPrice: price,
      depositAmount: deposit,
      rate: r,
      years: y,
      frequency,
      repaymentType,
      extraRepayment: extraAboveBase,
    });

    setResult(res);



    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
    const monthsToPayoff = Math.round((res.numberOfRepayments / periodsPerYear) * 12);
    const payoff = new Date();
    payoff.setMonth(payoff.getMonth() + monthsToPayoff);
    setPayoffDate(
      payoff.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" })
    );

    setChartDataBank(res.scheduleWithoutExtra);
    setChartDataSwish(res.scheduleWithExtra);
    setHasCalculated(true);
  };

  // Live-derived values
  const loanAmount = Math.max(0, toNum(propertyPrice) - toNum(depositAmount));
  const lvr =
    toNum(propertyPrice) > 0
      ? ((loanAmount / toNum(propertyPrice)) * 100).toFixed(2)
      : "0.00";

  const mergedChartData = React.useMemo(() => {
    return chartDataBank.map((row, i) => ({
      year: row.year,
      bank: row.balance,
      swish: chartDataSwish[i]
        ? Math.max(0, chartDataSwish[i].balance)
        : 0,
    }));
  }, [chartDataBank, chartDataSwish]);

  // Re-run calculation whenever extraRepayment changes, but only if a result already exists
  const prevFrequency = useRef(frequency);

 useEffect(() => {
  if (!hasCalculated) return;

  const price = toNum(propertyPrice);
  const deposit = toNum(depositAmount);
  const r = toNum(rate);
  const y = toNum(years);
  if (!price || !y || !frequency) return;

  const baseRes = calculateMortgageWithSavings({
    propertyPrice: price,
    depositAmount: deposit,
    rate: r,
    years: y,
    frequency,
    repaymentType,
    extraRepayment: 0,
  });

  const newBase = Math.round(baseRes.repayment);
  setBaseRepayment(newBase);

  if (prevFrequency.current !== frequency) {
    setExtraRepayment(String(newBase));
    prevFrequency.current = frequency;
  }

  const userRepayment = toNum(extraRepayment);
  const extraAboveBase = Math.max(0, userRepayment - newBase);

  const res = calculateMortgageWithSavings({
    propertyPrice: price,
    depositAmount: deposit,
    rate: r,
    years: y,
    frequency,
    repaymentType,
    extraRepayment: extraAboveBase,
  });

  // ✅ Show user-typed repayment amount in the summary card
  setResult({
    ...res,
    repayment: userRepayment >= newBase ? userRepayment : res.repayment,
  });

  setChartDataBank(res.scheduleWithoutExtra);
  setChartDataSwish(res.scheduleWithExtra);

  const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
  const monthsToPayoff = Math.round((res.numberOfRepayments / periodsPerYear) * 12);
  const payoff = new Date();
  payoff.setMonth(payoff.getMonth() + monthsToPayoff);
  setPayoffDate(payoff.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" }));

}, [propertyPrice, depositAmount, depositPercent, rate, years, frequency, repaymentType, extraRepayment, hasCalculated]);

return (
     <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full">
       {/* <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] mb-4 md:mb-6">
          Offset Mortgage Calculator
        </h2> */}

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">

          <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col">
             <h3 className="text-[16px] md:text-[18px] font-bold text-[#23303B] mb-[32px] leading-snug">
              Calculate how much you could save in time and interest if you switched your mortgage to Swish.
            </h3>

            <div className="flex flex-col gap-[16px] flex-1">
              <InputField
                label="Property Price"
                prefix="$"
                // placeholder="800,000"
                value={propertyPrice}
                onChange={handlePropertyPriceChange}
              />
              <InputField
                label="Deposit Amount"
                prefix="$"
                // placeholder="160,000"
                value={depositAmount}
                onChange={handleDepositAmountChange}
              />
              <InputField
                label="Deposit %"
                numberMode="decimal"
                // placeholder="20"
                value={depositPercent}
                onChange={handleDepositPercentChange}
              />
              <InputField
                label="Interest Rate (Annual %)"
                numberMode="decimal"
                // placeholder="6.5"
                value={rate}
                onChange={handleRateChange}
              />
              <InputField
                label="Loan Term (Years)"
                // placeholder="30"
                value={years}
                onChange={handleYearsChange}
              />
              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">
                  Repayment Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]"
                >
                  <option value="" disabled hidden>Select</option>
                  <option value="monthly">Monthly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">
                  Repayment Type
                </label>
                <select
                  value={repaymentType}
                  onChange={(e) => setRepaymentType(e.target.value)}
                  className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]"
                >
                  <option value="principal_interest">Principal & Interest</option>
                  <option value="interest_only">Interest Only</option>
                </select>
              </div>

              {/* ✅ Label updates dynamically based on selected frequency */}
               <InputField
                label={`Repayment Amount ${frequency ? `(per ${frequency.charAt(0).toUpperCase() + frequency.slice(1)})` : ""}`}
                prefix="$"
                type="number"
                value={extraRepayment}
                disabled={!hasCalculated}
                tooltip={!hasCalculated ? "Your Repayment will be determined once the mortgage is calculated." : ""}
                error={repaymentError}
                onChange={(num) => {
                  handleExtraRepaymentChange(num);
                  setExtraEdited(true);
                }}
                onBlur={() => {
                  if (extraRepayment === "") {
                    setExtraRepayment(String(Math.round(baseRepayment)));
                    setRepaymentError("");
                  }
                }}
                min={baseRepayment}
                step={1}
              />
            </div>

            <button
              onClick={handleCalculate}
              className="mt-[32px] w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors"
            >
              CALCULATE
            </button>
          </div>

          {/* Right Panel: Chart */}
          <Chart
            key={frequency}
            chartData={mergedChartData}
            savings={result ? result.interestSaved : 0}
            yearsSaved={result ? result.yearsSaved : 0}
            monthsSaved={result ? result.monthsSaved : 0}
            result={result}
            loanAmount={loanAmount}
            depositAmount={toNum(depositAmount)}
            depositPercent={depositPercent}
            lvr={lvr}
            frequency={frequency}
            payoffDate={payoffDate}
          />
        </div>
      </div>
    </div>
  );
}
