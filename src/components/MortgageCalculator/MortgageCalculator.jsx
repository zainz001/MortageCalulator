import React, { useState } from "react";
import InputField from "./InputField";
import Chart from "./Chart";
import { calculateMortgage, generateSchedule } from "../../helpers/mortgageHelpers";

export default function MortgageCalculator() {
    const [balance, setBalance] = useState(500000);
    const [years, setYears] = useState(30);
    const [income, setIncome] = useState(10000);
    const [expenses, setExpenses] = useState(2000);

    const [savings, setSavings] = useState(0);
    const [yearsSaved, setYearsSaved] = useState(6);
    const [chartData, setChartData] = useState();

    function handleCalculate() {
        const repayment = calculateMortgage(balance, years, 6.8);
        const totalPaid = repayment * years * 12;
        const interest = totalPaid - balance;

        const swishInterest = interest * 0.65;
        const saved = interest - swishInterest;

        setSavings(Math.round(saved));
        setYearsSaved(Math.round(years * 0.2));

        const schedule = generateSchedule(balance, years, 6.8);
        setChartData(schedule);
    }

    return (
        // Reduced outer padding (p-2 md:p-4) to save screen space
        <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
            <div className="max-w-[1400px] w-full">
                {/* Reduced bottom margin on title */}
                <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] mb-3 md:mb-4">
                    Mortgage Calculator
                </h2>

                {/* Reduced gap between left and right panels */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">

                    {/* Left Panel: Inputs - Reduced padding */}
                    <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-5 md:p-6 flex flex-col">
                        <h3 className="text-sm md:text-base font-bold text-[#23303B] mb-4 md:mb-5 leading-snug">
                            Calculate how much you could save in time and interest if you switched your mortgage to Swish.
                        </h3>

                        {/* Reduced spacing between inputs (space-y-3 md:space-y-4) */}
                        <div className="space-y-3 md:space-y-4 flex-1">
                            <InputField
                                label="Tell us how much you currently owe"
                                prefix="$"
                                placeholder="500,000"
                                onChange={setBalance}
                            />
                            <InputField
                                label="How many years are left on your mortgage?"
                                placeholder="30"
                                onChange={setYears}
                            />
                            <InputField
                                label="What is your combined monthly income after tax?"
                                prefix="$"
                                placeholder="10,000"
                                onChange={setIncome}
                            />
                            <InputField
                                label="What are your monthly household living expenses? (Excl. Mortgage)"
                                prefix="$"
                                placeholder="2,000"
                                onChange={setExpenses}
                            />
                        </div>

                        {/* Reduced button top margin and padding */}
                        <button
                            onClick={handleCalculate}
                            className="mt-4 md:mt-5 bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3 rounded-[8px] transition-colors"
                        >
                            CALCULATE
                        </button>

                        {/* Reduced text top margin */}
                        <p className="text-[12px] text-[#808895] leading-[15px] text-center mt-4">
                            We have used a test rate of 6.80% has been used to calculate these results. This calculator is intended to provide you with an indication only and is based on the limited information provided by you. It does not constitute an offer of finance from Swish. All loans are subject to lenders normal lending criteria, terms, and conditions, and it is important to note that fees may apply and that interest rates are subject to change.
                        </p>
                    </div>

                    {/* Right Panel: Chart */}
                    <Chart chartData={chartData} savings={savings} yearsSaved={yearsSaved} />
                </div>
            </div>
        </div>
    );
}