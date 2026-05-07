import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

// IMPORT YOUR SEPARATE COMPONENTS HERE
import HomeValueGrowthModal from "./HomeValueGrowthModal";
import InterestRatesModal from "./InterestRatesModal";
import LoanConsolidationModal from "./LoanConsolidationModal";

// Helper functions
const parseNum = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
const formatVal = (val) => Math.round(val).toLocaleString("en-NZ");

export default function HomeLoanDetailsModal({
  isOpen,
  onClose,
  principalResidence, setPrincipalResidence,
  amountOwing, setAmountOwing,
  homeLoanRepayments, setHomeLoanRepayments
}) {
  const [homeValue, setHomeValue] = useState("900,000");
  const [owing, setOwing] = useState("630,000");
  const [interest, setInterest] = useState("6.50");
  const [monthlyPayment, setMonthlyPayment] = useState("4,861");

  // NEW: State to hold the exact annual total
  const [annualTotal, setAnnualTotal] = useState("58,332");

  // State to control all separate modals
  const [isHomeValueModalOpen, setIsHomeValueModalOpen] = useState(false);
  const [isInterestRatesModalOpen, setIsInterestRatesModalOpen] = useState(false);
  const [isLoanConsolidationModalOpen, setIsLoanConsolidationModalOpen] = useState(false);

  // Sync initial data from parent
  useEffect(() => {
    if (isOpen) {
      setHomeValue(principalResidence || "0");
      setOwing(amountOwing || "0");
      if (homeLoanRepayments) {
        const annual = parseNum(homeLoanRepayments);
        setAnnualTotal(formatVal(annual));
        setMonthlyPayment(annual > 0 ? formatVal(annual / 12) : "0");
      }
    }
  }, [isOpen, principalResidence, amountOwing, homeLoanRepayments]);

  // Auto-calculate exact PMT when Interest or Owing changes
  useEffect(() => {
    const currentOwing = parseNum(owing);
    const annualRate = parseNum(interest);

    if (currentOwing > 0 && annualRate > 0) {
      const r = (annualRate / 100) / 12;
      const n = 25 * 12;

      const originalPrincipal = currentOwing * (720000 / 630000);
      const pmt = (originalPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      // We format them separately so the annual total uses the exact un-rounded math
      setMonthlyPayment(formatVal(pmt));
      setAnnualTotal(formatVal(pmt * 12));
    }
  }, [interest, owing]);

  // Basic input change handler
  const handleInputChange = (setter) => (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '');
    setter(val);
  };

  // Special handler if the user manually overrides the monthly payment field
  const handleMonthlyPaymentChange = (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '');
    setMonthlyPayment(val);
    setAnnualTotal(formatVal(parseNum(val) * 12));
  };

  const handleOk = () => {
    if (setPrincipalResidence) setPrincipalResidence(homeValue);
    if (setAmountOwing) setAmountOwing(owing);
    // Send the state value instead of calculating on the fly
    if (setHomeLoanRepayments) setHomeLoanRepayments(annualTotal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[400px] flex flex-col border border-[#CBD5E1] overflow-hidden">

            <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
              <h2 className="text-[14px] font-bold text-[#1E293B]">Home Loan Details</h2>
              <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
            </div>

            <div className="p-8 flex flex-col gap-4 items-center bg-white">
              <div className="flex flex-col gap-3 w-full max-w-[280px]">

                {/* Home Value */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHomeValueModalOpen(true)}
                    className="w-[110px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm"
                  >
                    Home Value
                  </button>
                  <input
                    type="text"
                    value={homeValue}
                    onChange={handleInputChange(setHomeValue)}
                    className="w-[120px] border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                {/* Amount owing */}
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
                  <button
                    type="button"
                    onClick={() => setIsInterestRatesModalOpen(true)}
                    className="w-[110px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm"
                  >
                    Loan Interest
                  </button>
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
                  <button
                    type="button"
                    onClick={() => setIsLoanConsolidationModalOpen(true)}
                    className="w-[110px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-medium hover:bg-[#E2E8F0] transition-colors shadow-sm"
                  >
                    Loan Payments
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={monthlyPayment}
                      onChange={handleMonthlyPaymentChange} // Uses the new specific handler
                      className="w-[90px] border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                    <span className="text-[13px] text-[#64748B]">/mth</span>
                  </div>
                </div>

                {/* Annual Total */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-[110px] text-[13px] text-[#1E293B] text-right font-medium">Annual total:</div>
                  <div className="flex items-center gap-2 pl-1">
                    <span className="text-[13px] font-bold text-[#1E293B]">{annualTotal}</span>
                    <span className="text-[13px] text-[#64748B]">/year</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-center gap-3 rounded-b-[8px]">
              <button onClick={handleOk} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
              <button onClick={onClose} className="w-[80px] py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Render the Home Value Growth modal */}
      <HomeValueGrowthModal
        isOpen={isHomeValueModalOpen}
        onClose={() => setIsHomeValueModalOpen(false)}
        initialHomeValue={homeValue}
        onSave={(newValue) => setHomeValue(newValue)}
      />

      {/* Render the Interest Rates modal */}
      <InterestRatesModal
        isOpen={isInterestRatesModalOpen}
        onClose={() => setIsInterestRatesModalOpen(false)}
        initialRate={interest}
        onSave={(newRate) => setInterest(newRate)}
      />

      {/* Render the Loan Consolidation modal */}
      <LoanConsolidationModal
        isOpen={isLoanConsolidationModalOpen}
        onClose={() => setIsLoanConsolidationModalOpen(false)}
        initialOwing={owing}
        initialInterest={interest}
        initialPayment={monthlyPayment}
        onSave={(newOwing, newInterest, newPayment) => {
          setOwing(newOwing);
          setInterest(newInterest);
          setMonthlyPayment(newPayment);
        }}
      />
    </>
  );
}
