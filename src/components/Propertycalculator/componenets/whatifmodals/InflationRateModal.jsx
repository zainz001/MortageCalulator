import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function InflationRateModal({
  isOpen,
  onClose,
  activeModalType,
  inflationRate, setInflationRate,
  rentalIncomeRate, setRentalIncomeRate,
  rentalExpenseRate, setRentalExpenseRate,
  taxableIncomeRate, setTaxableIncomeRate,
  livingExpensesRate, setLivingExpensesRate
}) {
  const [startYear, setStartYear] = useState(1);
  const [cpiAverage, setCpiAverage] = useState("3.00");
  const [cpiYears, setCpiYears] = useState(Array(30).fill("3.00"));

  const [indexedVars, setIndexedVars] = useState({
    rentalIncome: { indexed: true, fromYear: "1", avgRate: "3.00", linked: true },
    rentalExpenses: { indexed: true, fromYear: "1", avgRate: "3.00", linked: true },
    taxableIncome: { indexed: true, fromYear: "1", avgRate: "3.00", linked: true },
    livingExpenses: { indexed: true, fromYear: "1", avgRate: "3.00", linked: true },
  });

  const VAR_LABELS = {
    rentalIncome: "Rental income",
    rentalExpenses: "Rental expenses",
    taxableIncome: "Taxable income",
    livingExpenses: "Living expenses"
  };

  useEffect(() => {
    if (isOpen) {
      setStartYear(1);
      const initialAvg = inflationRate || "3.00";
      setCpiAverage(initialAvg);
      setCpiYears(Array(30).fill(initialAvg));

      setIndexedVars({
        rentalIncome: { indexed: true, fromYear: "1", avgRate: rentalIncomeRate || "3.00", linked: true },
        rentalExpenses: { indexed: true, fromYear: "1", avgRate: rentalExpenseRate || "3.00", linked: true },
        taxableIncome: { indexed: true, fromYear: "1", avgRate: taxableIncomeRate || "3.00", linked: true },
        livingExpenses: { indexed: true, fromYear: "1", avgRate: livingExpensesRate || "3.00", linked: true },
      });
    }
  }, [isOpen, inflationRate, rentalIncomeRate, rentalExpenseRate, taxableIncomeRate, livingExpensesRate]);

  if (!isOpen) return null;

  const handleNextYear = () => setStartYear((prev) => Math.min(prev + 1, 26));
  const handlePrevYear = () => setStartYear((prev) => Math.max(prev - 1, 1));
  const handleFastForward = () => setStartYear((prev) => Math.min(prev + 5, 26));
  const handleFastRewind = () => setStartYear((prev) => Math.max(prev - 5, 1));

  const handleVarChange = (key, field, value) => {
    setIndexedVars(prev => {
      const updated = { ...prev, [key]: { ...prev[key], [field]: value } };
      if (field === 'linked' && value === true) updated[key].avgRate = cpiAverage;
      return updated;
    });
  };

  const handleCpiAverageChange = (val) => {
    setCpiAverage(val);
    setCpiYears(Array(30).fill(val));
    setIndexedVars(prev => {
      const nextVars = { ...prev };
      Object.keys(nextVars).forEach(key => {
        if (nextVars[key].linked) nextVars[key].avgRate = val;
      });
      return nextVars;
    });
  };

  const handleCpiYearChange = (actualIndex, value) => {
    const newYears = [...cpiYears];
    newYears[actualIndex] = value;
    setCpiYears(newYears);
  };

  const handleSave = () => {
    setInflationRate(cpiAverage);
    setRentalIncomeRate(indexedVars.rentalIncome.avgRate);
    setRentalExpenseRate(indexedVars.rentalExpenses.avgRate);
    setTaxableIncomeRate(indexedVars.taxableIncome.avgRate);
    setLivingExpensesRate(indexedVars.livingExpenses.avgRate);
    onClose();
  };

  const modalTitles = {
    inflationRate: "Inflation Rate",
    rentalIncomeRate: "Rental Income Indexed Rate",
    rentalExpenseRate: "Rental Expense Indexed Rate",
    taxableIncomeRate: "Taxable Income Indexed Rate",
    livingExpensesRate: "Living Expenses Indexed Rate",
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[12px] shadow-2xl w-full max-w-[620px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh] font-sans">

        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">
            {modalTitles[activeModalType] || "Inflation Rate"}
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[20px] font-bold transition-colors">&times;</button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6">

          {/* TOP SECTION: CPI Rate Timeline (Now using fieldset to match bottom section) */}
          <fieldset className="border border-[#CBD5E1] rounded-[8px] bg-white relative">
            <legend className="px-2 text-[12px] font-bold text-[#64748B] ml-3 uppercase tracking-tight">CPI Rate Timeline</legend>
            
            <div className="overflow-x-auto p-4 pt-2">
              {/* THE FIX: min-w matches the bottom table so they scroll exactly together */}
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[90px_85px_repeat(5,1fr)] gap-2 items-center text-[12px] font-bold text-[#64748B] mb-2 border-b border-slate-50 pb-2">
                  <div className="text-left text-[#1E293B]">Category</div>
                  <div className="text-center">Average</div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="text-center">{startYear + i}yr</div>
                  ))}
                </div>

                <div className="grid grid-cols-[90px_85px_repeat(5,1fr)] gap-2 items-center">
                  <div className="text-[13px] font-medium text-[#1E293B]">CPI Rate:</div>
                  
                  {/* Average Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={cpiAverage}
                      onChange={(e) => handleCpiAverageChange(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="w-full border border-[#0052CC] bg-[#EBF4FF] rounded-[4px] px-1.5 py-1.5 text-right font-bold text-[#0052CC] text-[13px] outline-none"
                    />
                    <span className="absolute right-1 top-2 text-[9px] text-blue-400">%</span>
                  </div>

                  {/* 5 Year Timeline */}
                  {[...Array(5)].map((_, i) => {
                    const actualIndex = startYear - 1 + i;
                    return (
                      <div key={actualIndex} className="relative">
                        <input
                          type="text"
                          value={cpiYears[actualIndex] || ""}
                          onChange={(e) => handleCpiYearChange(actualIndex, e.target.value.replace(/[^0-9.]/g, ''))}
                          className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1.5 text-right text-[13px] text-[#1E293B] outline-none focus:border-[#0052CC] bg-white"
                        />
                        <span className="absolute right-1 top-2 text-[9px] text-gray-400">%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </fieldset>

          {/* BOTTOM SECTION: Indexed Variables */}
          <fieldset className="border border-[#CBD5E1] rounded-[8px] bg-white relative">
            <legend className="px-2 text-[12px] font-bold text-[#64748B] ml-3 uppercase tracking-tight">Indexed Variables</legend>

            <div className="overflow-x-auto p-4 pt-2">
              {/* THE FIX: Same min-w as above ensures visual alignment */}
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[140px_70px_85px_100px_70px] gap-3 items-end text-[11px] font-bold text-[#64748B] text-center mb-3 border-b border-slate-50 pb-2">
                  <div className="text-left">VARIABLE</div>
                  <div>INDEXED</div>
                  <div>FROM YR</div>
                  <div>AVG RATE</div>
                  <div>LINKED</div>
                </div>

                <div className="flex flex-col gap-3">
                  {Object.keys(indexedVars).map((key) => (
                    <div key={key} className="grid grid-cols-[140px_70px_85px_100px_70px] gap-3 items-center text-[13px] text-[#1E293B]">
                      <div className="text-left font-medium">{VAR_LABELS[key]}</div>

                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={indexedVars[key].indexed}
                          onChange={(e) => handleVarChange(key, 'indexed', e.target.checked)}
                          className="w-4 h-4 accent-[#0052CC] cursor-pointer"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={indexedVars[key].fromYear}
                          onChange={(e) => handleVarChange(key, 'fromYear', e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full border border-[#CBD5E1] rounded-[4px] px-1 py-1.5 text-center text-[13px] focus:border-[#0052CC] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                          disabled={!indexedVars[key].indexed}
                        />
                        <span className="absolute right-1 top-1.5 text-[9px] text-gray-400">yr</span>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={indexedVars[key].avgRate}
                          onChange={(e) => handleVarChange(key, 'avgRate', e.target.value.replace(/[^0-9.]/g, ''))}
                          className="w-full border border-[#CBD5E1] rounded-[4px] px-1 py-1.5 text-right text-[13px] focus:border-[#0052CC] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                          disabled={!indexedVars[key].indexed || indexedVars[key].linked}
                        />
                        <span className="absolute right-1 top-1.5 text-[9px] text-gray-400">%</span>
                      </div>

                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={indexedVars[key].linked}
                          onChange={(e) => handleVarChange(key, 'linked', e.target.checked)}
                          className="w-4 h-4 accent-[#0052CC] cursor-pointer"
                          disabled={!indexedVars[key].indexed}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Footer Panel */}
        <div className="px-4 py-4 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-4">
            <button className="h-9 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] font-bold text-[#1E293B] shadow-sm hover:bg-slate-50">?</button>

            <div className="flex items-center gap-1">
              <button onClick={handleFastRewind} disabled={startYear === 1} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] font-bold disabled:opacity-30 hover:bg-slate-50 transition-colors">&lt;&lt;</button>
              <button onClick={handlePrevYear} disabled={startYear === 1} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] font-bold disabled:opacity-30 hover:bg-slate-50 transition-colors">&lt;</button>
              <button onClick={handleNextYear} disabled={startYear >= 26} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] font-bold disabled:opacity-30 hover:bg-slate-50 transition-colors">&gt;</button>
              <button onClick={handleFastForward} disabled={startYear >= 26} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] font-bold disabled:opacity-30 hover:bg-slate-50 transition-colors">&gt;&gt;</button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleSave} className="flex-1 sm:w-[100px] py-2 bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] shadow-md transition-all">OK</button>
            <button onClick={onClose} className="flex-1 sm:w-[100px] py-2 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-gray-50 transition-all">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}