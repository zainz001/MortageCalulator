import React, { useState, useEffect } from "react";
import InputField from "../../../inputField";
import ReactDOM from "react-dom";
export default function PurchaseCostsModal({
  isOpen,
  onClose,
  purchaseCosts,
  setPurchaseCosts,
  propertyValue,
}) {
  
  const [stampDuty, setStampDuty] = useState("");
  const [transferOfTitle, setTransferOfTitle] = useState("90");
  const [conveyancing, setConveyancing] = useState("3750");
  const [otherCosts, setOtherCosts] = useState("0");

   const [taxStatus, setTaxStatus] = useState("capital");

  // Calculate the total dynamically
  const total =
    (parseFloat(stampDuty) || 0) +
    (parseFloat(transferOfTitle) || 0) +
    (parseFloat(conveyancing) || 0) +
    (parseFloat(otherCosts) || 0);

  // Sync initial values if purchaseCosts already has a value, otherwise use defaults
  useEffect(() => {
    if (isOpen) {
      if (purchaseCosts && parseFloat(purchaseCosts) > 0) {
        // If a total exists, arbitrarily put it in conveyancing for now,
        // or you could store these break-downs in the main state if needed later.
        setConveyancing(purchaseCosts.toString());
        setStampDuty("0");
        setTransferOfTitle("0");
        setOtherCosts("0");
      }
    }
  }, [isOpen, purchaseCosts]);

  if (!isOpen) return null;

  const handleOk = () => {
    setPurchaseCosts(total.toString());
    onClose();
  };

  const handleResetScales = () => {
    // Reset to screenshot defaults
    setStampDuty("");
    setTransferOfTitle("90");
    setConveyancing("3750");
    setOtherCosts("0");
  };

   return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[480px] flex flex-col border border-[#CBD5E1] overflow-hidden">

        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Purchase Costs</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-4">

          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative mb-4">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Purchase Costs</span>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748B] w-[140px] text-right pr-3">Purchase price:</span>
                <span className="w-[120px] text-right font-bold text-[#1E293B] text-[13px] px-2">
                  {parseFloat(propertyValue || 0).toLocaleString("en-NZ")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748B] w-[140px] text-right pr-3">Stamp duty:</span>
                <div className="w-[120px]">
                  <InputField value={stampDuty} onChange={setStampDuty} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748B] w-[140px] text-right pr-3">Transfer of title:</span>
                <div className="w-[120px]">
                  <InputField value={transferOfTitle} onChange={setTransferOfTitle} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748B] w-[140px] text-right pr-3">Conveyancing costs:</span>
                <div className="w-[120px]">
                  <InputField value={conveyancing} onChange={setConveyancing} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748B] w-[140px] text-right pr-3">Other costs:</span>
                <div className="w-[120px]">
                  <InputField value={otherCosts} onChange={setOtherCosts} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F1F5F9]">
                <span className="text-[13px] font-bold text-[#1E293B] w-[140px] text-right pr-3">Total purchase costs:</span>
                <span className="w-[120px] text-right font-bold text-[#1E293B] text-[14px] px-2">
                  {total.toLocaleString("en-NZ")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-3 pt-4 bg-white relative">
               <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Tax Status</span>
               <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" name="taxStatus" checked={taxStatus === "capital"} onChange={() => setTaxStatus("capital")} className="text-[#0052CC]" /> Capital cost
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" name="taxStatus" checked={taxStatus === "revenue"} onChange={() => setTaxStatus("revenue")} className="text-[#0052CC]" /> Revenue cost (eg. in A.C.T.)
                  </label>
               </div>
            </div>

            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-3 pt-4 bg-white relative flex flex-col items-center justify-center">
               <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Stamp Duty Scales</span>
               <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer mb-3 w-full pl-2">
                 <input type="checkbox" className="rounded border-[#CBD5E1] text-[#0052CC]" /> Uses Qld5
               </label>
               <button onClick={handleResetScales} className="px-4 py-1.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-[4px] text-[12px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors w-full max-w-[120px]">
                 Reset Scales
               </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors font-bold shadow-sm">
            ?
          </button>
          <div className="flex gap-2">
             <button onClick={handleOk} className="px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
             <button onClick={onClose} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
     document.body
  );
}
