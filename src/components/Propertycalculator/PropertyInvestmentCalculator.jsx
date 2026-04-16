import React, { useState, useEffect } from "react";
import InputField from "../inputField"; 
import SelectField from "../SelectField";
import ToggleSwitch from "../ToggleSwitch";
import Chart from "./chart";
import ProjectionsGrid from "../ProjectionsGrid";
import LoanModal from "../LoanModal";
import CollapsibleSection from "../CollapsibleSection";
import { calculatePIA } from "../../helpers/propertyHelpers"; // Ensure path is correct

export default function PropertyInvestmentCalculator() {
  // 3.1 Property Details
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [propertyValue, setPropertyValue] = useState("500000");
  const [purchaseCosts, setPurchaseCosts] = useState(""); 
  const [grossRentWeekly, setGrossRentWeekly] = useState("500");
  const [rentalExpensesPercent, setRentalExpensesPercent] = useState("30");

  // 3.2 Financing
  const [cashInvested, setCashInvested] = useState("100000");
  const [equityInvested, setEquityInvested] = useState("0");
  const [loanCosts, setLoanCosts] = useState("");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanType, setLoanType] = useState("Interest Only");
  const [additionalLoan, setAdditionalLoan] = useState("0");

  // New Financing fields for Modal (Section 5)
  const [renovationCosts, setRenovationCosts] = useState("0");
  const [furnitureCosts, setFurnitureCosts] = useState("0");
  const [holdingCosts, setHoldingCosts] = useState("0");

  // 3.3 Growth & Inflation
  const [capitalGrowthRate, setCapitalGrowthRate] = useState("5");
  const [inflationRate, setInflationRate] = useState("3");

  // 3.4 Depreciation
  const [chattelsValue, setChattelsValue] = useState("0");
  const [depreciationMethod, setDepreciationMethod] = useState("DV");
  const [chattelsDepreciationRate, setChattelsDepreciationRate] = useState("25");
  const [buildingDepreciationRate, setBuildingDepreciationRate] = useState("0");

  // 3.5 Tax Settings
  const [investorTaxRate, setInvestorTaxRate] = useState("33");
  const [investorType, setInvestorType] = useState("Individual");
  const [interestDeductibility, setInterestDeductibility] = useState("100");
  const [isNewBuild, setIsNewBuild] = useState(false);
  const [ringFencing, setRingFencing] = useState(false);

  const [result, setResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loanError, setLoanError] = useState("");

  const handleReset = () => {
    setPropertyAddress(""); setPropertyDescription("");
    setPropertyValue(""); setPurchaseCosts(""); setGrossRentWeekly(""); setRentalExpensesPercent("");
    setCashInvested(""); setEquityInvested(""); setLoanCosts(""); setInterestRate(""); setLoanType(""); setAdditionalLoan("");
    setRenovationCosts(""); setFurnitureCosts(""); setHoldingCosts("");
    setCapitalGrowthRate(""); setInflationRate(""); setChattelsValue(""); setDepreciationMethod(""); setChattelsDepreciationRate(""); setBuildingDepreciationRate("");
    setInvestorTaxRate(""); setInvestorType(""); setInterestDeductibility(""); setIsNewBuild(false); setRingFencing(false);
  };

  const performCalculation = () => {
    const pValue = parseFloat(propertyValue) || 0;
    const calcPurchaseCosts = purchaseCosts ? parseFloat(purchaseCosts) : pValue * 0.005;
    const cInvested = parseFloat(cashInvested) || 0;
    const eInvested = parseFloat(equityInvested) || 0;
    const lCosts = parseFloat(loanCosts) || 0;
    const aLoan = parseFloat(additionalLoan) || 0;
    const rCosts = parseFloat(renovationCosts) || 0;
    const fCosts = parseFloat(furnitureCosts) || 0;
    const hCosts = parseFloat(holdingCosts) || 0;
    
    // Total cost includes renovations, furniture, holding, etc.
    const calculatedLoan = pValue + calcPurchaseCosts + lCosts + aLoan + rCosts + fCosts + hCosts - cInvested - eInvested;
    
    if (calculatedLoan > pValue && pValue > 0) {
      // It's common for investment loans to exceed property value if heavily leveraging, but per spec 8.1 we show a warning.
      setLoanError("Loan amount cannot exceed property value");
    } else {
      setLoanError("");
    }

    const res = calculatePIA({
      propertyValue: pValue,
      purchaseCostsManual: purchaseCosts ? parseFloat(purchaseCosts) : null,
      grossRentWeekly: parseFloat(grossRentWeekly) || 0,
      rentalExpensesPercent: parseFloat(rentalExpensesPercent) || 0,
      cashInvested: cInvested,
      equityInvested: eInvested,
      loanCostsManual: loanCosts ? parseFloat(loanCosts) : null,
      interestRate: parseFloat(interestRate) || 0,
      loanType,
      additionalLoan: aLoan + rCosts + fCosts + hCosts, // Roll extra costs into additional loan for calculation engine
      capitalGrowthRate: parseFloat(capitalGrowthRate) || 0,
      inflationRate: parseFloat(inflationRate) || 0,
      chattelsValue: parseFloat(chattelsValue) || 0,
      depreciationMethod,
      chattelsDepreciationRate: parseFloat(chattelsDepreciationRate) || 0,
      buildingDepreciationRate: parseFloat(buildingDepreciationRate) || 0, 
      investorTaxRate: parseFloat(investorTaxRate) || 0,
      interestDeductibility: parseFloat(interestDeductibility) || 0,
      isNewBuild,
      ringFencing
    });
    
    // Attach original input values to result for the "Input" column in Projections Grid
    res.originalInputs = {
      propertyValue: pValue,
      purchaseCosts: calcPurchaseCosts,
      investments: cInvested + eInvested,
      loanAmount: calculatedLoan,
      equity: pValue - calculatedLoan,
      capitalGrowthRate: parseFloat(capitalGrowthRate) || 0,
      inflationRate: parseFloat(inflationRate) || 0,
      grossRentWeekly: parseFloat(grossRentWeekly) || 0,
      interestRate: parseFloat(interestRate) || 0,
      rentalExpensesPercent: parseFloat(rentalExpensesPercent) || 0,
      chattelsValue: parseFloat(chattelsValue) || 0,
      loanCosts: lCosts
    };

    setResult(res);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { performCalculation(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    propertyValue, purchaseCosts, grossRentWeekly, rentalExpensesPercent,
    cashInvested, equityInvested, loanCosts, interestRate, loanType, additionalLoan,
    renovationCosts, furnitureCosts, holdingCosts,
    capitalGrowthRate, inflationRate, chattelsValue, depreciationMethod, chattelsDepreciationRate, buildingDepreciationRate,
    investorTaxRate, investorType, interestDeductibility, isNewBuild, ringFencing
  ]);

  const formatCur = (val) => "$" + Math.round(val || 0).toLocaleString();

  const ResultRow = ({ label, value, isBold }) => (
    <div className="flex justify-between items-center py-[6px]">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <span className={`text-[13px] ${isBold ? 'font-bold text-[#1E293B]' : 'font-medium text-[#1E293B]'}`}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex justify-center p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] w-full">
        
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-[24px] font-bold text-[#0052CC]">Property Investment Calculator</h2>
          <button onClick={handleReset} className="text-[#64748B] text-[13px] font-bold hover:text-[#0052CC] transition-colors underline">
            Reset to Defaults
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          
          {/* LEFT PANEL - INPUTS */}
          <div className="w-full lg:w-[420px] flex-shrink-0 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col border border-[#E2E8F0]">
            <h3 className="text-[15px] font-bold text-[#23303B] mb-[24px] leading-snug">
              This calculator projects key financial outcomes about investment property over the next 10 years.
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <CollapsibleSection title="1. Property Details" defaultOpen={true}>
                <InputField label="Property Address (Optional)" placeholder="e.g. 3-bed townhouse, Mt Roskill" value={propertyAddress} onChange={setPropertyAddress} />
                <InputField label="Property Description (Optional)" value={propertyDescription} onChange={setPropertyDescription} />
                <InputField label="Value of The Property*" prefix="$" value={propertyValue} onChange={setPropertyValue} />
                <InputField label="Purchase Costs (Leave blank for 0.5%)" prefix="$" value={purchaseCosts} onChange={setPurchaseCosts} />
                <InputField label="What will the Property Gross rent per week ?" prefix="$" value={grossRentWeekly} onChange={setGrossRentWeekly} />
                <InputField label="Rental Expenses (%)" value={rentalExpensesPercent} onChange={setRentalExpensesPercent} />
              </CollapsibleSection>

              <CollapsibleSection title="2. Financing Details">
                <div className="flex justify-end mb-1">
                  <button onClick={() => setIsModalOpen(true)} className="text-[12px] text-[#0052CC] font-bold hover:underline">View Loan Modal Breakdown</button>
                </div>
                <InputField label="Cash Invested (Deposit)*" prefix="$" value={cashInvested} onChange={setCashInvested} error={loanError} />
                <InputField label="Equity Invested" prefix="$" value={equityInvested} onChange={setEquityInvested} />
                <InputField label="Loan Costs" prefix="$" value={loanCosts} onChange={setLoanCosts} />
                <InputField label="Additional Loan" prefix="$" value={additionalLoan} onChange={setAdditionalLoan} />
                <InputField label="Interest Rate p.a. (%)" value={interestRate} onChange={setInterestRate} />
                <SelectField label="Loan Type" value={loanType} onChange={setLoanType} options={[{ label: "Interest Only", value: "Interest Only" }, { label: "Principal & Interest", value: "P+I" }]} />
              </CollapsibleSection>

              <CollapsibleSection title="3. Growth & Depreciation">
                <InputField label="Capital Growth Rate p.a. (%)" value={capitalGrowthRate} onChange={setCapitalGrowthRate} />
                <InputField label="Inflation Rate (CPI) p.a. (%)" value={inflationRate} onChange={setInflationRate} />
                <InputField label="Chattels Value" prefix="$" value={chattelsValue} onChange={setChattelsValue} />
                <SelectField label="Chattels Depr. Method" value={depreciationMethod} onChange={setDepreciationMethod} options={[{ label: "Diminishing Value (DV)", value: "DV" }, { label: "Straight Line (SL)", value: "SL" }]} />
                <InputField label="Chattels Depr. Rate (%)" value={chattelsDepreciationRate} onChange={setChattelsDepreciationRate} />
                <InputField label="Building Depr. Rate (%)" value={buildingDepreciationRate} onChange={setBuildingDepreciationRate} tooltip="Currently 0% for NZ residential." />
              </CollapsibleSection>

              <CollapsibleSection title="4. Tax Settings (NZ Rules)">
                <SelectField 
                  label="Investor Tax Rate" value={investorTaxRate} onChange={setInvestorTaxRate}
                  options={[ { label: "10.5%", value: "10.5" }, { label: "17.5%", value: "17.5" }, { label: "30%", value: "30" }, { label: "33%", value: "33" }, { label: "39%", value: "39" }]} 
                />
                <SelectField 
                  label="Investor Type" value={investorType} onChange={setInvestorType}
                  options={[ { label: "Individual", value: "Individual" }, { label: "Company", value: "Company" }, { label: "Trust", value: "Trust" }, { label: "LTC", value: "LTC" }]} 
                />
                <ToggleSwitch label="New Build Property" checked={isNewBuild} onChange={setIsNewBuild} tooltip="Locks interest deductibility to 100%" />
                <SelectField 
                  label="Interest Deductibility" value={isNewBuild ? "100" : interestDeductibility} onChange={setInterestDeductibility} disabled={isNewBuild}
                  options={[ { label: "0%", value: "0" }, { label: "50%", value: "50" }, { label: "80%", value: "80" }, { label: "100%", value: "100" }]} 
                />
                <ToggleSwitch label="Apply Ring-Fencing" checked={ringFencing} onChange={setRingFencing} tooltip="Losses cannot offset PAYE income" />
              </CollapsibleSection>
            </div>

            <button 
              onClick={performCalculation}
              className="mt-[24px] w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors shadow-sm"
            >
              CALCULATE
            </button>
          </div>

          {/* RIGHT PANEL - RESULTS & CHART */}
          <div className="flex-1 flex flex-col gap-5 w-full min-w-0">
            
            <div className="bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col justify-center border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-6">Property value:</h3>
              {result && <Chart data={result.projections} />}
            </div>

            <div className="bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">Property Value Results:</h3>
              
              <div className="bg-[#0052CC] rounded-[8px] py-4 px-5 flex justify-between items-center mb-6 shadow-sm">
                <span className="text-white font-medium text-[14px]">Total Equity In 10 Years:</span>
                <span className="text-white font-bold text-[18px]">{result ? formatCur(result.metrics.totalEquityIn10Years) : "$0"}</span>
              </div>

              <div className="flex flex-col gap-1 mb-6">
                <ResultRow label="Average rent per week:" value={result ? formatCur(result.metrics.avgWeeklyRent) : "$0"} />
                <ResultRow label="Average expenses per week:" value={result ? formatCur(result.metrics.avgWeeklyExpenses) : "$0"} />
                <ResultRow label="Average cashflow per week:" value={result ? formatCur(result.metrics.avgWeeklyCashflow) : "$0"} />
                <ResultRow label="Over 10 Years, This property is:" value={result?.metrics?.isCashflowPositive ? "Cashflow Positive" : "Cashflow Negative"} isBold={true} />
                <ResultRow label="Average equity gain per week:" value={result ? formatCur(result.metrics.avgEquityGainWeekly) : "$0"} />
                <ResultRow label="Average net gain per week:" value={result ? formatCur(result.metrics.avgNetGainWeekly) : "$0"} isBold={true} />
              </div>

              <button className="w-full bg-[#23303B] hover:bg-[#1a242c] text-white font-medium py-3.5 rounded-[8px] transition-colors text-[14px] shadow-sm mt-auto">
                Talk To An Advisor About Buying An Investment Property
              </button>

              <div className="flex gap-3 mt-3">
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">
                  Save Scenario
                </button>
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">
                  Share Report (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 8.2 FULL WIDTH PROJECTIONS GRID */}
        {result && (
          <div className="mt-8 mb-8">
            <h3 className="text-[#23303B] font-bold text-[18px] mb-4">10-Year Projections Grid</h3>
            <ProjectionsGrid projections={result.projections} metrics={result.metrics} inputs={result.originalInputs} />
          </div>
        )}

        {/* 11. LEGAL DISCLAIMER */}
        <div className="mt-8 border-t border-[#E2E8F0] pt-8 pb-12">
          <h4 className="text-[14px] font-bold text-[#64748B] uppercase tracking-wider mb-3">Important Disclaimer</h4>
          <p className="text-[12px] text-[#A1A8B2] mb-3 leading-relaxed">
            This calculator is provided for illustration and general information purposes only. It does not constitute financial advice, tax advice, or legal advice. The projections and outputs generated are based on assumptions entered by the user and may not reflect actual outcomes.
          </p>
          <p className="text-[12px] text-[#A1A8B2] mb-3 leading-relaxed">
            Tax rules, interest deductibility, and depreciation entitlements are subject to change. You should seek independent advice from a licensed financial adviser, accountant, or tax professional before making any investment decision.
          </p>
          <p className="text-[12px] text-[#A1A8B2] leading-relaxed">
            Staircase Financial Management Ltd is not liable for any decisions made in reliance on these calculations.
          </p>
        </div>

      </div>
      
      <LoanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={{
          propertyValue: parseFloat(propertyValue) || 0,
          cashInvested: parseFloat(cashInvested) || 0,
          equityInvested: parseFloat(equityInvested) || 0,
          purchaseCosts: result?.originalInputs?.purchaseCosts || 0,
          loanCosts: parseFloat(loanCosts) || 0,
          additionalLoan: parseFloat(additionalLoan) || 0,
          renovationCosts: parseFloat(renovationCosts) || 0,
          furnitureCosts: parseFloat(furnitureCosts) || 0,
          holdingCosts: parseFloat(holdingCosts) || 0,
          loanAmount: result?.loanAmount || 0
        }}
        setters={{
          setRenovationCosts,
          setFurnitureCosts,
          setHoldingCosts
        }}
      />
    </div>
  );
}