import React, { useState, useEffect } from "react";
import InputField from "./InputField";
import Chart from "./Chart";
import { calculateMortgage, generateSchedule } from "../../helpers/mortgageHelpers";

export default function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState(800000);
  const [depositAmount, setDepositAmount] = useState(160000);
  const [depositPercent, setDepositPercent] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extraRepayment, setExtraRepayment] = useState(0);
  const [frequency, setFrequency] = useState("monthly");
  const [repaymentType, setRepaymentType] = useState("principal_interest");
  const [fees, setFees] = useState(0);
  const [income, setIncome] = useState(10000);
  const [expenses, setExpenses] = useState(2000);

  const [chartData, setChartData] = useState([]);
  const [result, setResult] = useState({});
  const [savings, setSavings] = useState(0);
  const [yearsSaved, setYearsSaved] = useState(0);
  const [payoffDate, setPayoffDate] = useState("");

  // Keep deposit amount and percent in sync dynamically
  useEffect(() => {
    setDepositPercent(((depositAmount / propertyPrice) * 100).toFixed(2));
  }, [depositAmount, propertyPrice]);

  useEffect(() => {
    setDepositAmount(((depositPercent / 100) * propertyPrice).toFixed(2));
  }, [depositPercent, propertyPrice]);

  const handleCalculate = () => {
    const res = calculateMortgage({
      propertyPrice: Number(propertyPrice),
      depositAmount: Number(depositAmount),
      depositPercent: Number(depositPercent),
      rate: Number(rate),
      years: Number(years),
      frequency,
      repaymentType,
      extraRepayment: Number(extraRepayment),
    });

    setResult(res);

    // Interest saved (example 35% of total interest)
    const savedInterest = res.totalInterest * 0.35;
    setSavings(Math.round(savedInterest));

    // Time saved in years (example 20% of original loan term)
    const timeSaved = Math.round(years * 0.2);
    setYearsSaved(timeSaved);

    // Payoff date calculation
    const today = new Date();
    const totalMonths = Math.ceil(res.numberOfRepayments / 12);
    const payoff = new Date(today.setMonth(today.getMonth() + totalMonths));
    setPayoffDate(payoff.toLocaleDateString());

    // Amortisation schedule
    const schedule = generateSchedule({
      propertyPrice: Number(propertyPrice),
      depositAmount: Number(depositAmount),
      rate: Number(rate),
      years: Number(years),
      frequency,
      repaymentType,
      extraRepayment: Number(extraRepayment),
    });
    setChartData(schedule);
  };

  const loanAmount = propertyPrice - depositAmount;
  const lvr = ((loanAmount / propertyPrice) * 100).toFixed(2);

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
              <InputField label="Property Price" prefix="$" placeholder="800,000" onChange={setPropertyPrice} />
              <InputField label="Deposit Amount" prefix="$" placeholder="160,000" onChange={setDepositAmount} />
              <InputField label="Deposit %" placeholder="20" onChange={setDepositPercent} />
              <InputField label="Interest Rate (Annual %)" placeholder="6.5" onChange={setRate} />
              <InputField label="Loan Term (Years)" placeholder="30" onChange={setYears} />
              <InputField label="Extra Repayment (Optional)" prefix="$" placeholder="200" onChange={setExtraRepayment} />
              <InputField label="Fees Included in Repayment" prefix="$" placeholder="0" onChange={setFees} />

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">Repayment Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]">
                  <option value="monthly">Monthly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="flex flex-col gap-[8px]">
                <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">Repayment Type</label>
                <select value={repaymentType} onChange={(e) => setRepaymentType(e.target.value)} className="h-[48px] px-4 border border-[#E2E8F0] rounded-[8px]">
                  <option value="principal_interest">Principal & Interest</option>
                  <option value="interest_only">Interest Only</option>
                </select>
              </div>

              <InputField label="Combined monthly income after tax" prefix="$" placeholder="10,000" onChange={setIncome} />
              <InputField label="Monthly household living expenses (Excl. Mortgage)" prefix="$" placeholder="2,000" onChange={setExpenses} />
            </div>

            <button onClick={handleCalculate} className="mt-[32px] w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors">
              CALCULATE
            </button>

            {/* Outputs */}
            {/* {result.repayment && (
              <div className="mt-6 bg-[#F0F4F8] p-4 rounded-lg">
                <p>Loan Amount: ${loanAmount.toLocaleString()}</p>
                <p>Deposit Amount: ${depositAmount.toLocaleString()}</p>
                <p>Deposit %: {depositPercent}%</p>
                <p>LVR: {lvr}%</p>
                <p>Repayment Amount: ${result.repayment.toFixed(2)} / {frequency}</p>
                <p>Total Amount Repaid: ${result.totalRepaid.toFixed(2)}</p>
                <p>Total Interest Paid: ${result.totalInterest.toFixed(2)}</p>
                <p>Number of Repayments: {result.numberOfRepayments}</p>
                <p>Estimated Payoff Date: {payoffDate}</p>
                <p>Interest Saved from Extra Repayments: ${savings}</p>
                <p>Time Saved from Extra Repayments: {yearsSaved} years</p>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1 text-left text-sm">Year</th>
                        <th className="border px-2 py-1 text-left text-sm">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{row.year}</td>
                          <td className="border px-2 py-1">${row.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )} */}

            <div className="mt-[24px] pt-[20px] border-t border-[#E2E8F0]">
              <p className="text-[12px] text-[#808895] leading-[15px] text-center">
                We have used a test rate of 6.80% has been used to calculate these results. This calculator is intended to provide you with an indication only and is based on the limited information provided by you. It does not constitute an offer of finance from Swish. All loans are subject to lenders normal lending criteria, terms, and conditions, and it is important to note that fees may apply and that interest rates are subject to change.
              </p>
            </div>
          </div>

          {/* Right Panel: Chart */}
        <Chart
  chartData={chartData.map((row) => ({
    year: row.year,
    bank: row.balance,
    swish: row.balance - savings, // or any Swish projection
  }))}
  savings={savings}
  yearsSaved={yearsSaved}
/>
        </div>
      </div>
    </div>
  );
}