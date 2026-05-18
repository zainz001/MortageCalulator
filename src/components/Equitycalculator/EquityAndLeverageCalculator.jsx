import React, { useState, useMemo } from "react";
import InputField from "../inputField"; // Adjust path as needed
import { calculateEquityAndBorrowing } from "../../helpers/equityHelpers"; 

export default function EquityAndLeverageCalculator() {
  // --- Inputs ---
  const [homeValue, setHomeValue] = useState("800000");
  const [mortgage, setMortgage] = useState("500000");
  const [savings, setSavings] = useState("0");
  const [propertyType, setPropertyType] = useState("new_build");

  // Helper to safely parse inputs
  const toNum = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const n = parseFloat(String(val).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  // Auto-calculate results whenever inputs change
  const results = useMemo(() => {
    return calculateEquityAndBorrowing({
      homeValue: toNum(homeValue),
      mortgage: toNum(mortgage),
      savings: toNum(savings),
      propertyType,
    });
  }, [homeValue, mortgage, savings, propertyType]);

  // Currency formatter
  const formatCurrency = (value) => {
    return "$" + value.toLocaleString("en-NZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full">
        
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-stretch">
          {/* Left Column: Inputs */}
          <div className="flex-1 bg-[var(--theme-left-bg)] rounded-[16px] p-6 md:p-8 flex flex-col">
            <h3 className="text-[20px] md:text-[24px] font-bold text-[var(--theme-text-primary)] mb-[32px] leading-snug">
              Equity and leverage calculator
            </h3>

            <div className="flex flex-col gap-[16px] flex-1">
              <InputField
                label="Your home's value *"
                prefix="$"
                value={homeValue}
                onChange={setHomeValue}
              />
              <InputField
                label="Your mortgage *"
                prefix="$"
                value={mortgage}
                onChange={setMortgage}
              />
              <InputField
                label="Savings *"
                prefix="$"
                tooltip="Any cash savings you want to use toward a deposit."
                value={savings}
                onChange={setSavings}
              />

              <div className="flex flex-col gap-[8px] pt-4">
                <label className="text-[13px] md:text-[14px] text-[var(--theme-text-secondary)] font-medium">
                  What sort of property do you want to buy?
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="h-[48px] px-4 border border-[var(--theme-border)] rounded-[8px] bg-white focus:outline-none focus:border-[var(--theme-highlight)] focus:ring-1 focus:ring-[var(--theme-highlight)] transition-colors"
                >
                  <option value="new_build">New Build Investment Property</option>
                  <option value="holiday_home">Holiday Home</option>
                  <option value="existing">Existing Investment Property</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex-1 bg-[var(--theme-right-bg)] rounded-[16px] p-6 md:p-8 flex flex-col justify-center">
            
            <div className="bg-white rounded-[12px] p-6 shadow-sm flex flex-col gap-6">
              
              {/* Borrowing Ability (Hero Stat) */}
              <div className="text-center border-b border-[var(--theme-border)] pb-6">
                <h4 className="text-[14px] text-[var(--theme-text-secondary)] font-semibold mb-2">Borrowing Ability:</h4>
                <p className="text-[32px] font-bold text-[var(--theme-highlight)]">
                  {formatCurrency(results.borrowingAbility)}
                </p>
                <p className="text-[12px] text-[var(--theme-text-secondary)] mt-2 px-4">
                  Based on a {results.depositRequirementPercentage}% deposit requirement for this property type.
                </p>
              </div>

              {/* Total Equity */}
              <div>
                <h4 className="text-[16px] font-bold text-[var(--theme-text-primary)] mb-1">
                  Your Equity: {formatCurrency(results.totalEquity)}
                </h4>
                <p className="text-[13px] text-[var(--theme-text-secondary)] leading-relaxed">
                  This is the equity / wealth that you have within your home + any savings.
                </p>
              </div>

              {/* Useable Equity */}
              <div>
                <h4 className="text-[16px] font-bold text-[var(--theme-text-primary)] mb-1">
                  Your 'Useable Equity': {formatCurrency(results.useableEquity)}
                </h4>
                <p className="text-[13px] text-[var(--theme-text-secondary)] leading-relaxed">
                  This is the equity within your home ( + any savings) which can be used for purchasing investments. Banks require you to keep 20% equity in your own home.
                </p>
              </div>

              {/* Call to Action */}
              <button className="mt-4 w-full bg-[var(--theme-button)] hover:bg-[var(--theme-button-hover)] text-white font-bold py-3.5 rounded-[8px] transition-colors shadow-sm hover:shadow-md">
                Talk to an Adviser About Buying an Investment Property
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}