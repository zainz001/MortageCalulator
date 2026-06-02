import React from "react";

export default function ResultsSection({ results, propertyType }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-NZ').format(val);
  const formatKM = (num) => {
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
    return `$${num}`;
  };

  return (
    <div className="bg-[#0B1E36] text-white px-5 md:p-8 pt-8 pb-14 md:pb-8 w-full rounded-none md:rounded-[24px] shadow-xl shadow-[#0B1E36]/10 relative overflow-hidden">
      
      {/* Desktop Glow Effect */}
      <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-[#6B9E38] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

      <p className="text-[10px] md:text-[11px] font-bold tracking-widest md:tracking-[0.2em] text-[#7CB342] md:text-[#6B9E38] uppercase mb-2 flex items-center gap-2 md:block">
        <span className="md:hidden w-4 h-px bg-[#7CB342]"></span> Indicative Purchasing Power
      </p>
      
      <h2 className="text-[44px] md:text-[64px] font-extrabold text-[#7CB342] mb-1 md:mb-3 tracking-tight">
        ${formatCurrency(results.borrowingAbility)}
      </h2>
      
      <p className="text-[12px] md:text-[13px] text-gray-300 md:text-gray-400 mb-6 md:mb-10 font-medium">
        Based on a {results.depositRequirementPercentage}% deposit for a {propertyType.replace("_", " ")} investment.
      </p>

      {/* MOBILE STATS CARDS */}
      <div className="md:hidden flex gap-2.5">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Equity</p>
          <p className="text-[15px] font-bold text-white tracking-tight">{formatKM(results.totalEquity)}</p>
        </div>
        <div className="flex-1 bg-[#153427]/60 border border-[#235843] rounded-xl p-3">
          <p className="text-[10px] text-[#7CB342] uppercase tracking-widest font-bold mb-1">Useable</p>
          <p className="text-[15px] font-bold text-[#7CB342] tracking-tight">{formatKM(results.useableEquity)}</p>
        </div>
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Deposit</p>
          <p className="text-[15px] font-bold text-white tracking-tight">{formatKM(results.useableEquity)}</p>
        </div>
      </div>

      {/* DESKTOP STATS GRID */}
      <div className="hidden md:grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">Your Equity</p>
          <p className="text-xl font-bold text-white tracking-tight">${formatCurrency(results.totalEquity)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#7CB342] uppercase tracking-widest font-bold mb-1.5">Useable Equity</p>
          <p className="text-xl font-bold text-[#7CB342] tracking-tight">${formatCurrency(results.useableEquity)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">Deposit Available</p>
          <p className="text-xl font-bold text-white tracking-tight">${formatCurrency(results.useableEquity)}</p>
        </div>
      </div>
    </div>
  );
}