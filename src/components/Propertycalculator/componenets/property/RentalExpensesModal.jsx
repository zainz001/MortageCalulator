import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../inputField";
import AnnualSpecialExpensesModal from "./AnnualSpecialExpensesModal";
import RentalIncomeModal from "./RentalIncomeModal"; // <-- ADDED IMPORT
import ReactDOM from "react-dom";
import ExpenseRateModal from "./ExpenseRateModal";

// 1. Default Expenses List
const defaultExpensesList = [
  { id: "1", name: "Agent's commission", amount: "3010" },
  { id: "2", name: "Letting Fees", amount: "700" },
  { id: "3", name: "Council Rates (Estimate)", amount: "3750" },
  { id: "4", name: "Building Insurance", amount: "1875" },
  { id: "5", name: "Residence Society", amount: "1500" },
  { id: "6", name: "Body corporate", amount: "0" },
  { id: "7", name: "Cleaning", amount: "0" }, 

];

export default function RentalExpensesModal({
  isOpen,
  onClose,
  grossRentWeekly,
  setGrossRentWeekly, // <-- ADDED PROP
  propertyValue,
  rentalExpensesPercent,
  setRentalExpensesPercent,
  inflationRate, // <-- ADDED PROP
  rentTimeline, // <-- ADDED PROP
  setRentTimeline // <-- ADDED PROP
}) {
  const [expenses, setExpenses] = useState(defaultExpensesList);
  
  const [isAnnualSpecialModalOpen, setIsAnnualSpecialModalOpen] = useState(false);
  const [isRentalIncomeModalOpen, setIsRentalIncomeModalOpen] = useState(false); // <-- ADDED STATE
  const [rateModalConfig, setRateModalConfig] = useState({ isOpen: false, rowId: null, currentAmount: "0", rowName: "" });

  const prevPercentRef = useRef(rentalExpensesPercent);
  const prevRentRef = useRef(grossRentWeekly);
  const referenceExpensesRef = useRef(defaultExpensesList);

  useEffect(() => {
    if (prevPercentRef.current !== rentalExpensesPercent || prevRentRef.current !== grossRentWeekly) {
      const potentialAnnualRent = (parseFloat(grossRentWeekly) || 0) * 52;
      const targetTotalExpenses = potentialAnnualRent * (parseFloat(rentalExpensesPercent) || 0) / 100;
      
      if (Math.abs(parseFloat(rentalExpensesPercent) - 29.77) < 0.001 && Math.abs(potentialAnnualRent - 36400) < 1) {
          setExpenses(defaultExpensesList);
          referenceExpensesRef.current = defaultExpensesList;
      } 
      else {
          const refTotal = referenceExpensesRef.current.reduce((acc, item) => {
            return acc + (parseFloat(String(item.amount).replace(/,/g, '')) || 0);
          }, 0);

          if (refTotal > 0) {
            setExpenses(prev => {
              let scaled = [...referenceExpensesRef.current];
              let sumOfRoundedParts = 0;
              let largestIdx = 0;
              let largestVal = -1;

              scaled = scaled.map((item, index) => {
                const num = parseFloat(String(item.amount).replace(/,/g, '')) || 0;
                const newRounded = Math.round(targetTotalExpenses * (num / refTotal));
                sumOfRoundedParts += newRounded;

                if (newRounded > largestVal) {
                  largestVal = newRounded;
                  largestIdx = index;
                }

                return { ...item, amount: newRounded.toString() };
              });

              const exactRoundedTarget = Math.round(targetTotalExpenses);
              const driftDiff = exactRoundedTarget - sumOfRoundedParts;
              if (driftDiff !== 0 && scaled[largestIdx]) {
                  scaled[largestIdx].amount = (parseInt(scaled[largestIdx].amount) + driftDiff).toString();
              }

              return scaled;
            });
          }
      }

      prevPercentRef.current = rentalExpensesPercent;
      prevRentRef.current = grossRentWeekly;
    }
  }, [rentalExpensesPercent, grossRentWeekly]); 

  const potentialAnnualRent = (parseFloat(grossRentWeekly) || 0) * 52;
  const actualAnnualRent = potentialAnnualRent * 0.98; // Assuming standard 2% vacancy
  const propVal = parseFloat(propertyValue) || 0;

  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((acc, item) => {
    const cleanVal = String(item.amount).replace(/,/g, '');
    return acc + (parseFloat(cleanVal) || 0);
  }, 0) : 0;

  if (!isOpen) return null;

  const expensesPercent = potentialAnnualRent > 0 ? (totalExpenses / potentialAnnualRent) * 100 : 0;
  const netRent = actualAnnualRent - totalExpenses;
  const netYield = propVal > 0 ? (netRent / propVal) * 100 : 0;

  // --- Handlers ---
  const handleChange = (id, field, val) => {
    setExpenses(prev => {
        const next = prev.map((item) => (item.id === id ? { ...item, [field]: val } : item));
        referenceExpensesRef.current = next; 
        return next;
    });
  };

  const handleRateModalSave = (id, newAmount) => {
    handleChange(id, "amount", newAmount);
  };

  const handleAddCost = () => {
    setExpenses(prev => {
        const next = [...prev, { id: Date.now().toString(), name: "", amount: "" }];
        referenceExpensesRef.current = next;
        return next;
    });
  };

  const handleRemoveCost = (id) => {
    setExpenses(prev => {
        const next = prev.filter(item => item.id !== id);
        referenceExpensesRef.current = next;
        return next;
    });
  };

  const handleOk = () => {
    setRentalExpensesPercent(expensesPercent.toFixed(6).toString());
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[700px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[90vh]">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Rental Expenses</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col md:flex-row gap-4">

          {/* Left Panel: Normal Expenses Growable List */}
          <div className="flex-1  border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Normal Expenses (1st Year)</span>

            <div className="flex justify-end mb-3">
              <button 
                onClick={handleAddCost}
                className="text-[12px] text-[#0052CC] font-bold hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {expenses.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  
                  <div className="flex-1 flex justify-end pr-2">
                    {item.id === "1" ? (
                      <button
                        onClick={() => setRateModalConfig({ isOpen: true, rowId: item.id, currentAmount: item.amount, rowName: item.name })}
                        className="w-full max-w-[180px] h-[35px] px-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-[4px] shadow-sm text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] transition-colors flex items-center justify-end font-medium"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.name}
                        onChange={(e) => handleChange(item.id, "name", e.target.value)}
                        className="w-full max-w-[180px] h-[50px] px-3 border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0052CC] transition-colors text-right"
                      />
                    )}
                  </div>

                  <div className="w-[100px]">
                    <InputField
                      placeholder="0"
                      value={item.amount}
                      onChange={(val) => handleChange(item.id, "amount", val)}
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveCost(item.id)}
                    className="text-[#EF4444] font-bold text-[16px] w-[24px] h-[24px] flex items-center justify-center hover:bg-[#FEF2F2] rounded-[4px] transition-colors shrink-0"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {expenses.length === 0 && (
                <span className="text-[12px] text-[#94A3B8] italic text-center py-2">No expenses added.</span>
              )}

              {/* Total Row */}
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F1F5F9]">
                <span className="text-[13px] font-bold text-[#1E293B] w-[140px] text-right pr-3 flex-1">Total</span>
                <div className="w-[100px] text-right px-2 font-bold text-[#1E293B] text-[14px] pr-[34px]">
                  {Math.round(totalExpenses).toLocaleString("en-NZ")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Indicators & Extra Buttons */}
          <div className="w-full md:w-[220px] flex flex-col gap-4">

            {/* Indicators Box */}
            <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Indicators</span>

              <div className="flex flex-col gap-3">
                {/* THE FIX: Now opens local state, keeping this modal open behind it */}
                <div 
                  className="flex justify-between items-center group cursor-pointer" 
                  onClick={() => setIsRentalIncomeModalOpen(true)}
                  title="Click to edit Rental Income"
                >
                  <span className="text-[13px] text-[#0052CC] font-bold underline decoration-dashed group-hover:text-[#003d99]">Annual Rent</span>
                  <span className="text-[13px] text-[#1E293B] font-medium">{Math.round(potentialAnnualRent).toLocaleString("en-NZ")}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#64748B]">Expenses/rent</span>
                  <span className="text-[13px] text-[#1E293B] font-medium">{expensesPercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#64748B]">Net rent</span>
                  <span className="text-[13px] text-[#1E293B] font-medium">{Math.round(netRent).toLocaleString("en-NZ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#64748B]">Net yield</span>
                  <span className="text-[13px] text-[#1E293B] font-medium">{netYield.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-auto">
           
              <button
                onClick={() => setIsAnnualSpecialModalOpen(true)}
                className="w-full py-1.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-medium"
              >
                Annual & Special Expenses
              </button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors font-bold shadow-sm">?</button>
          <div className="flex gap-2">
            <button onClick={handleOk} className="px-6 py-1.5 border border-[#CBD5E1] bg-[#0052CC] rounded-[4px] text-[13px] text-white font-bold hover:bg-[#003d99] transition-colors shadow-sm">OK</button>
            <button onClick={onClose} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
      
      <AnnualSpecialExpensesModal
        isOpen={isAnnualSpecialModalOpen}
        onClose={() => setIsAnnualSpecialModalOpen(false)}
        baseNormalExpense={totalExpenses}
        inflationRate="3.00"
      />

      <ExpenseRateModal
        isOpen={rateModalConfig.isOpen}
        onClose={() => setRateModalConfig({ ...rateModalConfig, isOpen: false })}
        annualRent={potentialAnnualRent}
        config={rateModalConfig}
        onSave={handleRateModalSave}
      />

      <RentalIncomeModal 
        isOpen={isRentalIncomeModalOpen} 
        onClose={() => setIsRentalIncomeModalOpen(false)} 
        grossRentWeekly={grossRentWeekly} 
        setGrossRentWeekly={setGrossRentWeekly} 
        inflationRate={inflationRate} 
        rentTimeline={rentTimeline} 
        setRentTimeline={setRentTimeline} 
      />
    </div>,
    document.body
  );
}