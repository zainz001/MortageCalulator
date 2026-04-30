import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const parseNum = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function HomeLoanDetailsModal({
  isOpen,
  onClose,
  principalResidence, setPrincipalResidence,
  amountOwing, setAmountOwing,
  homeLoanRepayments, setHomeLoanRepayments
}) {
  // Local state for the modal
  const [homeValue, setHomeValue] = useState("900,000");
  const [owing, setOwing] = useState("630,000");
  const [interest, setInterest] = useState("6.50");
  const [monthlyPayment, setMonthlyPayment] = useState("4,861");

  // Sync with parent state when opened
  useEffect(() => {
    if (isOpen) {
      setHomeValue(principalResidence || "0");
      setOwing(amountOwing || "0");
      
      // Derive monthly payment from annual total
      const annual = parseNum(homeLoanRepayments);
      setMonthlyPayment(annual > 0 ? formatVal(annual / 12) : "0");
    }
  }, [isOpen, principalResidence, amountOwing, homeLoanRepayments]);

  if (!isOpen) return null;

  // Auto-calculate the annual total based on the monthly input
  const annualTotal = parseNum(monthlyPayment) * 12;

  const handleInputChange = (setter) => (e) => {
    // Allows numbers and commas
    const val = e.target.value.replace(/[^0-9,.]/g, '');
    setter(val);
  };

  const handleOk = () => {
    // Send data back to parent
    if (setPrincipalResidence) setPrincipalResidence(homeValue);
    if (setAmountOwing) setAmountOwing(owing);
    if (setHomeLoanRepayments) setHomeLoanRepayments(formatVal(annualTotal));
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[400px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Home Loan Details</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col gap-4 items-center bg-white">
          
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            {/* Home Value */}
            <div className="flex items-center gap-3">
              <div className="w-[110px] text-[13px] text-[#1E293B] text-right font-medium">Home Value</div>
              <input 
                type="text" 
                value={homeValue} 
                onChange={handleInputChange(setHomeValue)} 
                className="w-[120px] border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" 
              />
            </div>

            {/* Amount Owing */}
            <div className="flex items-center gap-3">
              <div className="w-[110px] text-[13px] text-[#1E293B] text-right font-medium">Amount owing:</div>
              <input 
                type="text" 
                value={owing} 
                onChange={handleInputChange(setOwing)} 
                className="w-[120px] border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" 
              />
            </div>

            {/* Loan Interest */}
            <div className="flex items-center gap-3">
              <div className="w-[110px] text-[13px] text-[#1E293B] text-right font-medium">Loan Interest</div>
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={interest} 
                  onChange={handleInputChange(setInterest)} 
                  className="w-[90px] border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" 
                />
                <span className="text-[13px] text-[#1E293B]">%</span>
              </div>
            </div>

            {/* Loan Payments */}
            <div className="flex items-center gap-3">
              <div className="w-[110px] text-[13px] text-[#1E293B] text-right font-medium">Loan Payments</div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={monthlyPayment} 
                  onChange={handleInputChange(setMonthlyPayment)} 
                  className="w-[90px] border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" 
                />
                <span className="text-[13px] text-[#64748B]">/mth</span>
              </div>
            </div>

            {/* Annual Total */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-[110px] text-[13px] text-[#1E293B] text-right font-medium">Annual total:</div>
              <div className="flex items-center gap-2 pl-1">
                <span className="text-[13px] font-bold text-[#1E293B]">{formatVal(annualTotal)}</span>
                <span className="text-[13px] text-[#64748B]">/year</span>
              </div>
            </div>

          </div>

        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-center gap-3 rounded-b-[8px]">
          <button onClick={handleOk} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
          <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
        </div>

      </div>
    </div>,
    document.body
  );
}