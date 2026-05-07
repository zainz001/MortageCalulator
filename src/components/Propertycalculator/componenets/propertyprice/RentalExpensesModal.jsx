import React, { useState, useEffect, useRef } from "react";
import InputField from "../../../inputField";
import AnnualSpecialExpensesModal from "./AnnualSpecialExpensesModal";
import ReactDOM from "react-dom";

// 1. Move defaults outside so we can reference them easily
const defaultExpenses = {
  agentsCommission: "3010",
  lettingFees: "700",
  rates: "3750",
  insurance: "1875",
  maintenance: "1500",
  bodyCorporate: "0",
  cleaning: "0",
  pestControl: "0",
  mowing: "0",
  otherExpenses: "0"
};

export default function RentalExpensesModal({
  isOpen,
  onClose,
  grossRentWeekly,
  propertyValue,
  rentalExpensesPercent, 
  setRentalExpensesPercent,
}) {
  const [expenses, setExpenses] = useState(defaultExpenses);
  
  const [isAnnualSpecialModalOpen, setIsAnnualSpecialModalOpen] = useState(false);

  const prevPercentRef = useRef(rentalExpensesPercent);
  const prevRentRef = useRef(grossRentWeekly);

  // 2. NEW: We store the 'baseline' distribution in a ref. 
  // This completely stops keystrokes (like typing backspace) from mangling the ratios.
  const referenceExpensesRef = useRef(defaultExpenses);

  useEffect(() => {
    if (prevPercentRef.current !== rentalExpensesPercent || prevRentRef.current !== grossRentWeekly) {
      const potentialAnnualRent = (parseFloat(grossRentWeekly) || 0) * 52;
      const targetTotalExpenses = potentialAnnualRent * (parseFloat(rentalExpensesPercent) || 0) / 100;
      
      // 3. HARD BYPASS: If we are at the exact default state, force the exact default numbers.
      if (Math.abs(parseFloat(rentalExpensesPercent) - 29.77) < 0.001 && Math.abs(potentialAnnualRent - 36400) < 1) {
          setExpenses(defaultExpenses);
          referenceExpensesRef.current = defaultExpenses;
      } 
      // 4. SCALING LOGIC: Scale based on the uncorrupted reference distribution
      else {
          const refTotal = Object.values(referenceExpensesRef.current).reduce((acc, val) => {
            return acc + (parseFloat(String(val).replace(/,/g, '')) || 0);
          }, 0);

          if (refTotal > 0) {
            setExpenses(prev => {
              const scaled = {};
              let sumOfRoundedParts = 0;
              let largestKey = "otherExpenses";
              let largestVal = -1;

              // Scale each item relative to the untouched REFERENCE baseline
              for (let key in referenceExpensesRef.current) {
                const num = parseFloat(String(referenceExpensesRef.current[key]).replace(/,/g, '')) || 0;
                const newRounded = Math.round(targetTotalExpenses * (num / refTotal));
                scaled[key] = newRounded.toString();
                sumOfRoundedParts += newRounded;

                if (newRounded > largestVal) {
                  largestVal = newRounded;
                  largestKey = key;
                }
              }

              // Apply the $1 remainder drift correction to the largest item
              const exactRoundedTarget = Math.round(targetTotalExpenses);
              const driftDiff = exactRoundedTarget - sumOfRoundedParts;
              if (driftDiff !== 0) {
                  scaled[largestKey] = (parseInt(scaled[largestKey]) + driftDiff).toString();
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

  // Calculate Total Expenses
  const totalExpenses = Object.values(expenses).reduce((acc, val) => {
    const cleanVal = String(val).replace(/,/g, '');
    return acc + (parseFloat(cleanVal) || 0);
  }, 0);

  if (!isOpen) return null;

  const expensesPercent = potentialAnnualRent > 0 ? (totalExpenses / potentialAnnualRent) * 100 : 0;
  const netRent = actualAnnualRent - totalExpenses;
  const netYield = propVal > 0 ? (netRent / propVal) * 100 : 0;

  const handleChange = (field, val) => {
    setExpenses(prev => {
        const next = { ...prev, [field]: val };
        // Update the baseline whenever the user manually edits a specific category inside the modal
        referenceExpensesRef.current = next; 
        return next;
    });
  };

  const handleOk = () => {
    setRentalExpensesPercent(expensesPercent.toFixed(6).toString());
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Rental Expenses</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-4">
          <div className="flex gap-4">

            {/* Left Panel: Normal Expenses Grid */}
            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Normal Expenses (1st Year)</span>

              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Agent's commission", key: "agentsCommission" },
                  { label: "Letting fees", key: "lettingFees" },
                  { label: "Rates", key: "rates" },
                  { label: "Insurance", key: "insurance" },
                  { label: "Maintenance", key: "maintenance" },
                  { label: "Body corporate", key: "bodyCorporate" },
                  { label: "Cleaning", key: "cleaning" },
                  { label: "Pest control", key: "pestControl" },
                  { label: "Mowing", key: "mowing" },
                  { label: "Other expenses", key: "otherExpenses" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#64748B] w-[140px] text-right pr-3">{item.label}</span>
                    <div className="w-[100px]">
                      <InputField
                        value={expenses[item.key]}
                        onChange={(val) => handleChange(item.key, val)}
                      />
                    </div>
                  </div>
                ))}

                {/* Total Row */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F1F5F9]">
                  <span className="text-[13px] font-bold text-[#1E293B] w-[140px] text-right pr-3">Total</span>
                  <div className="w-[100px] text-right px-2 font-bold text-[#1E293B] text-[14px]">
                    {Math.round(totalExpenses).toLocaleString("en-NZ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Indicators & Extra Buttons */}
            <div className="w-[180px] flex flex-col gap-4">

              {/* Indicators Box */}
              <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
                <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Indicators</span>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#64748B]">Annual Rent</span>
                    <span className="text-[13px] text-[#1E293B] font-medium">{Math.round(actualAnnualRent).toLocaleString("en-NZ")}</span>
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
                <button className="w-full py-1.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
                  Advanced
                </button>
                <button
                  onClick={() => setIsAnnualSpecialModalOpen(true)}
                  className="w-full py-1.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm"
                >
                  Annual & Special Expenses
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <div className=" text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm"></div>
          <div className="flex gap-2">
            <button onClick={handleOk} className="px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
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
    </div>,
    document.body
  );
}