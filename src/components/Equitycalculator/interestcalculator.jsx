// import React, { useState, useMemo } from "react";
// import InputField from "../inputField";
// import { calculateInterestOnly } from "../../helpers/equityHelpers"; 

// const BRAND_THEMES = {
//   opes: {
//     panelLeftBg: "bg-[#F8F8F8]", panelRightBg: "bg-[#F1EEF9]",
//     textPrimary: "text-[#23303B]", textSecondary: "text-[#64748B]", textHighlight: "text-[#5B3E96]",
//     border: "border-[#E2E8F0]", buttonBg: "bg-[#5B3E96]", buttonHover: "hover:bg-[#4a327a]",
//   },
//   staircase: {
//     panelLeftBg: "bg-slate-50", panelRightBg: "bg-blue-50",
//     textPrimary: "text-slate-900", textSecondary: "text-slate-600", textHighlight: "text-[#0052CC]", 
//     border: "border-slate-200", buttonBg: "bg-[#0052CC]", buttonHover: "hover:bg-[#0040A0]",
//   }
// };

// export default function InterestOnlyCalculator({ brand = "opes" }) {
//   const theme = BRAND_THEMES[brand] || BRAND_THEMES.opes;

//   const [loanAmount, setLoanAmount] = useState("500000");
//   const [rate, setRate] = useState("6.5");
//   const [frequency, setFrequency] = useState("weekly");

//   const toNum = (val) => {
//     if (!val) return 0;
//     const n = parseFloat(String(val).replace(/,/g, ""));
//     return isNaN(n) ? 0 : n;
//   };

//   const paymentAmount = useMemo(() => {
//     return calculateInterestOnly(toNum(loanAmount), toNum(rate), frequency);
//   }, [loanAmount, rate, frequency]);

//   const formatCurrency = (value) => "$" + value.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

//   return (
//     <div className="bg-white flex items-center justify-center p-2 md:p-4">
//       <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-4 md:gap-5">
        
//         {/* Inputs */}
//         <div className={`flex-1 ${theme.panelLeftBg} rounded-[16px] p-6 md:p-8 flex flex-col gap-4`}>
//           <h3 className={`text-[20px] md:text-[24px] font-bold ${theme.textPrimary} mb-[16px]`}>
//             Interest-only mortgage calculator
//           </h3>

//           <InputField label="Loan Amount *" prefix="$" value={loanAmount} onChange={setLoanAmount} />
//           <InputField label="Annual Interest Rate (%) *" numberMode="decimal" value={rate} onChange={setRate} />
          
//           <div className="flex flex-col gap-[8px] pt-2">
//             <label className={`text-[13px] md:text-[14px] ${theme.textSecondary} font-medium`}>
//               Repayment Frequency
//             </label>
//             <select
//               value={frequency}
//               onChange={(e) => setFrequency(e.target.value)}
//               className={`h-[48px] px-4 border ${theme.border} rounded-[8px] bg-white focus:outline-none focus:ring-1`}
//             >
//               <option value="weekly">Weekly</option>
//               <option value="fortnightly">Fortnightly</option>
//               <option value="monthly">Monthly</option>
//             </select>
//           </div>
//         </div>

//         {/* Results */}
//         <div className={`flex-1 ${theme.panelRightBg} rounded-[16px] p-6 md:p-8 flex flex-col justify-center`}>
//           <div className="bg-white rounded-[12px] p-6 shadow-sm text-center">
            
//             <h4 className={`text-[14px] ${theme.textSecondary} font-semibold mb-2 uppercase tracking-wider`}>
//               Your {frequency} Repayment
//             </h4>
//             <p className={`text-[40px] font-bold ${theme.textHighlight} mb-4`}>
//               {formatCurrency(paymentAmount)}
//             </p>
//             <p className={`text-[13px] ${theme.textSecondary} px-4 leading-relaxed`}>
//               This amount covers only the interest charged on your loan. Your principal balance will not decrease during the interest-only period.
//             </p>

//             <button className={`mt-8 w-full ${theme.buttonBg} ${theme.buttonHover} text-white font-bold py-3.5 rounded-[8px] transition-colors`}>
//               Talk to an Adviser
//             </button>
            
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }