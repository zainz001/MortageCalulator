import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function InflationRateModal({ 
  isOpen, 
  onClose,
  activeModalType,
  // Props from parent calculator
  inflationRate, setInflationRate,
  rentalIncomeRate, setRentalIncomeRate,
  rentalExpenseRate, setRentalExpenseRate,
  taxableIncomeRate, setTaxableIncomeRate,
  livingExpensesRate, setLivingExpensesRate
}) {
  const [startYear, setStartYear] = useState(1);
  
  // Local state for the modal's complex UI
  const [cpiAverage, setCpiAverage] = useState("3.00");
  
  // FIX 1: Store 30 years of data instead of just 5 so pagination works
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

  // Sync parent state into modal when opened
  useEffect(() => {
    if (isOpen) {
      setStartYear(1);
      const initialAvg = inflationRate || "3.00";
      setCpiAverage(initialAvg);
      setCpiYears(Array(30).fill(initialAvg)); // Fill all 30 years with the incoming average
      
      setIndexedVars({
        rentalIncome: { indexed: true, fromYear: "1", avgRate: rentalIncomeRate || "3.00", linked: true },
        rentalExpenses: { indexed: true, fromYear: "1", avgRate: rentalExpenseRate || "3.00", linked: true },
        taxableIncome: { indexed: true, fromYear: "1", avgRate: taxableIncomeRate || "3.00", linked: true },
        livingExpenses: { indexed: true, fromYear: "1", avgRate: livingExpensesRate || "3.00", linked: true },
      });
    }
  }, [isOpen, inflationRate, rentalIncomeRate, rentalExpenseRate, taxableIncomeRate, livingExpensesRate]);

  if (!isOpen) return null;

  // Handlers
  const handleNextYear = () => setStartYear((prev) => Math.min(prev + 1, 26));
  const handlePrevYear = () => setStartYear((prev) => Math.max(prev - 1, 1));
  const handleFastForward = () => setStartYear((prev) => Math.min(prev + 5, 26));
  const handleFastRewind = () => setStartYear((prev) => Math.max(prev - 5, 1));

  const handleVarChange = (key, field, value) => {
    setIndexedVars(prev => {
      const updated = { ...prev, [key]: { ...prev[key], [field]: value } };
      
      // If "Linked to CPI" is checked, force the avgRate to match CPI
      if (field === 'linked' && value === true) {
        updated[key].avgRate = cpiAverage;
      }
      return updated;
    });
  };

  // FIX 2: When Average changes, update ALL 30 years to match
  const handleCpiAverageChange = (val) => {
    setCpiAverage(val);
    setCpiYears(Array(30).fill(val)); // Auto-fill the entire timeline
    
    setIndexedVars(prev => {
      const nextVars = { ...prev };
      Object.keys(nextVars).forEach(key => {
        if (nextVars[key].linked) {
          nextVars[key].avgRate = val;
        }
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

  // Dynamic Title based on which button was clicked
  const modalTitles = {
    inflationRate: "Inflation Rate",
    rentalIncomeRate: "Rental Income Indexed Rate",
    rentalExpenseRate: "Rental Expense Indexed Rate",
    taxableIncomeRate: "Taxable Income Indexed Rate",
    livingExpensesRate: "Living Expenses Indexed Rate",
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden font-sans">
        
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">
            {modalTitles[activeModalType] || "Inflation Rate"}
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-6 bg-white flex flex-col">
          
          {/* Top Section: CPI Rate Timeline */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-center text-[13px] text-[#1E293B]">
              <div className="w-[80px] font-bold">Year</div>
              <div className="w-[80px] text-center font-bold text-[#64748B]">Average</div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-1 text-center font-bold text-[#64748B]">{startYear + i}yr</div>
              ))}
            </div>

            <div className="flex gap-3 items-center text-[13px] text-[#1E293B]">
              <div className="w-[80px]">CPI Rate:</div>
              <div className="w-[80px] relative">
                <input 
                  type="text" 
                  value={cpiAverage} 
                  onChange={(e) => handleCpiAverageChange(e.target.value.replace(/[^0-9.]/g, ''))} 
                  className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-right shadow-sm focus:outline-none focus:border-[#0052CC] font-medium" 
                />
                <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
              </div>
              
              {/* Renders exactly 5 inputs based on the startYear offset */}
              {[...Array(5)].map((_, i) => {
                const actualIndex = startYear - 1 + i;
                return (
                  <div key={actualIndex} className="flex-1 relative">
                    <input 
                      type="text" 
                      value={cpiYears[actualIndex] || ""} 
                      onChange={(e) => handleCpiYearChange(actualIndex, e.target.value.replace(/[^0-9.]/g, ''))} 
                      className={`w-full border rounded-[4px] px-2 py-1.5 text-right shadow-sm focus:outline-none focus:border-[#0052CC] ${actualIndex === 0 ? 'border-[#0052CC] bg-[#EBF4FF]' : 'border-[#CBD5E1]'}`} 
                    />
                    <span className="absolute right-1.5 top-1.5 text-[12px] text-gray-500">%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Section: Indexed Variables */}
          <fieldset className="border border-[#CBD5E1] rounded-[6px] px-5 pb-5 pt-2 mt-6 relative">
            <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Indexed Variables</legend>
            
            <div className="grid grid-cols-[120px_70px_80px_100px_90px] gap-4 items-end mt-2 text-[12px] font-bold text-[#64748B] text-center mb-3">
              <div className="text-left"></div>
              <div>Indexed</div>
              <div>From<br/>Year</div>
              <div>Average<br/>Rate</div>
              <div>Linked<br/>to CPI</div>
            </div>

            <div className="flex flex-col gap-3">
              {Object.keys(indexedVars).map((key) => (
                <div key={key} className="grid grid-cols-[120px_70px_80px_100px_90px] gap-4 items-center text-[13px] text-[#1E293B]">
                  <div className="text-left">{VAR_LABELS[key]}</div>
                  
                  <div className="flex justify-center">
                    <input 
                      type="checkbox" 
                      checked={indexedVars[key].indexed} 
                      onChange={(e) => handleVarChange(key, 'indexed', e.target.checked)} 
                      className="w-3.5 h-3.5 accent-[#0052CC] rounded-[2px]" 
                    />
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      value={indexedVars[key].fromYear} 
                      onChange={(e) => handleVarChange(key, 'fromYear', e.target.value.replace(/[^0-9]/g, ''))} 
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-center shadow-sm focus:outline-none focus:border-[#0052CC] disabled:bg-gray-100 disabled:text-gray-400" 
                      disabled={!indexedVars[key].indexed}
                    />
                    <span className="absolute right-1.5 top-1 text-[12px] text-gray-500">yr</span>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      value={indexedVars[key].avgRate} 
                      onChange={(e) => handleVarChange(key, 'avgRate', e.target.value.replace(/[^0-9.]/g, ''))} 
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-right shadow-sm focus:outline-none focus:border-[#0052CC] disabled:bg-gray-100 disabled:text-gray-400" 
                      disabled={!indexedVars[key].indexed || indexedVars[key].linked}
                    />
                    <span className="absolute right-1.5 top-1 text-[12px] text-gray-500">%</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <input 
                      type="checkbox" 
                      checked={indexedVars[key].linked} 
                      onChange={(e) => handleVarChange(key, 'linked', e.target.checked)} 
                      className="w-3.5 h-3.5 accent-[#0052CC] rounded-[2px]" 
                      disabled={!indexedVars[key].indexed}
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

        </div>
        
        {/* Footer Controls */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <div className="flex items-center">
            <button className="py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-bold">
              ?
            </button>
            
            <div className="flex items-center gap-1.5 ml-6">
              <button onClick={handleFastRewind} disabled={startYear === 1} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&lt;&lt;</button>
              <button onClick={handlePrevYear} disabled={startYear === 1} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&lt;</button>
              <button onClick={handleNextYear} disabled={startYear >= 26} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&gt;</button>
              <button onClick={handleFastForward} disabled={startYear >= 26} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&gt;&gt;</button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>
            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}