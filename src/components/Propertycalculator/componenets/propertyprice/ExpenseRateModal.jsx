import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import InputField from "../../../inputField"; // Adjust path if your folder structure differs

export default function ExpenseRateModal({ isOpen, onClose, annualRent, config, onSave }) {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      const amt = parseFloat(String(config.currentAmount).replace(/,/g, '')) || 0;
      setAmount(amt.toString());
      if (annualRent > 0) {
        setRate(((amt / annualRent) * 100).toFixed(2));
      } else {
        setRate("0");
      }
    }
  }, [isOpen, config, annualRent]);

  const handleRateChange = (val) => {
    setRate(val);
    const r = parseFloat(val) || 0;
    setAmount(Math.round(annualRent * (r / 100)).toString());
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    const a = parseFloat(String(val).replace(/,/g, '')) || 0;
    if (annualRent > 0) {
      setRate(((a / annualRent) * 100).toFixed(2));
    }
  };

  const handleOk = () => {
    onSave(config.rowId, amount);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      {/* Added max-h-[95vh] and overflow-hidden to ensure it never gets clipped vertically */}
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[400px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh]">
        
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">
            {config.rowName || "Expense"} (including GST)
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>
        
        {/* Added overflow-y-auto just in case the keyboard pops up on tiny screens */}
        <div className="p-5 overflow-y-auto">
          {/* THE FIX: Added flex-col sm:flex-row so the inputs stack on super narrow phones but stay side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 flex flex-col gap-1 w-full">
              <span className="text-[13px] text-[#64748B] font-bold px-1">{config.rowName || "Amount"}</span>
              <InputField value={amount} onChange={handleAmountChange} />
            </div>
            
            {/* THE FIX: Changed w-[100px] to w-full sm:w-[100px] */}
            <div className="w-full sm:w-[100px] flex flex-col gap-1 shrink-0">
              <span className="text-[13px] text-[#64748B] font-bold px-1">Rate</span>
              <InputField value={rate} onChange={handleRateChange} suffix="%" />
            </div>
          </div>
        </div>
        
        {/* THE FIX: Added flex-col sm:flex-row and flex-1 so buttons stretch to fill the screen on mobile */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-end gap-2 shrink-0">
          <button onClick={handleOk} className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">
            OK
          </button>
          <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
            Cancel
          </button>
        </div>
        
      </div>
    </div>,
    document.body
  );
}