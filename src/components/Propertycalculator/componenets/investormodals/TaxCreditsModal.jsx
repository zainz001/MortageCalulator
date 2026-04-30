import React, { useState } from "react";
import ReactDOM from "react-dom";

export default function TaxCreditsModal({ isOpen, onClose }) {
  // State for Tax Credit Calculation
  const [calcMethod, setCalcMethod] = useState("taxable"); // 'marginal' or 'taxable'
  const [marginalRate, setMarginalRate] = useState("");

  // State for Ownership
  const [ownershipType, setOwnershipType] = useState("single"); // 'single' or 'joint'
  const [investorOwnership, setInvestorOwnership] = useState("100.00%");
  const [partnerOwnership, setPartnerOwnership] = useState("0.00%");

  // State for Taxable Income
  const [investorTaxable, setInvestorTaxable] = useState("120,000");
  const [partnerTaxable, setPartnerTaxable] = useState("50,000");

  // State for Projections
  const [autoIndexed, setAutoIndexed] = useState(true);
  const [indexYear, setIndexYear] = useState("1yr");
  const [indexRate, setIndexRate] = useState("3.00%");

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[580px] flex flex-col border border-[#CBD5E1] overflow-hidden font-sans">
        
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Tax Credits</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4 bg-white">
          
          {/* Top Row: Calculation & Ownership */}
          <div className="flex gap-4">
            
            {/* Tax Credit Calculation */}
            <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 flex-1 relative">
              <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Tax Credit Calculation</legend>
              <div className="flex flex-col gap-3 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                  <input 
                    type="radio" 
                    name="calcMethod" 
                    checked={calcMethod === "marginal"} 
                    onChange={() => setCalcMethod("marginal")}
                    className="w-3.5 h-3.5 accent-[#0052CC]"
                  />
                  <span>Use marginal rate</span>
                  <input 
                    type="text" 
                    value={marginalRate}
                    onChange={(e) => setMarginalRate(e.target.value)}
                    className="ml-auto w-14 border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC] disabled:bg-gray-100 disabled:text-gray-400"
                    disabled={calcMethod !== "marginal"}
                  />
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                  <input 
                    type="radio" 
                    name="calcMethod" 
                    checked={calcMethod === "taxable"} 
                    onChange={() => setCalcMethod("taxable")}
                    className="w-3.5 h-3.5 accent-[#0052CC]"
                  />
                  <span>Use taxable income</span>
                </label>
                <div className="mt-1 text-[13px] text-[#64748B]">Scale:</div>
              </div>
            </fieldset>

            {/* Ownership */}
            <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 flex-1 relative">
              <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Ownership</legend>
              <div className="flex justify-between mt-2">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                    <input 
                      type="radio" 
                      name="ownershipType" 
                      checked={ownershipType === "single"} 
                      onChange={() => setOwnershipType("single")}
                      className="w-3.5 h-3.5 accent-[#0052CC]"
                    />
                    <span>Single name</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                    <input 
                      type="radio" 
                      name="ownershipType" 
                      checked={ownershipType === "joint"} 
                      onChange={() => setOwnershipType("joint")}
                      className="w-3.5 h-3.5 accent-[#0052CC]"
                    />
                    <span>Joint names</span>
                  </label>
                  <button className="mt-2 py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[12px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm">
                    Tax Benefits
                  </button>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="text-[12px] text-[#64748B] font-medium mb-1">Property Ownership</div>
                  <div className="flex items-center gap-3 text-[13px] text-[#1E293B]">
                    <span>Investor</span>
                    <input 
                      type="text" 
                      value={investorOwnership}
                      onChange={(e) => setInvestorOwnership(e.target.value)}
                      className="w-[72px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#1E293B]">
                    <span>Partner</span>
                    <input 
                      type="text" 
                      value={partnerOwnership}
                      onChange={(e) => setPartnerOwnership(e.target.value)}
                      className="w-[72px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Taxable Income Year 1 */}
          <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-5 pt-1 relative mt-1">
            <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Taxable Income Year 1</legend>
            
            <div className="grid grid-cols-[1fr_90px_90px_90px] gap-3 mt-3 items-center text-right text-[13px] text-[#1E293B]">
              {/* Headers */}
              <div></div>
              <div className="text-center font-medium">Investor</div>
              <div className="text-center font-medium">Partner</div>
              <div className="text-center font-medium">Total</div>

              {/* Row 1 */}
              <div className="text-left">Assessable Income</div>
              <div>120,000</div>
              <div>50,000</div>
              <div>170,000</div>

              {/* Row 2 */}
              <div className="text-left">Allowable Deductions</div>
              <div>0</div>
              <div>0</div>
              <div>0</div>

              {/* Row 3 */}
              <div className="text-left mt-2">
                <button className="py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[12px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm">
                  Current Taxable Income
                </button>
              </div>
              <div className="mt-2">
                <input 
                  type="text" 
                  value={investorTaxable}
                  onChange={(e) => setInvestorTaxable(e.target.value)}
                  className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                />
              </div>
              <div className="mt-2">
                <input 
                  type="text" 
                  value={partnerTaxable}
                  onChange={(e) => setPartnerTaxable(e.target.value)}
                  className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                />
              </div>
              <div className="mt-2 font-bold text-[14px]">170,000</div>
            </div>
          </fieldset>

          {/* Taxable Income Projections */}
          <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 relative mt-1">
            <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Taxable Income Projections</legend>
            <div className="flex items-center gap-3 mt-3 ml-4">
              <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                <input 
                  type="checkbox" 
                  checked={autoIndexed}
                  onChange={(e) => setAutoIndexed(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#0052CC] rounded-[2px]"
                />
                <span>Auto-indexed from year:</span>
              </label>
              <input 
                type="text" 
                value={indexYear}
                onChange={(e) => setIndexYear(e.target.value)}
                className="w-14 border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-center text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
              />
              <span className="ml-2 text-[13px] text-[#1E293B]">at a rate of:</span>
              <input 
                type="text" 
                value={indexRate}
                onChange={(e) => setIndexRate(e.target.value)}
                className="w-[72px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
              />
            </div>
          </fieldset>

        </div>
        
        {/* Footer Area */}
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          
          <div className="flex items-center gap-3">
            <button className="py-1.5 px-4 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
              Advanced
            </button>
            <button className="py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
              ?
            </button>
            <span className="ml-2 mr-3 text-[13px] text-[#1E293B] font-bold">Year: 1yr</span>
            
            {/* Pagination / Arrows */}
            <div className="flex items-center gap-1.5">
              <button className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&lt;&lt;</button>
              <button className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&lt;</button>
              <button className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&gt;</button>
              <button className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&gt;&gt;</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">
              OK
            </button>
            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
              Cancel
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}