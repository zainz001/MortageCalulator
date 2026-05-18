import React, { useState, useMemo } from "react";
import InputField from "../inputField"; 
import { calculatePropertyInvestment } from "../../helpers/equityHelpers";

export default function PropertyInvestmentCalculator() {
  // --- Inputs ---
  const [propertyValue, setPropertyValue] = useState("600,000");
  const [deposit, setDeposit] = useState("0");
  const [growthRateString, setGrowthRateString] = useState("1"); 
  const [condition, setCondition] = useState("Brand New");
  const [rent, setRent] = useState(500);

  // Helper to safely parse string inputs to numbers
  const toNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  // Adjusted to work with your InputField component safely
  const handleCurrencyChange = (setter) => (val) => {
    const rawString = typeof val === 'object' && val.target ? val.target.value : String(val);
    const cleanValue = rawString.replace(/[^0-9]/g, "");
    
    if (!cleanValue) {
      setter("");
      return;
    }
    
    // Format with commas on the fly
    const formatted = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setter(formatted);
  };

  // Handle manual rate input
  const handleRateInput = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, ""); 
    setGrowthRateString(val);
  };

  // Auto-calculate results
  const results = useMemo(() => {
    return calculatePropertyInvestment({
      propertyValue: toNum(propertyValue),
      deposit: toNum(deposit),
      growthRatePercent: toNum(growthRateString),
      condition,
      weeklyRent: rent,
    });
  }, [propertyValue, deposit, growthRateString, condition, rent]);

  // Round values for exact display matching
  const formatCurrency = (value) => {
    const isNegative = value < 0;
    const rounded = Math.abs(Math.round(value)).toLocaleString("en-NZ");
    return isNegative ? `-$${rounded}` : `$${rounded}`;
  };

  return (
    <div className="bg-white flex items-center justify-center p-2 md:p-4 font-sans min-h-screen">
      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-4 md:gap-5">
        
        {/* LEFT PANEL: Inputs */}
        <div className="flex-[1.1] bg-[var(--theme-left-bg)] rounded-[16px] p-6 md:p-8 flex flex-col gap-6">
          
          <div>
            <h3 className="text-[20px] md:text-[24px] font-bold text-[var(--theme-text-primary)] mb-2">
              Property investment calculator
            </h3>
            <p className="text-[14px] md:text-[15px] text-[var(--theme-text-secondary)] leading-relaxed">
              This calculator forecasts key factors about investment property over 10 years based on standard assumptions.
            </p>
          </div>

          <div className="flex flex-col gap-6 mt-2">
            
            {/* 1. Value of Property */}
            <InputField 
              label="1. Value of The Property *" 
              prefix="$" 
              value={propertyValue} 
              onChange={handleCurrencyChange(setPropertyValue)} 
            />

            {/* 2. Deposit */}
            <InputField 
              label="2. How Much of a Cash Deposit Will You Use? *" 
              prefix="$" 
              value={deposit} 
              onChange={handleCurrencyChange(setDeposit)} 
            />

            {/* 3. Growth Rate (Slider + Manual Input merged into new layout) */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[14px] text-[var(--theme-text-secondary)] font-medium">
                  3. Rate of Capital Growth
                </label>
                {/* Embedded Input inside the label area */}
                <div className="flex items-center gap-1 bg-white border border-[var(--theme-border)] rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-[var(--theme-highlight)] transition-all">
                  <input 
                    type="text" 
                    value={growthRateString} 
                    onChange={handleRateInput}
                    className="w-10 text-right text-[15px] font-bold text-[var(--theme-highlight)] outline-none"
                  />
                  <span className="text-[15px] font-bold text-[var(--theme-highlight)]">%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="15" step="0.5" 
                value={toNum(growthRateString)} 
                onChange={(e) => setGrowthRateString(e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--theme-highlight)] bg-gray-200"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span>
                <span>10%</span>
              </div>
            </div>

            {/* 4. Condition Dropdown */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-[14px] text-[var(--theme-text-secondary)] font-medium">
                4. What is the Condition of the Property?
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border border-[var(--theme-border)] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[var(--theme-highlight)] text-[15px] font-semibold text-[var(--theme-text-primary)] cursor-pointer"
              >
                <option value="Brand New">Brand New</option>
                <option value="New-ish (Built in the last 20 years)">New-ish (Built in the last 20 years)</option>
                <option value="Older than 20 years">Older than 20 years</option>
              </select>
            </div>

            {/* 5. Rent Slider */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[14px] text-[var(--theme-text-secondary)] font-medium">
                  5. What will the Property Rent For?
                </label>
                {/* Embedded Input inside the label area */}
                <div className="flex items-center gap-1 bg-white border border-[var(--theme-border)] rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-[var(--theme-highlight)] transition-all">
                  <span className="text-[15px] font-bold text-[var(--theme-highlight)]">$</span>
                  <input 
                    type="number" 
                    value={rent} 
                    onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                    className="w-14 text-right text-[15px] font-bold text-[var(--theme-highlight)] outline-none"
                  />
                </div>
              </div>
              <input 
                type="range" min="100" max="2000" step="10" 
                value={rent} 
                onChange={(e) => setRent(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--theme-highlight)] bg-gray-200"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$100</span>
                <span>$2K</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Results (White Card Format) */}
        <div className="flex-[0.9] bg-[var(--theme-right-bg)] rounded-[16px] p-6 md:p-8 flex flex-col justify-center">
          <div className="bg-white rounded-[12px] p-6 md:p-8 shadow-sm">
            
            <h4 className="text-[16px] text-[var(--theme-text-secondary)] font-semibold mb-2 text-center">
              Equity in 10 Years:
            </h4>
            <p className="text-[36px] font-bold text-[var(--theme-highlight)] mb-6 text-center tracking-tight">
              {formatCurrency(results.equityIn10Years)}
            </p>

            <div className="border-t border-[var(--theme-border)] pt-6 flex flex-col gap-4">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[var(--theme-text-secondary)] font-medium">Average rent per week:</span>
                <span className="font-bold text-[var(--theme-text-primary)]">{formatCurrency(results.avgRentPerWeek)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[var(--theme-text-secondary)] font-medium">Average expenses per week:</span>
                <span className="font-bold text-[var(--theme-text-primary)]">{formatCurrency(results.avgExpensesPerWeek)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[var(--theme-text-secondary)] font-medium">Average cashflow per week:</span>
                <span className="font-bold text-[var(--theme-text-primary)]">{formatCurrency(results.avgCashflowPerWeek)}</span>
              </div>
              
              <div className="flex justify-between items-center text-[14px] py-2 border-y border-dashed border-gray-200 my-1">
                <span className="text-[var(--theme-text-secondary)] font-medium leading-snug w-1/2">Over 10 Years, This Property is:</span>
                <span className={`font-bold text-right px-3 py-1.5 rounded text-[12px] uppercase tracking-wider ${results.isCashflowPositive ? 'bg-[var(--theme-right-bg)] text-[var(--theme-highlight)]' : 'bg-red-50 text-red-600'}`}>
                  {results.isCashflowPositive ? "CASHFLOW POSITIVE" : "CASHFLOW NEGATIVE"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[var(--theme-text-secondary)] font-medium">Avg equity gain per week:</span>
                <span className="font-bold text-[var(--theme-text-primary)]">{formatCurrency(results.avgEquityGainPerWeek)}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[var(--theme-text-secondary)] font-medium">Average net gain per week:</span>
                <span className="font-bold text-[var(--theme-text-primary)]">{formatCurrency(results.avgNetGainPerWeek)}</span>
              </div>
            </div>

            <button className="mt-8 w-full bg-[var(--theme-button)] hover:bg-[var(--theme-button-hover)] text-white font-bold py-3.5 rounded-[8px] transition-colors">
              Talk to an adviser about buying an investment property
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}