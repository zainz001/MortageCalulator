import React, { useState, useEffect } from "react";
import InputField from "../../../inputField";
import ReactDOM from "react-dom";
export default function BuildingDepreciationModal({
  isOpen,
  onClose,
  propertyValue,
  renovationCosts,
  buildingDepreciation,
  setBuildingDepreciation
}) {
  const [buildingCosts, setBuildingCosts] = useState("");
  const [yearConstructed, setYearConstructed] = useState(new Date().getFullYear().toString());
  const [linkToPrice, setLinkToPrice] = useState(true);
  const [depRate, setDepRate] = useState("0.00");
  const [method, setMethod] = useState("DV");

  const pv = parseFloat(propertyValue) || 0;
  const rc = parseFloat(renovationCosts) || 0;

  // Initialize values when the modal opens
  useEffect(() => {
    if (isOpen) {
      if (linkToPrice && pv > 0 && !buildingCosts) {
        // By default, the legacy app seems to use 70% for the building split
        setBuildingCosts(Math.round(pv * 0.70).toString());
      }
      
      // If we already have a saved depreciation value, we could reverse-calculate the rate here,
      // but for simplicity, we will just let the user edit the rate directly.
    }
  }, [isOpen, pv, linkToPrice, buildingCosts]);

  if (!isOpen) return null;

  // Core Math
  const bc = parseFloat(buildingCosts) || 0;
  const percentOfPrice = pv > 0 ? (bc / pv) * 100 : 0;
  
  const totalDepreciableValue = bc + rc;
  const calculatedDepreciation = totalDepreciableValue * ((parseFloat(depRate) || 0) / 100);

  const handleBuildingCostChange = (val) => {
    setBuildingCosts(val);
  };

  const handleOk = () => {
    // Save the final calculated dollar amount back to the parent component
    if (setBuildingDepreciation) {
      setBuildingDepreciation(Math.round(calculatedDepreciation).toString());
    }
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[640px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Depreciation of Building</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex gap-4">
          
          {/* Left Column: Original Capital Costs */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative flex-1">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Original Capital Costs</span>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1E293B] pr-3">Property price:</span>
                  <span className="text-[13px] text-[#1E293B] w-[100px] text-right pr-2">
                    {pv > 0 ? pv.toLocaleString("en-NZ") : "0"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1E293B] pr-3">Building costs:</span>
                  <div className="w-[100px]">
                    <InputField value={buildingCosts} onChange={handleBuildingCostChange} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1E293B] pr-3">Year constructed:</span>
                  <div className="w-[100px]">
                    <InputField value={yearConstructed} onChange={setYearConstructed} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer font-medium mb-3">
                    <input 
                      type="checkbox" 
                      checked={linkToPrice} 
                      onChange={(e) => setLinkToPrice(e.target.checked)} 
                      className="rounded" 
                    /> 
                    Link costs to property price
                  </label>
                  
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] text-[#1E293B] leading-tight max-w-[130px]">Building costs as a % of property price:</span>
                    <span className="text-[13px] text-[#1E293B]">{percentOfPrice.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Top Right: Capital Allowance */}
            <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Capital Allowance (First Year)</span>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1E293B] pr-3">Renovation costs:</span>
                  <span className="text-[13px] text-[#1E293B]">{rc > 0 ? rc.toLocaleString("en-NZ") : "0"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1E293B] pr-3">Total depreciable value:</span>
                  <span className="text-[13px] text-[#1E293B]">{totalDepreciableValue > 0 ? totalDepreciableValue.toLocaleString("en-NZ") : "0"}</span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-[#1E293B] pr-3">Depreciation rate:</span>
                  <div className="w-[80px]">
                    <InputField value={depRate} onChange={setDepRate} suffix="%" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F1F5F9]">
                  <span className="text-[13px] text-[#1E293B] pr-3">Depreciation of building:</span>
                  <span className="text-[13px] font-bold text-[#1E293B]">
                    {Math.round(calculatedDepreciation).toLocaleString("en-NZ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Right: Depreciation Method */}
            <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Depreciation Method (NZ)</span>
              
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                  <input type="radio" checked={method === "DV"} onChange={() => setMethod("DV")} className="text-[#0052CC]" /> 
                  Diminishing value
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                  <input type="radio" checked={method === "SL"} onChange={() => setMethod("SL")} className="text-[#0052CC]" /> 
                  Straight line
                </label>
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <div className="flex items-center gap-2">
         
          </div>
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