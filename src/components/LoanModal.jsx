import React from "react";
import InputField from "./inputField";

export default function LoanModal({ isOpen, onClose, data, setters }) {
  if (!isOpen) return null;

  const formatCur = (val) => "$" + (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const autoLoanCalc = data.propertyValue - data.cashInvested - data.equityInvested;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[16px] w-full max-w-[700px] shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b border-[#E2E8F0]">
          <h3 className="text-[18px] font-bold text-[#1E293B]">Loan & Funding Breakdown</h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#1E293B] text-2xl font-bold leading-none">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0] text-[#64748B]">
                <th className="pb-3 font-semibold w-[30%]">Line Item</th>
                <th className="pb-3 font-semibold text-right">Cash Invested</th>
                <th className="pb-3 font-semibold text-right">Equity Invested*</th>
                <th className="pb-3 font-semibold text-right">Loan</th>
              </tr>
            </thead>
            <tbody className="text-[#1E293B]">
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-4 font-medium">Property Cost</td>
                <td className="py-4 text-right">{formatCur(data.cashInvested)}</td>
                <td className="py-4 text-right">{formatCur(data.equityInvested)}</td>
                <td className="py-4 text-right font-medium text-[#0052CC]">{formatCur(autoLoanCalc)}</td>
              </tr>
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-2 font-medium">Renovation costs</td>
                <td className="py-2 px-2" colSpan={2}>
                  <InputField prefix="$" value={data.renovationCosts.toString()} onChange={setters.setRenovationCosts} />
                </td>
                <td className="py-2 text-right">{formatCur(data.renovationCosts)}</td>
              </tr>
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-4 font-medium">Purchase Costs</td>
                <td className="py-4 text-right">$0.00</td>
                <td className="py-4 text-right">$0.00</td>
                <td className="py-4 text-right">{formatCur(data.purchaseCosts)}</td>
              </tr>
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-2 font-medium">Furniture</td>
                <td className="py-2 px-2" colSpan={2}>
                  <InputField prefix="$" value={data.furnitureCosts.toString()} onChange={setters.setFurnitureCosts} />
                </td>
                <td className="py-2 text-right">{formatCur(data.furnitureCosts)}</td>
              </tr>
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-2 font-medium">Holding costs</td>
                <td className="py-2 px-2" colSpan={2}>
                  <InputField prefix="$" value={data.holdingCosts.toString()} onChange={setters.setHoldingCosts} />
                </td>
                <td className="py-2 text-right">{formatCur(data.holdingCosts)}</td>
              </tr>
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-4 font-medium">Loan Costs</td>
                <td className="py-4 text-right">$0.00</td>
                <td className="py-4 text-right">$0.00</td>
                <td className="py-4 text-right">{formatCur(data.loanCosts)}</td>
              </tr>
              <tr className="border-b border-[#F1F5F9]">
                <td className="py-4 font-medium">Additional Loan</td>
                <td className="py-4 text-right">$0.00</td>
                <td className="py-4 text-right">$0.00</td>
                <td className="py-4 text-right">{formatCur(data.additionalLoan)}</td>
              </tr>
              <tr className="font-bold bg-[#F8F8F8]">
                <td className="py-4 px-2">TOTALS</td>
                <td className="py-4 px-2 text-right">{formatCur(data.cashInvested)}</td>
                <td className="py-4 px-2 text-right">{formatCur(data.equityInvested)}</td>
                <td className="py-4 px-2 text-right text-[#0052CC]">{formatCur(data.loanAmount)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[12px] text-[#64748B] mt-5 italic">
            *Equity Invested: To be used where you already have equity leveraged from another property.
          </p>
        </div>
      </div>
    </div>
  );
}