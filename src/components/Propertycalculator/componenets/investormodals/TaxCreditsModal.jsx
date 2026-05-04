import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import TaxBenefitsModal from "./TaxBenefitsModal"; 

const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function TaxCreditsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  investorIncome, // <-- Received safely from Parent Component
  partnerIncome,  // <-- Received safely from Parent Component
  projections 
}) {
  const [calcMethod, setCalcMethod] = useState("taxable"); 
  const [marginalRate, setMarginalRate] = useState("");
  const [ownershipType, setOwnershipType] = useState("single"); 
  const [investorOwnership, setInvestorOwnership] = useState("100.00%");
  const [partnerOwnership, setPartnerOwnership] = useState("0.00%");

  // Local state for the modal's input fields
  const [investorAssessable, setInvestorAssessable] = useState("");
  const [partnerAssessable, setPartnerAssessable] = useState("");
  const [investorTaxable, setInvestorTaxable] = useState("");
  const [partnerTaxable, setPartnerTaxable] = useState("");

  const [autoIndexed, setAutoIndexed] = useState(true);
  const [indexYear, setIndexYear] = useState("1yr");
  const [indexRate, setIndexRate] = useState("3.00%");

  const [currentYear, setCurrentYear] = useState(1);
  const [isTaxBenefitsModalOpen, setIsTaxBenefitsModalOpen] = useState(false);

  // Wires the Parent's Income Data directly into this Modal when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentYear(1); 
      
      const invVal = investorIncome || "120,000";
      const partVal = partnerIncome || "50,000";

      setInvestorAssessable(invVal);
      setInvestorTaxable(invVal);

      if (ownershipType === "joint") {
        setPartnerAssessable(partVal);
        setPartnerTaxable(partVal);
      } else {
        setPartnerAssessable("0");
        setPartnerTaxable("0");
      }
    }
  }, [isOpen, investorIncome, partnerIncome, ownershipType]);

  // Handles Ownership toggle logic
  useEffect(() => {
    if (ownershipType === "single") {
      setInvestorOwnership("100.00%");
      setPartnerOwnership("0.00%");
      setPartnerAssessable("0");
      setPartnerTaxable("0");
    } else if (ownershipType === "joint") {
      setInvestorOwnership("50.00%");
      setPartnerOwnership("50.00%");
      setPartnerAssessable(partnerIncome || "50,000");
      setPartnerTaxable(partnerIncome || "50,000");
    }
  }, [ownershipType, partnerIncome]);

  if (!isOpen) return null;

  const handleNextYear = () => setCurrentYear(prev => Math.min(prev + 1, 30));
  const handlePrevYear = () => setCurrentYear(prev => Math.max(prev - 1, 1));
  const handleFastForward = () => setCurrentYear(prev => Math.min(prev + 5, 30));
  const handleFastRewind = () => setCurrentYear(prev => Math.max(prev - 5, 1));

  const startIdxYear = parseNum(indexYear) || 1;
  const rateVal = parseNum(indexRate) / 100;
  const yearsOfGrowth = Math.max(0, currentYear - startIdxYear);
  const growthFactor = autoIndexed ? Math.pow(1 + rateVal, yearsOfGrowth) : 1;

  const displayInvTaxable = formatVal(parseNum(investorTaxable) * growthFactor);
  const displayPartTaxable = formatVal(parseNum(partnerTaxable) * growthFactor);
  const displayTotalTaxable = formatVal((parseNum(investorTaxable) + parseNum(partnerTaxable)) * growthFactor);

  const handleInput = (setter) => (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '');
    setter(val);
  };

  const handleOk = () => {
    if (onSave) onSave(displayTotalTaxable); 
    onClose();
  };

  return (
    <>
      {ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[580px] flex flex-col border border-[#CBD5E1] overflow-hidden font-sans">
            
            <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
              <h2 className="text-[14px] font-bold text-[#1E293B]">Tax Credits</h2>
              <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
            </div>

            <div className="p-6 flex flex-col gap-4 bg-white">
              <div className="flex gap-4">
                <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 flex-1 relative">
                  <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Tax Credit Calculation</legend>
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                      <input type="radio" name="calcMethod" checked={calcMethod === "marginal"} onChange={() => setCalcMethod("marginal")} className="w-3.5 h-3.5 accent-[#0052CC]" />
                      <span>Use marginal rate</span>
                      <input type="text" value={marginalRate} onChange={(e) => setMarginalRate(e.target.value)} className="ml-auto w-14 border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC] disabled:bg-gray-100 disabled:text-gray-400" disabled={calcMethod !== "marginal"} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                      <input type="radio" name="calcMethod" checked={calcMethod === "taxable"} onChange={() => setCalcMethod("taxable")} className="w-3.5 h-3.5 accent-[#0052CC]" />
                      <span>Use taxable income</span>
                    </label>
                    <div className="mt-1 text-[13px] text-[#64748B]">Scale:</div>
                  </div>
                </fieldset>

                <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 flex-1 relative">
                  <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Ownership</legend>
                  <div className="flex justify-between mt-2">
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                        <input type="radio" name="ownershipType" checked={ownershipType === "single"} onChange={() => setOwnershipType("single")} className="w-3.5 h-3.5 accent-[#0052CC]" />
                        <span>Single name</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                        <input type="radio" name="ownershipType" checked={ownershipType === "joint"} onChange={() => setOwnershipType("joint")} className="w-3.5 h-3.5 accent-[#0052CC]" />
                        <span>Joint names</span>
                      </label>
                      <button onClick={() => setIsTaxBenefitsModalOpen(true)} className="mt-2 py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[12px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm">
                        Tax Benefits
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-[12px] text-[#64748B] font-medium mb-1">Property Ownership</div>
                      <div className="flex items-center gap-3 text-[13px] text-[#1E293B]">
                        <span>Investor</span>
                        <input type="text" value={investorOwnership} onChange={(e) => setInvestorOwnership(e.target.value)} className="w-[72px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" />
                      </div>
                      <div className="flex items-center gap-3 text-[13px] text-[#1E293B]">
                        <span>Partner</span>
                        <input type="text" value={partnerOwnership} onChange={(e) => setPartnerOwnership(e.target.value)} className="w-[72px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-5 pt-1 relative mt-1">
                <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Taxable Income Year {currentYear}</legend>
                <div className="grid grid-cols-[1fr_90px_90px_90px] gap-3 mt-3 items-center text-right text-[13px] text-[#1E293B]">
                  <div></div>
                  <div className="text-center font-medium">Investor</div>
                  <div className="text-center font-medium">Partner</div>
                  <div className="text-center font-medium">Total</div>

                  <div className="text-left">Assessable Income</div>
                  <div>{formatVal(parseNum(investorAssessable) * growthFactor)}</div>
                  <div>{formatVal(parseNum(partnerAssessable) * growthFactor)}</div>
                  <div>{formatVal((parseNum(investorAssessable) + parseNum(partnerAssessable)) * growthFactor)}</div>

                  <div className="text-left">Allowable Deductions</div>
                  <div>0</div><div>0</div><div>0</div>

                  <div className="text-left mt-2">
                    <button className="py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[12px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm">
                      Current Taxable Income
                    </button>
                  </div>
                  <div className="mt-2">
                    <input type="text" value={displayInvTaxable} onChange={handleInput(setInvestorTaxable)} className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" />
                  </div>
                  <div className="mt-2">
                    <input type="text" value={displayPartTaxable} onChange={handleInput(setPartnerTaxable)} className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" />
                  </div>
                  <div className="mt-2 font-bold text-[14px] text-[#0052CC]">{displayTotalTaxable}</div>
                </div>
              </fieldset>

              <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 relative mt-1">
                <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Taxable Income Projections</legend>
                <div className="flex items-center gap-3 mt-3 ml-4">
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                    <input type="checkbox" checked={autoIndexed} onChange={(e) => setAutoIndexed(e.target.checked)} className="w-3.5 h-3.5 accent-[#0052CC] rounded-[2px]" />
                    <span>Auto-indexed from year:</span>
                  </label>
                  <input type="text" value={indexYear} onChange={(e) => setIndexYear(e.target.value)} className="w-14 border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-center text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" />
                  <span className="ml-2 text-[13px] text-[#1E293B]">at a rate of:</span>
                  <input type="text" value={indexRate} onChange={(e) => setIndexRate(e.target.value)} className="w-[72px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]" />
                </div>
              </fieldset>
            </div>
            
            <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
              <div className="flex items-center gap-3">
                <button className="py-1.5 px-4 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Advanced</button>
                <button className="py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">?</button>
                <span className="ml-2 mr-3 text-[13px] text-[#1E293B] font-bold w-[70px]">Year: {currentYear}yr</span>
                
                <div className="flex items-center gap-1.5">
                  <button onClick={handleFastRewind} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&lt;&lt;</button>
                  <button onClick={handlePrevYear} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&lt;</button>
                  <button onClick={handleNextYear} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&gt;</button>
                  <button onClick={handleFastForward} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">&gt;&gt;</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleOk} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">OK</button>
                <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <TaxBenefitsModal 
        isOpen={isTaxBenefitsModalOpen} 
        onClose={() => setIsTaxBenefitsModalOpen(false)} 
        initialInvestorTaxable={displayInvTaxable} // Uses the currently navigated year's value
        initialPartnerTaxable={displayPartTaxable} 
        initialInvOwnership={investorOwnership}
        initialPartOwnership={partnerOwnership}
        initialOwnershipType={ownershipType}
        autoIndexed={autoIndexed}
        indexYear={indexYear}
        indexRate={indexRate}
        projections={projections} 
      />
    </>
  );
}