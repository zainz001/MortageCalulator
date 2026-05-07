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
  
  const [stampDuty, setStampDuty] = useState("0");
  const [transferOfTitle, setTransferOfTitle] = useState("90");
  const [conveyancing, setConveyancing] = useState("3750");
  const [otherCostsList, setOtherCostsList] = useState([]);
  const [taxStatus, setTaxStatus] = useState("capital");

  const otherCostsTotal = otherCostsList.reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);

  const total =
    (parseFloat(stampDuty) || 0) +
    (parseFloat(transferOfTitle) || 0) +
    (parseFloat(conveyancing) || 0) +
    otherCostsTotal;

  useEffect(() => {
    if (isOpen && purchaseCosts && parseFloat(purchaseCosts) > 0) {
      if (Math.abs(parseFloat(purchaseCosts) - total) > 0.01) {
        setConveyancing(purchaseCosts.toString());
        setStampDuty("0");
        setTransferOfTitle("0");
        setOtherCostsList([]); 
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, purchaseCosts]);

  if (!isOpen) return null;

  const handleOk = () => {
    setPurchaseCosts(total.toString());
    onClose();
  };

  const handleResetScales = () => {
    setStampDuty("");
    setTransferOfTitle("90");
    setConveyancing("3750");
    setOtherCostsList([]); 
  };

  const handleAddCost = () => {
    setOtherCostsList([...otherCostsList, { id: Date.now(), name: "", amount: "" }]);
  };

  const handleUpdateCost = (id, field, value) => {
    setOtherCostsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCost = (id) => {
    setOtherCostsList((prev) => prev.filter((item) => item.id !== id));
  };

  return ReactDOM.createPortal(
    /* THE FIX: Added p-4 to prevent the modal from touching the screen glass on mobile */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      
      {/* THE FIX: Changed w-[480px] to w-full max-w-[480px] and added max-h-[95vh] */}
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[480px] flex flex-col border border-[#CBD5E1] overflow-hidden max-h-[95vh]">

        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Purchase Costs</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body - Added overflow-y-auto to allow scrolling on mobile */}
        <div className="p-4 overflow-y-auto">

          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative mb-4">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Purchase Costs</span>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3">Purchase price:</span>
                <span className="w-[100px] sm:w-[120px] text-right font-bold text-[#1E293B] text-[13px] px-2 shrink-0">
                  {parseFloat(propertyValue || 0).toLocaleString("en-NZ")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3">Stamp duty:</span>
                <div className="w-[100px] sm:w-[120px] shrink-0">
                  <InputField value={stampDuty} onChange={setStampDuty} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3">Transfer of title:</span>
                <div className="w-[100px] sm:w-[120px] shrink-0">
                  <InputField value={transferOfTitle} onChange={setTransferOfTitle} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3">Conveyancing costs:</span>
                <div className="w-[100px] sm:w-[120px] shrink-0">
                  <InputField value={conveyancing} onChange={setConveyancing} />
                </div>
              </div>

              {/* Growable Other Costs Section */}
              <div className="mt-2 pt-3 border-t border-[#F1F5F9]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] text-[#64748B] font-bold pl-1">Other costs:</span>
                  <button 
                    onClick={handleAddCost}
                    className="text-[12px] text-[#0052CC] font-bold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {otherCostsList.map((cost) => (
                    <div key={cost.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Description"
                          value={cost.name}
                          onChange={(e) => handleUpdateCost(cost.id, "name", e.target.value)}
                          className="w-full h-[32px] px-2 border border-[#CBD5E1] rounded-[6px] text-[13px] text-[#1E293B] focus:outline-none focus:border-[#0052CC] transition-colors"
                        />
                      </div>
                      <div className="w-[80px] sm:w-[100px] shrink-0">
                        <InputField
                          placeholder="Amount"
                          value={cost.amount}
                          onChange={(val) => handleUpdateCost(cost.id, "amount", val)}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveCost(cost.id)}
                        className="text-[#EF4444] font-bold text-[16px] w-[24px] h-[24px] flex items-center justify-center hover:bg-[#FEF2F2] rounded-[4px] transition-colors shrink-0"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {otherCostsList.length === 0 && (
                    <span className="text-[11px] text-[#94A3B8] italic pl-1">No additional costs added.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F1F5F9]">
                <span className="text-[13px] font-bold text-[#1E293B] flex-1 text-left sm:text-right pr-3">Total purchase costs:</span>
                <span className="w-[100px] sm:w-[120px] text-right font-bold text-[#1E293B] text-[14px] px-2 shrink-0">
                  {total.toLocaleString("en-NZ")}
                </span>
              </div>
            </div>
          </div>

          {/* THE FIX: Changed to flex-col sm:flex-row so boxes stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-3 pt-4 bg-white relative">
               <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Tax Status</span>
               <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" name="taxStatus" checked={taxStatus === "capital"} onChange={() => setTaxStatus("capital")} className="text-[#0052CC]" /> Capital cost
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" name="taxStatus" checked={taxStatus === "revenue"} onChange={() => setTaxStatus("revenue")} className="text-[#0052CC]" /> Revenue cost
                  </label>
               </div>
            </div>

            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-3 pt-4 bg-white relative flex flex-col items-center justify-center">
               <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Stamp Duty Scales</span>
               <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer mb-3 w-full pl-2">
                 <input type="checkbox" className="rounded border-[#CBD5E1] text-[#0052CC]" /> Uses Qld5
               </label>
               <button onClick={handleResetScales} className="px-4 py-1.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-[4px] text-[12px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors w-full">
                 Reset Scales
               </button>
            </div>
          </div>
        </div>

        {/* Footer - flex-row justify-between with stretching buttons on mobile */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px] shrink-0">
          <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors font-bold shadow-sm">
            ?
          </button>
          <div className="flex gap-2">
             <button onClick={handleOk} className="px-5 sm:px-6 py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] transition-colors shadow-sm">OK</button>
             <button onClick={onClose} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}