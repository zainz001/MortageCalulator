import React, { useState, useEffect, useCallback } from "react";
import ProjectionsGrid from "../ProjectionsGrid";
import LoanModal from "../LoanModal";
import { calculatePIA } from "../../helpers/propertyHelpers";
import PropertyValueModal from "./componenets/propertyprice/PropertyPriceModal";
import PurchaseCostsModal from "./componenets/propertyprice/PurchaseCostsModal";
// --- Import your new modular sections ---
import PropertyDetailsSection from "./sections/property/PropertyDetailsSection";
import FinancingInputsSection from "./sections/finance/FinancingInputsSection";
import GrowthAndInflationSection from "./sections/growthandinflation/GrowthAndInflationSection";
import DepreciationSection from "./sections/depreciation/DepreciationSection";
import TaxSettingsSection from "./sections/tax/TaxSettingsSection";
import RentalIncomeModal from "./componenets/propertyprice/RentalIncomeModal";

const DEFAULTS = {
  propertyAddress: "",
  propertyDescription: "",
  propertyValue: "",
  purchaseCosts: "",
  grossRentWeekly: "",
  rentalExpensesPercent: "30",
  cashInvested: "",
  equityInvested: "0",
  loanCosts: "",
  interestRate: "6.50",
  loanType: "Interest only",
  additionalLoan: "0",
  renovationCosts: "0",
  furnitureCosts: "0",
  holdingCosts: "0",
  capitalGrowthRate: "5.00",
  inflationRate: "3.00",
  chattelsValue: "0",
  depreciationMethod: "DV",
  chattelsDepreciationRate: "25",
  buildingDepreciationRate: "0",
  investorTaxRate: "33",
  investorType: "Individual",
  interestDeductibility: "100",
  isNewBuild: false,
  ringFencing: false,
};

const fmt = (val) =>
  val !== null && val !== undefined
    ? "$" + Math.round(val).toLocaleString("en-NZ")
    : "—";

const fmtPct = (val) =>
  val !== null && val !== undefined ? val.toFixed(2) + "%" : "—";

export default function PropertyInvestmentCalculator() {
  // ── §3.1 Property Details 
  const [propertyAddress, setPropertyAddress] = useState(DEFAULTS.propertyAddress);
  const [propertyDescription, setPropertyDescription] = useState(DEFAULTS.propertyDescription);
  const [propertyValue, setPropertyValue] = useState(DEFAULTS.propertyValue);
  const [purchaseCosts, setPurchaseCosts] = useState(DEFAULTS.purchaseCosts);
  const [grossRentWeekly, setGrossRentWeekly] = useState(DEFAULTS.grossRentWeekly);
  const [rentalExpensesPercent, setRentalExpensesPercent] = useState(DEFAULTS.rentalExpensesPercent);
  const [rentTimeline, setRentTimeline] = useState([]);
  // ── §3.1.5 Timeline & Linked States 
  const [renovationTimeline, setRenovationTimeline] = useState([]);
  const [furnitureTimeline, setFurnitureTimeline] = useState([]);
  const [linkValueFittings, setLinkValueFittings] = useState(true);
  const [linkConstructionCost, setLinkConstructionCost] = useState(true);

  // ── §3.2 Financing Inputs 
  const [cashInvested, setCashInvested] = useState(DEFAULTS.cashInvested);
  const [equityInvested, setEquityInvested] = useState(DEFAULTS.equityInvested);
  const [loanCosts, setLoanCosts] = useState(DEFAULTS.loanCosts);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanType, setLoanType] = useState(DEFAULTS.loanType);
  const [additionalLoan, setAdditionalLoan] = useState(DEFAULTS.additionalLoan);
  const [renovationCosts, setRenovationCosts] = useState(DEFAULTS.renovationCosts);
  const [furnitureCosts, setFurnitureCosts] = useState(DEFAULTS.furnitureCosts);
  const [holdingCosts, setHoldingCosts] = useState(DEFAULTS.holdingCosts);

  // ── §3.3 Growth & Inflation 
  const [capitalGrowthRate, setCapitalGrowthRate] = useState(DEFAULTS.capitalGrowthRate);
  const [inflationRate, setInflationRate] = useState(DEFAULTS.inflationRate);

  // ── §3.4 Depreciation 
  const [chattelsValue, setChattelsValue] = useState(DEFAULTS.chattelsValue);
  const [depreciationMethod, setDepreciationMethod] = useState(DEFAULTS.depreciationMethod);
  const [chattelsDepreciationRate, setChattelsDepreciationRate] = useState(DEFAULTS.chattelsDepreciationRate);
  const [buildingDepreciationRate, setBuildingDepreciationRate] = useState(DEFAULTS.buildingDepreciationRate);

  // ── §3.5 Tax Settings 
  const [investorTaxRate, setInvestorTaxRate] = useState(DEFAULTS.investorTaxRate);
  const [investorType, setInvestorType] = useState(DEFAULTS.investorType);
  const [interestDeductibility, setInterestDeductibility] = useState(DEFAULTS.interestDeductibility);
  const [isNewBuild, setIsNewBuild] = useState(DEFAULTS.isNewBuild);
  const [ringFencing, setRingFencing] = useState(DEFAULTS.ringFencing);

  const [result, setResult] = useState(null);
  const [loanError, setLoanError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const handleReset = useCallback(() => {
    setPropertyAddress(DEFAULTS.propertyAddress);
    setPropertyDescription(DEFAULTS.propertyDescription);
    setPropertyValue(DEFAULTS.propertyValue);
    setPurchaseCosts(DEFAULTS.purchaseCosts);
    setGrossRentWeekly(DEFAULTS.grossRentWeekly);
    setRentalExpensesPercent(DEFAULTS.rentalExpensesPercent);
    setCashInvested(DEFAULTS.cashInvested);
    setEquityInvested(DEFAULTS.equityInvested);
    setLoanCosts(DEFAULTS.loanCosts);
    setInterestRate(DEFAULTS.interestRate);
    setLoanType(DEFAULTS.loanType);
    setAdditionalLoan(DEFAULTS.additionalLoan);
    setRenovationCosts(DEFAULTS.renovationCosts);
    setFurnitureCosts(DEFAULTS.furnitureCosts);
    setHoldingCosts(DEFAULTS.holdingCosts);
    setCapitalGrowthRate(DEFAULTS.capitalGrowthRate);
    setInflationRate(DEFAULTS.inflationRate);
    setChattelsValue(DEFAULTS.chattelsValue);
    setDepreciationMethod(DEFAULTS.depreciationMethod);
    setChattelsDepreciationRate(DEFAULTS.chattelsDepreciationRate);
    setBuildingDepreciationRate(DEFAULTS.buildingDepreciationRate);
    setInvestorTaxRate(DEFAULTS.investorTaxRate);
    setInvestorType(DEFAULTS.investorType);
    setInterestDeductibility(DEFAULTS.interestDeductibility);
    setIsNewBuild(DEFAULTS.isNewBuild);
    setRingFencing(DEFAULTS.ringFencing);
    setResult(null);
    setLoanError("");
  }, []);

  const handleNewBuildToggle = useCallback((val) => {
    setIsNewBuild(val);
    if (val) setInterestDeductibility("100");
  }, []);

  const performCalculation = useCallback(() => {
    const pValue = parseFloat(propertyValue) || 0;
    const cInvest = parseFloat(cashInvested) || 0;
    const eInvest = parseFloat(equityInvested) || 0;
    const lCosts = parseFloat(loanCosts) || 0;
    const aLoan = parseFloat(additionalLoan) || 0;
    const rCosts = parseFloat(renovationCosts) || 0;
    const fCosts = parseFloat(furnitureCosts) || 0;
    const hCosts = parseFloat(holdingCosts) || 0;
    const pCosts = purchaseCosts ? parseFloat(purchaseCosts) : pValue * 0.005;

    const calcLoan = pValue + pCosts + lCosts + aLoan + rCosts + fCosts + hCosts - cInvest - eInvest;
    if (calcLoan > pValue && pValue > 0) {
      setLoanError("Loan amount cannot exceed property value");
    } else {
      setLoanError("");
    }

    if (pValue === 0) return;

    const res = calculatePIA({
      propertyValue: pValue,
      purchaseCostsManual: purchaseCosts ? parseFloat(purchaseCosts) : null,
      grossRentWeekly: parseFloat(grossRentWeekly) || 0,
      rentalExpensesPercent: parseFloat(rentalExpensesPercent) || 0,
      cashInvested: cInvest,
      equityInvested: eInvest,
      loanCostsManual: loanCosts ? parseFloat(loanCosts) : null,
      interestRate: parseFloat(interestRate) || 0,
      loanType,
      additionalLoan: aLoan,
      renovationCosts: rCosts,
      furnitureCosts: fCosts,
      holdingCosts: hCosts,
      capitalGrowthRate: parseFloat(capitalGrowthRate) || 0,
      inflationRate: parseFloat(inflationRate) || 0,
      chattelsValue: parseFloat(chattelsValue) || 0,
      depreciationMethod,
      chattelsDepreciationRate: parseFloat(chattelsDepreciationRate) || 0,
      buildingDepreciationRate: parseFloat(buildingDepreciationRate) || 0,
      investorTaxRate: parseFloat(investorTaxRate) || 0,
      interestDeductibility: parseFloat(interestDeductibility) || 0,
      isNewBuild,
      ringFencing,
      renovationTimeline,
      furnitureTimeline,
    });

    const yr1p = res.projections[0];
    res.originalInputs = {
      propertyValue: pValue + rCosts,
      purchaseCosts: res.purchaseCosts,
      investments: cInvest + eInvest,
      loanAmount: res.loanAmount,
      equity: res.startingEquity,
      capitalGrowthRate: parseFloat(capitalGrowthRate) || 0,
      inflationRate: parseFloat(inflationRate) || 0,
      grossRentWeekly: parseFloat(grossRentWeekly) || 0,
      annualInterest: yr1p?.annualInterest ?? 0,
      annualRentalExpenses: yr1p?.annualRentalExpenses ?? 0,
      preTaxCashFlow: yr1p?.preTaxCashFlow ?? 0,
      chattelsDepreciation: yr1p?.chattelsDepreciation ?? 0,
      buildingDepreciation: yr1p?.buildingDepreciation ?? 0,
      loanCosts: res.loanCosts,
      totalDeductions: yr1p?.deductions ?? 0,
      taxCredit: yr1p?.taxCredit ?? 0,
      afterTaxCashFlow: yr1p?.afterTaxCashFlow ?? 0,
    };

    setResult(res);
  }, [
    propertyValue, purchaseCosts, grossRentWeekly, rentalExpensesPercent,
    cashInvested, equityInvested, loanCosts, interestRate, loanType, additionalLoan,
    renovationCosts, furnitureCosts, holdingCosts,
    capitalGrowthRate, inflationRate,
    chattelsValue, depreciationMethod, chattelsDepreciationRate, buildingDepreciationRate,
    investorTaxRate, investorType, interestDeductibility, isNewBuild, ringFencing,
    renovationTimeline, furnitureTimeline
  ]);

  useEffect(() => {
    const timer = setTimeout(performCalculation, 300);
    return () => clearTimeout(timer);
  }, [performCalculation]);

  const m = result?.metrics;

  return (
    <div className="min-h-screen bg-white flex justify-center p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] w-full">

        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-[24px] font-bold text-[#0052CC]">
            Property Investment Calculator
          </h2>
          <button
            onClick={handleReset}
            className="text-[#64748B] text-[13px] font-bold hover:text-[#0052CC] transition-colors underline"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {/* ── LEFT PANEL — INPUTS ─────────────────────────────────────── */}
          <div className="w-full lg:w-[420px] flex-shrink-0 bg-[#F8F8F8] rounded-[16px] p-6 md:p-8 flex flex-col border border-[#E2E8F0]">
            <h3 className="text-[15px] font-bold text-[#23303B] mb-6 leading-snug">
              Model investment property performance over 10 years.
            </h3>

            <div className="flex-1 overflow-y-auto pr-1">

              <PropertyDetailsSection
                propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress}
                propertyDescription={propertyDescription} setPropertyDescription={setPropertyDescription}
                propertyValue={propertyValue} setPropertyValue={setPropertyValue}
                purchaseCosts={purchaseCosts} setPurchaseCosts={setPurchaseCosts}
                grossRentWeekly={grossRentWeekly} setGrossRentWeekly={setGrossRentWeekly}
                rentalExpensesPercent={rentalExpensesPercent} setRentalExpensesPercent={setRentalExpensesPercent}
                setActiveModal={setActiveModal}
                renovationCosts={renovationCosts}
                renovationTimeline={renovationTimeline}
              />

              <FinancingInputsSection
                cashInvested={cashInvested} setCashInvested={setCashInvested}
                equityInvested={equityInvested} setEquityInvested={setEquityInvested}
                loanCosts={loanCosts} setLoanCosts={setLoanCosts}
                interestRate={interestRate} setInterestRate={setInterestRate}
                loanType={loanType} setLoanType={setLoanType}
                additionalLoan={additionalLoan} setAdditionalLoan={setAdditionalLoan}
                loanError={loanError}
                setIsModalOpen={setIsModalOpen}
              />

              <GrowthAndInflationSection
                capitalGrowthRate={capitalGrowthRate} setCapitalGrowthRate={setCapitalGrowthRate}
                inflationRate={inflationRate} setInflationRate={setInflationRate}
              />

              <DepreciationSection
                chattelsValue={chattelsValue} setChattelsValue={setChattelsValue}
                depreciationMethod={depreciationMethod} setDepreciationMethod={setDepreciationMethod}
                chattelsDepreciationRate={chattelsDepreciationRate} setChattelsDepreciationRate={setChattelsDepreciationRate}
                buildingDepreciationRate={buildingDepreciationRate} setBuildingDepreciationRate={setBuildingDepreciationRate}
              />

              <TaxSettingsSection
                investorTaxRate={investorTaxRate} setInvestorTaxRate={setInvestorTaxRate}
                investorType={investorType} setInvestorType={setInvestorType}
                isNewBuild={isNewBuild} handleNewBuildToggle={handleNewBuildToggle}
                interestDeductibility={interestDeductibility} setInterestDeductibility={setInterestDeductibility}
                ringFencing={ringFencing} setRingFencing={setRingFencing}
              />

            </div>

            <button
              onClick={performCalculation}
              className="mt-6 w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors shadow-sm"
            >
              CALCULATE
            </button>
          </div>

          {/* ── RIGHT PANEL — RESULTS ──────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5 w-full min-w-0">

            {/* §6.2 Property Details Summary Panel */}
            <div className="bg-[#F8F8F8] rounded-[16px] p-6 border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">
                Property Details
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["Property cost", fmt((parseFloat(propertyValue) || 0) + (parseFloat(renovationCosts) || 0))],
                  ["Total cost", fmt(result?.totalCost)],
                  ["Gross rent (yr 1)", fmt(result?.projections?.[0]?.annualGrossRent)],
                  ["Gross yield (yr 1)", fmtPct(m?.grossYieldYr1)],
                  ["Net rent (yr 1)", fmt(m?.netRentYr1)],
                  ["Net yield (yr 1)", fmtPct(m?.netYieldYr1)],
                  ["Cash neutral investment", fmt(m?.cashNeutralInvestment)],
                  ["Cash positive by", m?.cashPositiveYear ? `Year ${m.cashPositiveYear}` : "—"],
                ].map(([label, val]) => (
                  <React.Fragment key={label}>
                    <span className="text-[13px] text-[#64748B]">{label}</span>
                    <span className="text-[13px] font-medium text-[#1E293B] text-right">{val}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 10-Year Summary */}
            <div className="bg-[#F8F8F8] rounded-[16px] p-6 border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">
                10-Year Summary
              </h3>
              <div className="bg-[#0052CC] rounded-[8px] py-4 px-5 flex justify-between items-center mb-5">
                <span className="text-white font-medium text-[14px]">Total equity in 10 years</span>
                <span className="text-white font-bold text-[18px]">
                  {result ? fmt(m.totalEquityIn10Years) : "—"}
                </span>
              </div>
              {[
                ["Average rent per week", fmt(m?.avgWeeklyRent)],
                ["Average expenses per week", fmt(m?.avgWeeklyExpenses)],
                ["Average cashflow per week", fmt(m?.avgWeeklyCashflow)],
                ["10-year IRR", m?.irr != null ? m.irr.toFixed(2) + "%" : "N/A"],
                ["Pre-tax equivalent IRR", m?.preTaxEquivalentIRR != null ? m.preTaxEquivalentIRR.toFixed(2) + "%" : "N/A"],
                ["Over 10 years, property is", m?.isCashflowPositive ? "Cashflow positive ✓" : "Cashflow negative"],
                ["Average equity gain / week", fmt(m?.avgEquityGainWeekly)],
                ["Average net gain / week", fmt(m?.avgNetGainWeekly)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-[6px] border-b border-[#F1F5F9] last:border-0">
                  <span className="text-[13px] text-[#64748B]">{label}</span>
                  <span className="text-[13px] font-medium text-[#1E293B]">{val}</span>
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <button className="flex-1 bg-[#23303B] hover:bg-[#1a242c] text-white font-medium py-3 rounded-[8px] transition-colors text-[13px]">
                  Talk to an advisor
                </button>
              </div>
              <div className="flex gap-3 mt-3">
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">
                  Save scenario
                </button>
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">
                  Share report (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* §6.1: Full-width projections grid */}
        {result && (
          <div className="mt-8 mb-8">
            <h3 className="text-[#23303B] font-bold text-[18px] mb-4">
              10-Year Projections Grid
            </h3>
            <ProjectionsGrid
              projections={result.projections}
              metrics={result.metrics}
              inputs={result.originalInputs}
            />
          </div>
        )}
      </div>

      <LoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{
          propertyValue: parseFloat(propertyValue) || 0,
          cashInvested: parseFloat(cashInvested) || 0,
          equityInvested: parseFloat(equityInvested) || 0,
          purchaseCosts: result?.purchaseCosts || 0,
          loanCosts: parseFloat(loanCosts) || 0,
          additionalLoan: parseFloat(additionalLoan) || 0,
          renovationCosts: parseFloat(renovationCosts) || 0,
          furnitureCosts: parseFloat(furnitureCosts) || 0,
          holdingCosts: parseFloat(holdingCosts) || 0,
          loanAmount: result?.loanAmount || 0,
        }}
        setters={{ setRenovationCosts, setFurnitureCosts, setHoldingCosts }}
      />

      <PropertyValueModal
        isOpen={activeModal === "propertyValue"}
        onClose={() => setActiveModal(null)}
        propertyValue={propertyValue} setPropertyValue={setPropertyValue}
        holdingCosts={holdingCosts} setHoldingCosts={setHoldingCosts}
        furnitureCosts={furnitureCosts} setFurnitureCosts={setFurnitureCosts}
        propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress}
        propertyDescription={propertyDescription} setPropertyDescription={setPropertyDescription}
        renovationTimeline={renovationTimeline} setRenovationTimeline={setRenovationTimeline}
        furnitureTimeline={furnitureTimeline} setFurnitureTimeline={setFurnitureTimeline}
        linkValueFittings={linkValueFittings} setLinkValueFittings={setLinkValueFittings}
        linkConstructionCost={linkConstructionCost} setLinkConstructionCost={setLinkConstructionCost}
        projections={result?.projections || []}
        renovationCosts={renovationCosts} setRenovationCosts={setRenovationCosts}
      />
      <PurchaseCostsModal
        isOpen={activeModal === "purchaseCosts"}
        onClose={() => setActiveModal(null)}
        purchaseCosts={purchaseCosts}
        setPurchaseCosts={setPurchaseCosts}
        propertyValue={propertyValue}
      />
      <RentalIncomeModal
        isOpen={activeModal === "rentalIncome"}
        onClose={() => setActiveModal(null)}
        grossRentWeekly={grossRentWeekly}
        setGrossRentWeekly={setGrossRentWeekly}
      />
      <RentalIncomeModal
        isOpen={activeModal === "rentalIncome"}
        onClose={() => setActiveModal(null)}
        grossRentWeekly={grossRentWeekly}
        setGrossRentWeekly={setGrossRentWeekly}
        
        inflationRate={inflationRate}
        rentTimeline={rentTimeline}
        setRentTimeline={setRentTimeline}
      />
    </div>
  );
}