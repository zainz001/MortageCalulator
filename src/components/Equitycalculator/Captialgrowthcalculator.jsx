import React, { useState, useMemo } from "react";
import InputField from "../inputField"; 
import { calculateCapitalGrowth } from "../../helpers/equityHelpers"; 

const BRAND_THEMES = {
  opes: {
    panelLeftBg: "bg-[#F8F8F8]", panelRightBg: "bg-[#F1EEF9]",
    textPrimary: "text-[#23303B]", textSecondary: "text-[#64748B]", textHighlight: "text-[#5B3E96]",
    border: "border-[#E2E8F0]", buttonBg: "bg-[#5B3E96]", buttonHover: "hover:bg-[#4a327a]",
    accent: "accent-[#5B3E96]"
  },
  staircase: {
    panelLeftBg: "bg-slate-50", panelRightBg: "bg-blue-50",
    textPrimary: "text-slate-900", textSecondary: "text-slate-600", textHighlight: "text-[#0052CC]", 
    border: "border-slate-200", buttonBg: "bg-[#0052CC]", buttonHover: "hover:bg-[#0040A0]",
    accent: "accent-[#0052CC]"
  }
};

export default function CapitalGrowthCalculator({ brand = "opes" }) {
  const theme = BRAND_THEMES[brand] || BRAND_THEMES.opes;

  const [homeValue, setHomeValue] = useState("800000");
  const [growthRate, setGrowthRate] = useState(5);
  const [years, setYears] = useState(15);

  const toNum = (val) => {
    if (!val) return 0;
    const n = parseFloat(String(val).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const results = useMemo(() => {
    return calculateCapitalGrowth(toNum(homeValue), growthRate, years);
  }, [homeValue, growthRate, years]);

  const formatCurrency = (value) => "$" + value.toLocaleString("en-NZ", { maximumFractionDigits: 0 });

  return (
    <div className="bg-white flex items-center justify-center p-2 md:p-4">
      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-4 md:gap-5">
        
        {/* Inputs */}
        <div className={`flex-1 ${theme.panelLeftBg} rounded-[16px] p-6 md:p-8 flex flex-col gap-6`}>
          <h3 className={`text-[20px] md:text-[24px] font-bold ${theme.textPrimary}`}>
            Capital growth calculator
          </h3>

          <InputField label="Your property's value *" prefix="$" value={homeValue} onChange={setHomeValue} />

          {/* Growth Rate Slider */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-between items-center">
              <label className={`text-[14px] ${theme.textSecondary} font-medium`}>Rate of Capital Growth</label>
              <span className={`font-bold ${theme.textHighlight}`}>{growthRate}%</span>
            </div>
            <input 
              type="range" min="0" max="10" step="0.25" 
              value={growthRate} onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme.accent} bg-gray-200`}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>5%</span><span>10%</span>
            </div>
          </div>

          {/* Years Slider */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-between items-center">
              <label className={`text-[14px] ${theme.textSecondary} font-medium`}>Over How Many Years</label>
              <span className={`font-bold ${theme.textHighlight}`}>{years} Years</span>
            </div>
            <input 
              type="range" min="1" max="30" step="1" 
              value={years} onChange={(e) => setYears(parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme.accent} bg-gray-200`}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 Year</span><span>15 Years</span><span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className={`flex-1 ${theme.panelRightBg} rounded-[16px] p-6 md:p-8 flex flex-col justify-center`}>
          <div className="bg-white rounded-[12px] p-6 shadow-sm text-center">
            <h4 className={`text-[16px] ${theme.textSecondary} font-semibold mb-2`}>
              Value of the property in {years} Years:
            </h4>
            <p className={`text-[36px] font-bold ${theme.textHighlight} mb-6`}>
              {formatCurrency(results.futureValue)}
            </p>
            
            <div className={`border-t ${theme.border} pt-6`}>
              <h4 className={`text-[14px] ${theme.textSecondary} mb-1`}>Your property could increase in value by:</h4>
              <p className={`text-[20px] font-bold ${theme.textPrimary}`}>
                {formatCurrency(results.increase)}
              </p>
            </div>

            <button className={`mt-8 w-full ${theme.buttonBg} ${theme.buttonHover} text-white font-bold py-3.5 rounded-[8px] transition-colors`}>
              Talk to an Adviser About Buying an Investment Property
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}