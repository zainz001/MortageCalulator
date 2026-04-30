import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import AnnualInterestRatesModal from "./AnnualInterestRatesModal";

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function LoanInterestTypeModal({
  isOpen,
  onClose,
  // 1. Accept the props passed from the parent
  loanA,
  setLoanA,
  loanB,
  setLoanB,
  setInterestRate
}) {
  const [masterTotal, setMasterTotal] = useState(0);
  const [splitRate, setSplitRate] = useState(false);
  const [capTaxDeductible, setCapTaxDeductible] = useState(false);
  const [isAnnualRatesOpen, setIsAnnualRatesOpen] = useState(false);

  // 2. REMOVED local useState for loanA and loanB so we use the parent's state directly!

  // 3. Update the useEffect to sync the master total when the modal opens
  useEffect(() => {
    if (isOpen && loanA && loanB) {
      const currentTotal = parseNum(loanA.amount) + parseNum(loanB.amount);
      setMasterTotal(currentTotal);
      
      // Keep split rate toggled on if Loan B has a balance
      if (parseNum(loanB.amount) > 0) {
        setSplitRate(true);
      } else {
        setSplitRate(false);
      }
    }
  }, [isOpen, loanA?.amount, loanB?.amount]);

  if (!isOpen || !loanA || !loanB) return null; // Safety check

  const calcTranche = (loan) => {
    const L = parseNum(loan.amount);
    const R = parseNum(loan.rates[0]) / 100;
    const type = loan.type;

    const prefix = type.toLowerCase();
    const startYr = parseNum(loan[`${prefix}From`]) || 1;
    const endYr = parseNum(loan[`${prefix}To`]) || 40;
    const years = endYr - startYr + 1;

    if (L === 0 || isNaN(L)) return { interest: 0, payment: 0 };

    if (type === "IO") return { interest: L * R, payment: L * R };
    if (type === "CAP") return { interest: L * (Math.pow(1 + R / 12, 12) - 1), payment: 0 };

    if (type === "PI") {
      if (R === 0) return { interest: 0, payment: L / (years || 1) };
      const M = R / 12;
      const n = years * 12;
      const monthlyPmt = (L * M) / (1 - Math.pow(1 + M, -n));
      const annualPmt = monthlyPmt * 12;

      let balance = L;
      let yr1Int = 0;
      for (let i = 0; i < 12; i++) {
        const interestForMonth = balance * M;
        yr1Int += interestForMonth;
        balance -= (monthlyPmt - interestForMonth);
      }
      return { interest: yr1Int, payment: annualPmt };
    }

    if (type === "CL") {
      if (R === 0) return { interest: 0, payment: L / (years || 1) };
      const annualPmt = L * (R + 0.0219676);
      const monthlyPmt = annualPmt / 12;
      const M = R / 12;

      let balance = L;
      let yr1Int = 0;
      for (let i = 0; i < 12; i++) {
        const interestForMonth = balance * M;
        yr1Int += interestForMonth;
        balance -= (monthlyPmt - interestForMonth);
      }
      return { interest: yr1Int, payment: annualPmt };
    }

    return { interest: 0, payment: 0 };
  };

  const resA = calcTranche(loanA);
  const resB = calcTranche(loanB);

  const totalLoan = parseNum(loanA.amount) + parseNum(loanB.amount);
  const totalInterest = resA.interest + resB.interest;
  const totalPayment = resA.payment + resB.payment;

  const handleOk = () => {
    if (totalLoan > 0 && setInterestRate) {
      const amtA = parseNum(loanA.amount);
      const amtB = parseNum(loanB.amount);
      const rawRateA = parseNum(loanA.rates[0]); 
      const rawRateB = parseNum(loanB.rates[0]);

      const blendedRate = ((amtA * rawRateA) + (amtB * rawRateB)) / totalLoan;
      setInterestRate(blendedRate.toFixed(2));
    }
    onClose();
  };

  const handleSplitRateToggle = (e) => {
    const isSplit = e.target.checked;
    setSplitRate(isSplit);
    if (!isSplit) {
      setLoanA(prev => ({ ...prev, amount: String(masterTotal) }));
      setLoanB(prev => ({ ...prev, amount: "0" }));
    }
  };

  const handleLoanChange = (tranche, field, val) => {
    const isA = tranche === "A";
    const setter = isA ? setLoanA : setLoanB;
    const otherSetter = isA ? setLoanB : setLoanA;

    if (field === "type") {
      const prefix = val.toLowerCase();
      let toVal = "40";
      if (val === "PI") toVal = "25"; 

      setter(prev => ({
        ...prev,
        type: val,
        [`${prefix}From`]: prev[`${prefix}From`] || "1",
        [`${prefix}To`]: prev[`${prefix}To`] || toVal
      }));
    } else if (field === "amount") {
      const cleanVal = val.replace(/,/g, "");
      if (cleanVal !== "" && !/^-?\d*\.?\d*$/.test(cleanVal)) return;

      const numVal = parseNum(cleanVal);
      setter(prev => ({ ...prev, amount: cleanVal }));

      if (splitRate) {
        const remaining = Math.max(0, masterTotal - numVal);
        otherSetter(prev => ({ ...prev, amount: String(remaining) }));
      }
    } 
    else if (field === "rate") {
        setter(prev => ({ ...prev, rates: Array(5).fill(val) }));
    } 
    else if (field.includes("From") || field.includes("To")) {
      const cleanVal = val.replace(/,/g, "");
      if (cleanVal !== "" && !/^-?\d*\.?\d*$/.test(cleanVal)) return;
      setter(prev => ({ ...prev, [field]: cleanVal }));
    } else {
      setter(prev => ({ ...prev, [field]: val }));
    }
  };

  const TypeColumn = ({ label, typeValue, currentType, loanData, tranche }) => {
    const isSelected = currentType === typeValue;
    const prefix = typeValue.toLowerCase();
    const isDisabled = tranche === "B" && !splitRate;

    return (
      <div className={`flex flex-col items-center justify-start w-[85px] ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
        <label className="flex items-center gap-1.5 text-[11px] text-[#4A5568] font-medium cursor-pointer h-[32px] text-center leading-tight">
          <input
            type="radio"
            checked={isSelected}
            onChange={() => handleLoanChange(tranche, "type", typeValue)}
            disabled={isDisabled}
            className="w-3 h-3 text-[#0052CC] focus:ring-[#0052CC]"
          />
          {label}
        </label>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#64748B]">
          <span>From:</span>
          <span>To:</span>
        </div>
        <div className="flex gap-1 mt-0.5">
          <input
            type="text"
            value={loanData[`${prefix}From`]}
            onChange={(e) => handleLoanChange(tranche, `${prefix}From`, e.target.value)}
            disabled={!isSelected || isDisabled}
            className={`w-[36px] h-[22px] text-center text-[11px] border rounded-[3px] ${isSelected ? "border-[#CBD5E1] bg-white text-[#1E293B]" : "border-transparent bg-[#F1F5F9] text-[#A1A8B2]"}`}
          />
          <input
            type="text"
            value={loanData[`${prefix}To`]}
            onChange={(e) => handleLoanChange(tranche, `${prefix}To`, e.target.value)}
            disabled={!isSelected || isDisabled}
            className={`w-[36px] h-[22px] text-center text-[11px] border rounded-[3px] ${isSelected ? "border-[#CBD5E1] bg-white text-[#1E293B]" : "border-transparent bg-[#F1F5F9] text-[#A1A8B2]"}`}
          />
        </div>
      </div>
    );
  };

  const LoanPanel = ({ title, data, tranche }) => {
    const isDisabled = tranche === "B" && !splitRate;
    return (
      <div className={`relative border border-[#CBD5E1] rounded-[6px] p-3 pt-5 bg-white mb-4 shadow-sm transition-opacity ${isDisabled ? "opacity-70" : ""}`}>
        <span className="absolute -top-2.5 left-3 bg-white px-2 text-[12px] font-bold text-[#1E293B]">{splitRate ? `Rate ${tranche}` : title}</span>
        <div className="flex gap-4 items-start">

          <div className="flex flex-col gap-1 w-[90px]">
            <label className="text-[11px] font-bold text-[#4A5568] text-center h-[32px] flex items-end justify-center">Loan Amount</label>
            <div className="h-[14px]"></div>
            <input
              type="text"
              value={data.amount === "" ? "" : formatVal(parseNum(data.amount))}
              onChange={(e) => handleLoanChange(tranche, "amount", e.target.value)}
              disabled={isDisabled}
              className={`w-full border border-[#CBD5E1] rounded-[4px] px-2 py-1 text-[13px] text-right font-medium focus:outline-none focus:border-[#0052CC] ${isDisabled ? "bg-[#F1F5F9] text-[#64748B]" : "bg-white text-[#0052CC]"}`}
            />
          </div>

          <div className="flex flex-col gap-1 w-[70px]">
            <label className="text-[11px] font-bold text-[#4A5568] text-center h-[32px] flex flex-col items-center justify-end leading-tight"><span>Interest Rate</span><span>(Average)</span></label>
            <div className="h-[14px]"></div>
            <div className="relative">
              <input
                type="text"
                value={data.rates[0]} 
                onChange={(e) => handleLoanChange(tranche, "rate", e.target.value)}
                disabled={isDisabled}
                className={`w-full border border-[#CBD5E1] rounded-[4px] pl-2 pr-4 py-1 text-[13px] text-right focus:outline-none focus:border-[#0052CC] ${isDisabled ? "bg-[#F1F5F9] text-[#64748B]" : "bg-white text-[#1E293B]"}`}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B]">%</span>
            </div>
          </div>

          <div className="w-[1px] bg-[#E2E8F0] h-[70px] self-end mb-1"></div>

          <TypeColumn label="Interest Only" typeValue="IO" currentType={data.type} loanData={data} tranche={tranche} />
          <TypeColumn label="Principal & Interest" typeValue="PI" currentType={data.type} loanData={data} tranche={tranche} />
          <TypeColumn label="Capitalise Interest" typeValue="CAP" currentType={data.type} loanData={data} tranche={tranche} />
          <TypeColumn label="Credit Line" typeValue="CL" currentType={data.type} loanData={data} tranche={tranche} />

        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[680px] flex flex-col border border-[#CBD5E1] overflow-hidden">

        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Loan Interest & Type</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        <div className="p-4 pb-2">
          <LoanPanel title="Loan A" data={loanA} tranche="A" />
          <LoanPanel title="Loan B" data={loanB} tranche="B" />

          <div className="flex gap-4">
            <div className="relative border border-[#CBD5E1] rounded-[6px] p-3 pt-4 bg-[#FAFAFA] flex-1">
              <span className="absolute -top-2.5 left-3 bg-[#FAFAFA] px-1 text-[11px] text-[#64748B]">Loan Summary (1st year)</span>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-[#4A5568]">Total Loan:</span>
                <span className="text-[13px] font-bold text-[#1E293B]">${formatVal(totalLoan)}</span>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-[#4A5568]">Interest:</span>
                <span className="text-[13px] font-bold text-[#1E293B]">${formatVal(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#4A5568]">Payment:</span>
                <span className="text-[13px] font-bold text-[#1E293B]">${formatVal(totalPayment)}</span>
              </div>
            </div>

            <div className="relative border border-[#CBD5E1] rounded-[6px] p-3 pt-5 bg-white w-[140px] flex flex-col justify-between">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#64748B]">Loan Type</span>
              <label className="flex items-center gap-2 text-[12px] text-[#1E293B] cursor-pointer">
                <input type="checkbox" checked={splitRate} onChange={handleSplitRateToggle} className="rounded text-[#0052CC] focus:ring-[#0052CC]" />
                Split rate
              </label>
              <button
                onClick={() => setIsAnnualRatesOpen(true)} 
                className="w-full mt-2 py-1.5 border border-[#CBD5E1] bg-[#F8FAFC] rounded-[4px] text-[11px] text-[#1E293B] hover:bg-[#E2E8F0] shadow-sm"
              >
                Specify Annual Rates
              </button>
            </div>

            <div className="relative border border-[#CBD5E1] rounded-[6px] p-3 pt-5 bg-white w-[200px]">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-[#64748B]">Capitalised Interest</span>
              <label className="flex items-start gap-2 text-[12px] text-[#1E293B] cursor-pointer leading-tight">
                <input type="checkbox" checked={capTaxDeductible} onChange={(e) => setCapTaxDeductible(e.target.checked)} className="rounded text-[#0052CC] focus:ring-[#0052CC] mt-0.5" />
                Capitalised component tax-deductible
              </label>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-end gap-2 rounded-b-[8px]">
          <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] shadow-sm">?</button>
          <button onClick={handleOk} className="px-8 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] shadow-sm">OK</button>
          <button onClick={onClose} className="px-5 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] shadow-sm">Cancel</button>
        </div>

      </div>
      
      {/* Renders the secondary modal when the button is clicked */}
      <AnnualInterestRatesModal 
        isOpen={isAnnualRatesOpen}
        onClose={() => setIsAnnualRatesOpen(false)}
        loanA={loanA}
        loanB={loanB}
        splitRate={splitRate}
        setLoanA={setLoanA} 
        setLoanB={setLoanB}
      />
    </div>,
    document.body
  );
}