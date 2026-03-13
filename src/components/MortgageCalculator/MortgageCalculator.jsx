import React, { useState, useRef } from "react";
import InputField from "./InputField";
import Chart from "./Chart";
import { calculateMortgageWithSavings } from "../../helpers/mortgageHelpers";

export default function MortgageCalculator() {
  // --- Mortgage inputs ---
  const [propertyPrice, setPropertyPrice] = useState(800000);
  const [depositAmount, setDepositAmount] = useState(160000);
  const [depositPercent, setDepositPercent] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extraRepayment, setExtraRepayment] = useState(0);
  const [frequency, setFrequency] = useState("monthly");
  const [repaymentType, setRepaymentType] = useState("principal_interest");
  const [fees, setFees] = useState(0);

  // --- Informational only — isolated, never affect mortgage calc ---
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");

  // --- Outputs ---
  const [chartDataBank, setChartDataBank] = useState([]);
  const [chartDataSwish, setChartDataSwish] = useState([]);
  const [result, setResult] = useState(null);
  const [payoffDate, setPayoffDate] = useState("");

  // Track which deposit field was last edited
  const lastDepositEdit = useRef("amount");

  // --- Safe number parse — returns 0 if NaN/empty ---
  const toNum = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  // --- Mortgage field handlers only ---
  const handlePropertyPriceChange = (val) => {
    const price = toNum(val);
    setPropertyPrice(price);
    if (price > 0) {
      if (lastDepositEdit.current === "percent") {
        const pct = toNum(depositPercent);
        setDepositAmount(parseFloat(((pct / 100) * price).toFixed(2)));
      } else {
        const amt = toNum(depositAmount);
        setDepositPercent(parseFloat(((amt / price) * 100).toFixed(2)));
      }
    }
  };

  const handleDepositAmountChange = (val) => {
    lastDepositEdit.current = "amount";
    const amount = toNum(val);
    setDepositAmount(amount);
    const price = toNum(propertyPrice);
    if (price > 0) {
      setDepositPercent(parseFloat(((amount / price) * 100).toFixed(2)));
    }
  };

  const handleDepositPercentChange = (val) => {
    lastDepositEdit.current = "percent";
    const pct = toNum(val);
    setDepositPercent(pct);
    const price = toNum(propertyPrice);
    setDepositAmount(parseFloat(((pct / 100) * price).toFixed(2)));
  };

  const handleRateChange = (val) => setRate(toNum(val));
  const handleYearsChange = (val) => setYears(toNum(val));
  const handleExtraRepaymentChange = (val) => setExtraRepayment(toNum(val));
  const handleFeesChange = (val) => setFees(toNum(val));

  // --- Calculate ---
  const handleCalculate = () => {
    const price = toNum(propertyPrice);
    const deposit = toNum(depositAmount);
    const r = toNum(rate);
    const y = toNum(years);
    const extra = toNum(extraRepayment);

    if (!price || price <= 0) return alert("Property Price must be greater than 0.");
    if (deposit < 0 || deposit >= price) return alert("Deposit Amount must be between $0 and Property Price.");
    if (r < 0) return alert("Interest Rate must be 0 or greater.");
    if (!y || y <= 0 || y > 30) return alert("Loan Term must be between 1 and 30 years.");
    if (extra < 0) return alert("Extra Repayment must be 0 or greater.");

    const res = calculateMortgageWithSavings({
      propertyPrice: price,
      depositAmount: deposit,
      rate: r,
      years: y,
      frequency,
      repaymentType,
      extraRepayment: extra,
    });

    setResult(res);

    // Payoff date
    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
    const monthsToPayoff = Math.round((res.numberOfRepayments / periodsPerYear) * 12);
    const payoff = new Date();
    payoff.setMonth(payoff.getMonth() + monthsToPayoff);
    setPayoffDate(
      payoff.toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" })
    );

    setChartDataBank(res.scheduleWithoutExtra);
    setChartDataSwish(res.scheduleWithExtra);
  };

  // Live-derived values
  const loanAmount = Math.max(0, toNum(propertyPrice) - toNum(depositAmount));
  const lvr =
    toNum(propertyPrice) > 0
      ? ((loanAmount / toNum(propertyPrice)) * 100).toFixed(2)
      : "0.00";

  const mergedChartData = chartDataBank.map((row, i) => ({
    year: row.year,
    bank: row.balance,
    swish: chartDataSwish[i] ? Math.max(0, chartDataSwish[i].balance) : 0,
  }));

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full">
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] mb-4 md:mb-6">
          Mortgage Calculator
        </h2>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">
          {/* Left Panel: Inputs */}
          <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#23303B] mb-[32px] leading-snug">
              Calculate how much you could save in time and interest if you switched your mortgage to Swish.
            </h3>

            <div className="flex flex-col gap-[16px] flex-1">
              <InputField
                label="Property Price"
                prefix="$"
                placeholder="800,000"
                value={propertyPrice}
                onChange={handlePropertyPriceChange}
              />
              <InputField
                label="Deposit Amount"
                prefix="$"
                placeholder="160,000"
                value={depositAmount}
                onChange={handleDepositAmountChange}
              />
              <InputField
                label="Deposit %"
                placeholder="20"
                value={depositPercent}
                onChange={handleDepositPercentChange}
              />
              <InputField
                label="Interest Rate (Annual %)"
                placeholder="6.5"
                value={rate}
                onChange={handleRateChange}
              />
              <InputField
                label="Loan Term (Years)"
                placeholder="30"
                value={years}
                onChange={handleYearsChange}
              />
              <InputField
                label="Extra Repayment (Optional)"
                prefix="$"
                placeholder="0"
                value={extraRepayment}
                onChange={handleExtraRepaymentChange}
              />
              <InputField
                label="Fees Included in Repayment"
                prefix="$"
                placeholder="0"
                value={fees}
                onChange={handleFeesChange}
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

              {/* Informational only — completely isolated from mortgage calculations */}
              <InputField
                label="Combined monthly income after tax"
                prefix="$"
                placeholder="10,000"
                value={income}
                onChange={(val) => setIncome(val)}
              />
              <InputField
                label="Monthly household living expenses (excl. mortgage)"
                prefix="$"
                placeholder="2,000"
                value={expenses}
                onChange={(val) => setExpenses(val)}
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