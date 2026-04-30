import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const parseNum = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function InvestorDetailsModal({
  isOpen,
  onClose,
  investorDetails, setInvestorDetails,
  jointWorkIncome, setJointWorkIncome,
  jointWorkDeductions, setJointWorkDeductions,
  taxableIncomeSingle, setTaxableIncomeSingle,
}) {
  // Local State for the modal
  const [investorType, setInvestorType] = useState("Person(s)");
  const [investorName, setInvestorName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Income & Deductions State
  const [invSalary, setInvSalary] = useState("120,000");
  const [partSalary, setPartSalary] = useState("50,000");
  
  const [invOtherInc, setInvOtherInc] = useState("0");
  const [partOtherInc, setPartOtherInc] = useState("0");

  const [invWorkDed, setInvWorkDed] = useState("0");
  const [partWorkDed, setPartWorkDed] = useState("0");

  const [invOtherDed, setInvOtherDed] = useState("0");
  const [partOtherDed, setPartOtherDed] = useState("0");

  useEffect(() => {
    if (isOpen) {
      if (investorDetails === "Company" || investorDetails === "Super Fund") {
        setInvestorType(investorDetails);
      } else {
        setInvestorType("Person(s)");
      }
    }
  }, [isOpen, investorDetails]);

  if (!isOpen) return null;

  // --- Dynamic Labels based on Investor Type ---
  const isPerson = investorType === "Person(s)";
  const isSuper = investorType === "Super Fund";
  
  const sectionTitle = isPerson ? "Work-Related Income & Deductions" : `${investorType} Income & Deductions`;
  const col1Header = isPerson ? "Investor" : investorType;
  const col2Header = isPerson ? "Partner" : "n/a";
  
  const row1Label = isPerson ? "Salary/Wages:" : isSuper ? "Fund contributions:" : "Company income:";
  const row4Label = isPerson ? "Work related:" : isSuper ? "Fund expenses:" : "Company expenses:";
  const finalLabel = isPerson ? "Taxable Work Income:" : isSuper ? "Fund Taxable Income:" : "Company Taxable Income:";

  // --- Calculations (Ignores partner column if not Person) ---
  const actualPartSalary = isPerson ? parseNum(partSalary) : 0;
  const actualPartOtherInc = isPerson ? parseNum(partOtherInc) : 0;
  const actualPartWorkDed = isPerson ? parseNum(partWorkDed) : 0;
  const actualPartOtherDed = isPerson ? parseNum(partOtherDed) : 0;

  const invIncTotal = parseNum(invSalary) + parseNum(invOtherInc);
  const partIncTotal = actualPartSalary + actualPartOtherInc;
  const totalInc = invIncTotal + partIncTotal;

  const invDedTotal = parseNum(invWorkDed) + parseNum(invOtherDed);
  const partDedTotal = actualPartWorkDed + actualPartOtherDed;
  const totalDed = invDedTotal + partDedTotal;

  const invTaxable = invIncTotal - invDedTotal;
  const partTaxable = partIncTotal - partDedTotal;
  const totalTaxable = totalInc - totalDed;

  const handleInputChange = (setter) => (e) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setter(val);
  };

  const handleOk = () => {
    if (setInvestorDetails) setInvestorDetails(investorType);
    if (setJointWorkIncome) setJointWorkIncome(formatVal(totalInc));
    if (setJointWorkDeductions) setJointWorkDeductions(formatVal(totalDed));
    if (setTaxableIncomeSingle) setTaxableIncomeSingle(formatVal(invTaxable));
    onClose();
  };

  // Helper for disabled inputs
  const disabledInputClass = "w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#94A3B8] bg-[#F1F5F9] shadow-none";
  const activeInputClass = "w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC] bg-white";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[600px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Investor's Personal Details</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col gap-5">
          
          {/* Top Row: Type & Details */}
          <div className="flex gap-4">
            {/* Investor Type */}
            <div className="border border-[#CBD5E1] rounded-[6px] p-3 pt-5 bg-white relative w-[140px] flex-shrink-0">
              <span className="absolute -top-2.5 left-2 bg-white px-1 text-[12px] font-bold text-[#64748B]">Investor Type</span>
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                  <input type="radio" checked={investorType === "Person(s)"} onChange={() => setInvestorType("Person(s)")} className="text-[#0052CC]" /> Person(s)
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                  <input type="radio" checked={investorType === "Super Fund"} onChange={() => setInvestorType("Super Fund")} className="text-[#0052CC]" /> Super Fund
                </label>
                <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                  <input type="radio" checked={investorType === "Company"} onChange={() => setInvestorType("Company")} className="text-[#0052CC]" /> Company
                </label>
              </div>
            </div>

            {/* Investor Details Fields */}
            <div className="border border-[#CBD5E1] rounded-[6px] p-3 pt-5 bg-white relative flex-1">
              <span className="absolute -top-2.5 left-2 bg-white px-1 text-[12px] font-bold text-[#64748B]">Investor Details</span>
              <div className="flex flex-col gap-2">
                {[
                  ["Investor:", investorName, setInvestorName],
                  ["Address:", address, setAddress],
                  ["Phone:", phone, setPhone],
                  ["Email:", email, setEmail]
                ].map(([label, val, setter]) => (
                  <div key={label} className="flex items-center">
                    <span className="w-[70px] text-[13px] text-[#1E293B]">{label}</span>
                    <input 
                      type="text" 
                      value={val} 
                      onChange={(e) => setter(e.target.value)}
                      className="flex-1 border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Income & Deductions */}
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
            <span className="absolute -top-2.5 left-2 bg-white px-1 text-[12px] font-bold text-[#64748B]">{sectionTitle}</span>
            
            <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-x-4 gap-y-2 items-center">
              {/* Headers */}
              <div className="font-bold text-[13px] text-[#1E293B]">Assessable Income</div>
              <div className="text-center font-bold text-[13px] text-[#1E293B]">{col1Header}</div>
              <div className="text-center font-bold text-[13px] text-[#1E293B]">{col2Header}</div>
              <div className="text-center font-bold text-[13px] text-[#1E293B]">Total</div>

              {/* Row 1: Salary/Contributions/Company Income */}
              <div className="text-[13px] text-[#1E293B] pl-4">{row1Label}</div>
              <input type="text" value={invSalary} onChange={handleInputChange(setInvSalary)} className={activeInputClass} />
              <input type="text" value={isPerson ? partSalary : "0"} onChange={handleInputChange(setPartSalary)} disabled={!isPerson} className={isPerson ? activeInputClass : disabledInputClass} />
              <div className="text-[13px] text-[#1E293B] text-right pr-2">{formatVal(parseNum(invSalary) + actualPartSalary)}</div>

              {/* Other Income */}
              <div className="text-[13px] text-[#1E293B] pl-4">Other income:</div>
              <input type="text" value={invOtherInc} onChange={handleInputChange(setInvOtherInc)} className={activeInputClass} />
              <input type="text" value={isPerson ? partOtherInc : "0"} onChange={handleInputChange(setPartOtherInc)} disabled={!isPerson} className={isPerson ? activeInputClass : disabledInputClass} />
              <div className="text-[13px] text-[#1E293B] text-right pr-2">{formatVal(parseNum(invOtherInc) + actualPartOtherInc)}</div>

              {/* Total Income */}
              <div className="text-[13px] font-medium text-[#1E293B] pl-4 mt-1">Total Income:</div>
              <div className="text-[13px] text-[#1E293B] text-right pr-2 mt-1">{formatVal(invIncTotal)}</div>
              <div className="text-[13px] text-[#1E293B] text-right pr-2 mt-1">{formatVal(partIncTotal)}</div>
              <div className="text-[13px] text-[#1E293B] text-right pr-2 mt-1">{formatVal(totalInc)}</div>

              {/* Deductions Header */}
              <div className="font-bold text-[13px] text-[#1E293B] mt-3 col-span-4">Allowable Deductions</div>

              {/* Row 4: Work Related / Fund Expenses / Company Expenses */}
              <div className="text-[13px] text-[#1E293B] pl-4">{row4Label}</div>
              <input type="text" value={invWorkDed} onChange={handleInputChange(setInvWorkDed)} className={activeInputClass} />
              <input type="text" value={isPerson ? partWorkDed : "0"} onChange={handleInputChange(setPartWorkDed)} disabled={!isPerson} className={isPerson ? activeInputClass : disabledInputClass} />
              <div className="text-[13px] text-[#1E293B] text-right pr-2">{formatVal(parseNum(invWorkDed) + actualPartWorkDed)}</div>

              {/* Other Deductions */}
              <div className="text-[13px] text-[#1E293B] pl-4">Other deductions:</div>
              <input type="text" value={invOtherDed} onChange={handleInputChange(setInvOtherDed)} className={activeInputClass} />
              <input type="text" value={isPerson ? partOtherDed : "0"} onChange={handleInputChange(setPartOtherDed)} disabled={!isPerson} className={isPerson ? activeInputClass : disabledInputClass} />
              <div className="text-[13px] text-[#1E293B] text-right pr-2">{formatVal(parseNum(invOtherDed) + actualPartOtherDed)}</div>

              {/* Total Deductions */}
              <div className="text-[13px] font-medium text-[#1E293B] pl-4 mt-1">Total Deductions:</div>
              <div className="text-[13px] text-[#1E293B] text-right pr-2 mt-1">{formatVal(invDedTotal)}</div>
              <div className="text-[13px] text-[#1E293B] text-right pr-2 mt-1">{formatVal(partDedTotal)}</div>
              <div className="text-[13px] text-[#1E293B] text-right pr-2 mt-1">{formatVal(totalDed)}</div>

              {/* Final Taxable Income */}
              <div className="text-[13px] font-bold text-[#1E293B] mt-4 col-span-1">{finalLabel}</div>
              <div className="text-[13px] font-bold text-[#1E293B] text-right pr-2 mt-4 col-span-1">{formatVal(invTaxable)}</div>
              <div className="text-[13px] font-bold text-[#1E293B] text-right pr-2 mt-4 col-span-1">{formatVal(partTaxable)}</div>
              <div className="text-[13px] font-bold text-[#1E293B] text-right pr-2 mt-4 col-span-1">{formatVal(totalTaxable)}</div>
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