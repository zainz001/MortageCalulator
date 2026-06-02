import React from "react";

export default function WealthBar({ homeValue, mortgage, savings, useableEquity }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-NZ').format(val);
  
  const totalWealth = homeValue + savings;
  const protectedBuffer = homeValue * 0.20;
  
  // Calculate percentages
  const mortgagePct = (mortgage / totalWealth) * 100;
  const bufferPct = (protectedBuffer / totalWealth) * 100;
  const useablePct = (useableEquity / totalWealth) * 100;
  const savingsPct = savings > 0 ? (savings / totalWealth) * 100 : 0;

  return (
    <div className="bg-white p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 md:border-gray-100/50">
      
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-bold text-[14px] md:text-[18px] text-[#0B1E36] md:text-gray-900 tracking-tight">Where your wealth sits</h3>
        <span className="text-[11px] md:text-[12px] text-[#3B6B88] md:text-gray-500 font-medium">
          <span className="hidden md:inline">Total position</span> <strong className="md:text-gray-900 ml-1">${formatCurrency(totalWealth)}</strong>
        </span>
      </div>

      {/* Stacked Bar */}
      <div className="flex w-full h-11 md:h-10 rounded-xl overflow-hidden mb-5 md:mb-6 shadow-inner border border-gray-100">
        {mortgagePct > 0 && <div style={{ width: `${mortgagePct}%` }} className="bg-[#0B1E36]" />}
        {bufferPct > 0 && <div style={{ width: `${bufferPct}%` }} className="bg-[#3B6B88] md:bg-[#28527A]" />}
        {useablePct > 0 && <div style={{ width: `${useablePct}%` }} className="bg-[#7CB342] md:bg-[#6B9E38]" />}
        {savingsPct > 0 && <div style={{ width: `${savingsPct}%` }} className="bg-[#9CCC65] md:bg-[#8CC63F]" />}
      </div>

      {/* MOBILE LEGEND (Inline Dots) */}
      <div className="md:hidden flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#3B6B88]">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0B1E36]"></span> Mortgage</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B6B88]"></span> 20% buffer</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7CB342]"></span> Useable equity</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9CCC65]"></span> Savings</div>
      </div>

      {/* DESKTOP LEGEND (Grid Layout) */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B1E36]"></span> Mortgage
          </div>
          <p className="font-bold text-gray-900 text-[15px] mb-0.5">${formatCurrency(mortgage)}</p>
          <p className="text-gray-400 text-[11px] font-medium">{mortgagePct.toFixed(0)}%</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[#28527A] uppercase tracking-widest font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#28527A]"></span> Protected Buffer
          </div>
          <p className="font-bold text-gray-900 text-[15px] mb-0.5">${formatCurrency(protectedBuffer)}</p>
          <p className="text-gray-400 text-[11px] font-medium">{bufferPct.toFixed(0)}%</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[#6B9E38] uppercase tracking-widest font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B9E38]"></span> Useable Equity
          </div>
          <p className="font-bold text-gray-900 text-[15px] mb-0.5">${formatCurrency(useableEquity)}</p>
          <p className="text-gray-400 text-[11px] font-medium">{useablePct.toFixed(0)}%</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[#8CC63F] uppercase tracking-widest font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8CC63F]"></span> Savings
          </div>
          <p className="font-bold text-gray-900 text-[15px] mb-0.5">${formatCurrency(savings)}</p>
          <p className="text-gray-400 text-[11px] font-medium">{savingsPct.toFixed(0)}%</p>
        </div>
      </div>

    </div>
  );
}