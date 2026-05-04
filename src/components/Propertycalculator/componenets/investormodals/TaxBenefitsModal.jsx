import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

// ---------------------------------------------------------
// DYNAMIC PROGRESSIVE TAX CALCULATOR (Standard Brackets)
// This accurately calculates tax for ANY income amount dynamically.
// ---------------------------------------------------------
const calculateTax = (income) => {
  if (income <= 0) return 0;
  let tax = 0;
  let remaining = income;

  if (remaining > 180000) { tax += (remaining - 180000) * 0.39; remaining = 180000; }
  if (remaining > 70000) { tax += (remaining - 70000) * 0.33; remaining = 70000; }
  if (remaining > 48000) { tax += (remaining - 48000) * 0.30; remaining = 48000; }
  if (remaining > 14000) { tax += (remaining - 14000) * 0.175; remaining = 14000; }
  if (remaining > 0) { tax += remaining * 0.105; }
  
  return tax;
};

export default function TaxBenefitsModal({ 
  isOpen, 
  onClose, 
  initialInvestorTaxable, 
  initialPartnerTaxable,
  initialInvOwnership,
  initialPartOwnership,
  initialOwnershipType,
  autoIndexed,
  indexYear,
  indexRate,
  projections = [] 
}) {
  // Input States
  const [invOwnership, setInvOwnership] = useState("50.00");
  const [partOwnership, setPartOwnership] = useState("50.00");
  const [invTaxable, setInvTaxable] = useState("10,000");
  const [partTaxable, setPartTaxable] = useState("50,000");

  const [propertyCount, setPropertyCount] = useState("1");
  const [ownershipType, setOwnershipType] = useState("joint"); 
  const [personalUse, setPersonalUse] = useState("0.00");
  const [quarantineLosses, setQuarantineLosses] = useState(true);

  const [year, setYear] = useState(1);

  // Sync with parent when opened
  useEffect(() => {
    if (isOpen) {
      setYear(1); 
      if (initialInvestorTaxable) setInvTaxable(initialInvestorTaxable);
      if (initialPartnerTaxable) setPartTaxable(initialPartnerTaxable);
      if (initialInvOwnership) setInvOwnership(initialInvOwnership.replace('%', ''));
      if (initialPartOwnership) setPartOwnership(initialPartOwnership.replace('%', ''));
      if (initialOwnershipType) setOwnershipType(initialOwnershipType);
    }
  }, [isOpen, initialInvestorTaxable, initialPartnerTaxable, initialInvOwnership, initialPartOwnership, initialOwnershipType]);

  const handleOwnershipChange = (type) => {
    setOwnershipType(type);
    if (type === 'single') {
      setInvOwnership("100.00");
      setPartOwnership("0.00");
    } else {
      setInvOwnership("50.00");
      setPartOwnership("50.00");
    }
  };

  const navPrev5 = () => setYear((y) => Math.max(1, y - 5));
  const navPrev1 = () => setYear((y) => Math.max(1, y - 1));
  const navNext1 = () => setYear((y) => Math.min(30, y + 1));
  const navNext5 = () => setYear((y) => Math.min(30, y + 5));

  if (!isOpen) return null;

  // ==========================================
  // TRUE DYNAMIC MATH ENGINE
  // ==========================================
  
  const currentProj = projections[year - 1] || {};
  const invPct = parseNum(invOwnership) / 100;
  const partPct = parseNum(partOwnership) / 100;
  const totalOwnership = (parseNum(invOwnership) + parseNum(partOwnership)).toFixed(2);

  const propCountNum = Math.max(1, parseNum(propertyCount));
  const personalUsePct = parseNum(personalUse) / 100;
  const allowedDeductionPct = 1 - personalUsePct;

  // 1. Personal Income Growth
  const idxYr = parseNum(indexYear) || 1;
  const idxRate = parseNum(indexRate) || 3;
  const growthYears = Math.max(0, year - idxYr);
  const incGrowth = autoIndexed ? Math.pow(1 + idxRate / 100, growthYears) : 1;

  // 2. Current Taxable Income
  const currentInvTaxableNum = parseNum(invTaxable) * incGrowth;
  const currentPartTaxableNum = parseNum(partTaxable) * incGrowth;
  const currentTotalTaxableNum = currentInvTaxableNum + currentPartTaxableNum;

  // 3. Dynamic Rental Income (Multiplied by Number of Properties)
  const baseRentForYear = currentProj.annualGrossRent || (35672 * Math.pow(1.03, year - 1)); // Fallback if no projections passed
  const totalRentalIncNum = baseRentForYear * propCountNum;
  const invRentalIncNum = totalRentalIncNum * invPct;
  const partRentalIncNum = totalRentalIncNum * partPct;

  // 4. Total Income
  const invTotalIncNum = currentInvTaxableNum + invRentalIncNum;
  const partTotalIncNum = currentPartTaxableNum + partRentalIncNum;
  const totalTotalIncNum = currentTotalTaxableNum + totalRentalIncNum;

  // 5. Dynamic Rental Deductions (Multiplied by Properties, Reduced by Personal Use)
  const baseDedForYear = currentProj.deductions || (73903 * Math.pow(0.95, year - 1)); // Fallback if no projections passed
  const totalRentalDedNum = baseDedForYear * propCountNum * allowedDeductionPct;
  const invRentalDedNum = totalRentalDedNum * invPct;
  const partRentalDedNum = totalRentalDedNum * partPct;

  // 6. Calculate Net Rental Profit / Loss
  const invRentalProfit = invRentalIncNum - invRentalDedNum;
  const partRentalProfit = partRentalIncNum - partRentalDedNum;

  // 7. Calculate New Taxable Income based on Quarantine Settings
  let invNewTaxableNum = currentInvTaxableNum;
  let partNewTaxableNum = currentPartTaxableNum;

  if (quarantineLosses) {
    // Quarantined: rental losses cannot offset personal income (profit only)
    invNewTaxableNum += Math.max(0, invRentalProfit);
    partNewTaxableNum += Math.max(0, partRentalProfit);
  } else {
    // Negative Gearing: rental losses actively reduce personal taxable income
    invNewTaxableNum += invRentalProfit;
    partNewTaxableNum += partRentalProfit;
  }
  
  invNewTaxableNum = Math.max(0, invNewTaxableNum);
  partNewTaxableNum = Math.max(0, partNewTaxableNum);
  const totalNewTaxableNum = invNewTaxableNum + partNewTaxableNum;

  // 8. Tax Calculations using the standard Progressive Bracket Calculator
  const invPresTaxNum = calculateTax(currentInvTaxableNum);
  const partPresTaxNum = calculateTax(currentPartTaxableNum);
  const totalPresTaxNum = invPresTaxNum + partPresTaxNum;

  const invNewTaxNum = calculateTax(invNewTaxableNum);
  const partNewTaxNum = calculateTax(partNewTaxableNum);
  const totalNewTaxNum = invNewTaxNum + partNewTaxNum;

  const invTaxSavNum = Math.max(0, invPresTaxNum - invNewTaxNum);
  const partTaxSavNum = Math.max(0, partPresTaxNum - partNewTaxNum);
  const totalTaxSavNum = invTaxSavNum + partTaxSavNum;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[780px] flex flex-col border border-[#CBD5E1] overflow-hidden font-sans transition-all">
        
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Tax Benefits</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-6 flex gap-6 bg-white">
          
          <div className="flex-1 flex flex-col pt-2 text-[13px] text-[#1E293B]">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-end mb-3">
              <div></div>
              <div className="text-center font-medium">Investor</div>
              <div className="text-center font-medium">Partner</div>
              <div className="text-center font-medium">Total</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">Property ownership:</div>
                <div className="relative">
                  <input type="text" value={invOwnership} onChange={(e) => setInvOwnership(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right shadow-sm focus:outline-none focus:border-[#0052CC]" />
                  <span className="absolute right-1.5 top-1 text-[12px] text-gray-500">%</span>
                </div>
                <div className="relative">
                  <input type="text" value={partOwnership} onChange={(e) => setPartOwnership(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right shadow-sm focus:outline-none focus:border-[#0052CC]" />
                  <span className="absolute right-1.5 top-1 text-[12px] text-gray-500">%</span>
                </div>
                <div className="text-center">{totalOwnership}%</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center mt-1">
                <div className="text-right">Current taxable income:</div>
                <div className="text-center">{formatVal(currentInvTaxableNum)}</div>
                <div className="text-center">{formatVal(currentPartTaxableNum)}</div>
                <div className="text-center font-bold">{formatVal(currentTotalTaxableNum)}</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">Rental income:</div>
                <div className="text-center">{formatVal(invRentalIncNum)}</div>
                <div className="text-center">{formatVal(partRentalIncNum)}</div>
                <div className="text-center">{formatVal(totalRentalIncNum)}</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">Total income:</div>
                <div className="text-center">{formatVal(invTotalIncNum)}</div>
                <div className="text-center">{formatVal(partTotalIncNum)}</div>
                <div className="text-center">{formatVal(totalTotalIncNum)}</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">Rental deductions:</div>
                <div className="text-center">{formatVal(invRentalDedNum)}</div>
                <div className="text-center">{formatVal(partRentalDedNum)}</div>
                <div className="text-center">{formatVal(totalRentalDedNum)}</div>
              </div>

              <div className="h-4"></div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">New taxable income:</div>
                <div className="text-center">{formatVal(invNewTaxableNum)}</div>
                <div className="text-center">{formatVal(partNewTaxableNum)}</div>
                <div className="text-center font-bold">{formatVal(totalNewTaxableNum)}</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">Present tax:</div>
                <div className="text-center">{formatVal(invPresTaxNum)}</div>
                <div className="text-center">{formatVal(partPresTaxNum)}</div>
                <div className="text-center">{formatVal(totalPresTaxNum)}</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">New tax:</div>
                <div className="text-center">{formatVal(invNewTaxNum)}</div>
                <div className="text-center">{formatVal(partNewTaxNum)}</div>
                <div className="text-center">{formatVal(totalNewTaxNum)}</div>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="text-right">Tax savings:</div>
                <div className="text-center">{formatVal(invTaxSavNum)}</div>
                <div className="text-center">{formatVal(partTaxSavNum)}</div>
                <div className="text-center">{formatVal(totalTaxSavNum)}</div>
              </div>

              <div className="h-6"></div>

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-center font-bold text-[14px]">
                <div className="text-right text-[#1E293B]">Tax credits:</div>
                <div className="text-center text-[#1E293B]">{formatVal(invTaxSavNum)}</div>
                <div className="text-center text-[#1E293B]">{formatVal(partTaxSavNum)}</div>
                <div className="text-center text-[#1E293B]">{formatVal(totalTaxSavNum)}</div>
              </div>
            </div>
          </div>

          <div className="w-[240px] flex flex-col gap-4">
            <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 relative">
              <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Properties</legend>
              <div className="flex items-center justify-between mt-2 text-[13px] text-[#1E293B]">
                <span>Number:</span>
                <input type="text" value={propertyCount} onChange={(e) => setPropertyCount(e.target.value.replace(/[^0-9]/g, ''))} className="w-[80px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-right shadow-sm focus:outline-none focus:border-[#0052CC]" />
              </div>
            </fieldset>

            <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 relative">
              <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Property Ownership</legend>
              <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                  <input type="radio" name="tbOwnership" checked={ownershipType === "single"} onChange={() => handleOwnershipChange("single")} className="w-3.5 h-3.5 accent-[#0052CC]" />
                  <span>Single name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                  <input type="radio" name="tbOwnership" checked={ownershipType === "joint"} onChange={() => handleOwnershipChange("joint")} className="w-3.5 h-3.5 accent-[#0052CC]" />
                  <span>Joint names</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="border border-[#CBD5E1] rounded-[6px] px-4 pb-4 pt-1 relative flex-1">
              <legend className="px-2 text-[13px] font-bold text-[#1E293B]">Tax Options</legend>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between text-[13px] text-[#1E293B]">
                  <span>Personal use:</span>
                  <div className="relative">
                    <input type="text" value={personalUse} onChange={(e) => setPersonalUse(e.target.value.replace(/[^0-9.]/g, ''))} className="w-[80px] border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-right shadow-sm focus:outline-none focus:border-[#0052CC]" />
                    <span className="absolute right-1.5 top-1 text-[12px] text-gray-500">%</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1E293B]">
                  <input type="checkbox" checked={quarantineLosses} onChange={(e) => setQuarantineLosses(e.target.checked)} className="w-3.5 h-3.5 text-[#0052CC] border-[#CBD5E1] rounded-[2px]" />
                  <span>Quarantine tax losses</span>
                </label>
              </div>
            </fieldset>
          </div>

        </div>
        
        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#1E293B] font-bold mr-1 w-[70px]">Year: <span className="ml-1">{year}yr</span></span>
            
            <div className="flex items-center gap-1.5">
              <button onClick={navPrev5} disabled={year === 1} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&lt;&lt;</button>
              <button onClick={navPrev1} disabled={year === 1} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&lt;</button>
              <button onClick={navNext1} disabled={year === 30 || (projections.length > 0 && year === projections.length)} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&gt;</button>
              <button onClick={navNext5} disabled={year >= 26 || (projections.length > 0 && year >= projections.length - 4)} className="w-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm disabled:opacity-50">&gt;&gt;</button>
            </div>

            <button className="ml-4 py-1.5 px-3 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
              ?
            </button>
            <button className="py-1.5 px-4 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm">
              Report
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#0047B3] transition-colors shadow-sm">
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