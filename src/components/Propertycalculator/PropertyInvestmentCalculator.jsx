import React, { useState, useEffect, useCallback } from "react";
import ProjectionsGridModal from "..//ProjectionsGrid";
import { calculatePIA } from "../../helpers/propertyHelpers";
import PropertyValueModal from "./componenets/propertyprice/PropertyPriceModal";
import PurchaseCostsModal from "./componenets/propertyprice/PurchaseCostsModal";
import PropertyDetailsSection from "./sections/property/PropertyDetailsSection";
import FinancingInputsSection from "./sections/finance/FinancingInputsSection";
import InvestorSection from "./sections/Investor/InvestorSection";
import WhatIfSection from "./sections/whatif/WhatIfSection";
import RentalIncomeModal from "./componenets/propertyprice/RentalIncomeModal";
import RentalExpensesModal from "./componenets/propertyprice/RentalExpensesModal";
import BuildingDepreciationModal from "./componenets/propertyprice/BuildingDepreciationModal";
import ChattelsDepreciationModal from "./componenets/propertyprice/ChattelsDepreciationModal";
import LoanAmountModal from "./componenets/financemodals/LoanAmountModal";
import LoanInterestTypeModal from "./componenets/financemodals/LoanInterestTypeModal";
import LoanCostsModal from "./componenets/financemodals/LoanCostsModal";
import InvestorDetailsModal from "./componenets/investormodals/InvestorDetailsModal";
import HomeLoanDetailsModal from "./componenets/investormodals/HomeLoanDetailsModal";
import TaxCreditsModal from "./componenets/investormodals/TaxCreditsModal";
import InflationRateModal from "./componenets/whatifmodals/InflationRateModal";
const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

const DEFAULTS = {
  propertyAddress: "",
  propertyDescription: "",
  propertyValue: "750000",
  purchaseCosts: "3840",
  grossRentWeekly: "700",
  rentalExpensesPercent: "29.77",
  cashInvested: "75000",
  loanCosts: "7224",
  equityInvested: "0",
  interestRate: "6.50",
  loanType: "Interest only",
  additionalLoan: "0",
  renovationCosts: "0",
  furnitureCosts: "0",
  holdingCosts: "0",
  capitalGrowthRate: "5.00",
  inflationRate: "3.00",
  chattelsValue: "45000",
  depreciationMethod: "DV",
  chattelsDepreciationRate: "25",
  buildingDepreciationRate: "0",
  investorTaxRate: "33",
  investorType: "Individual",
  interestDeductibility: "100",
  isNewBuild: false,
  ringFencing: true,
  taxWriteOffPeriod: "1",
  investorDetails: "Person(s)",
  jointWorkIncome: "170,000",
  jointWorkDeductions: "0",
  principalResidence: "900,000",
  amountOwing: "630,000",
  homeLoanRepayments: "58,338",
  livingExpenses: "45,000",
  portfolioProperties: "0",
  portfolioValue: "0",
  taxableIncomeSingle: "120,000",
  // Added What If Defaults
  rentalIncomeRate: "3.00",
  rentalExpenseRate: "3.00",
  taxableIncomeRate: "3.00",
  livingExpensesRate: "3.00",
};

const fmt = (val) => val !== null && val !== undefined ? "$" + Math.round(val).toLocaleString("en-NZ") : "—";
const fmtPct = (val) => val !== null && val !== undefined ? val.toFixed(2) + "%" : "—";

export default function PropertyInvestmentCalculator() {
  const [propertyAddress, setPropertyAddress] = useState(DEFAULTS.propertyAddress);
  const [propertyDescription, setPropertyDescription] = useState(DEFAULTS.propertyDescription);
  const [propertyValue, setPropertyValue] = useState(DEFAULTS.propertyValue);
  const [purchaseCosts, setPurchaseCosts] = useState(DEFAULTS.purchaseCosts);
  const [grossRentWeekly, setGrossRentWeekly] = useState(DEFAULTS.grossRentWeekly);
  const [rentalExpensesPercent, setRentalExpensesPercent] = useState(DEFAULTS.rentalExpensesPercent);
  const [rentTimeline, setRentTimeline] = useState([]);
  const [renovationTimeline, setRenovationTimeline] = useState([]);
  const [furnitureTimeline, setFurnitureTimeline] = useState([]);
  const [linkValueFittings, setLinkValueFittings] = useState(true);
  const [linkConstructionCost, setLinkConstructionCost] = useState(true);
  const [isProjectionsModalOpen, setIsProjectionsModalOpen] = useState(false);
  const [cashInvested, setCashInvested] = useState(DEFAULTS.cashInvested);
  const [taxWriteOffPeriod, setTaxWriteOffPeriod] = useState(DEFAULTS.taxWriteOffPeriod);
  const [equityInvested, setEquityInvested] = useState(DEFAULTS.equityInvested);
  const [loanCosts, setLoanCosts] = useState(DEFAULTS.loanCosts);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanType, setLoanType] = useState(DEFAULTS.loanType);
  const [additionalLoan, setAdditionalLoan] = useState(DEFAULTS.additionalLoan);
  const [renovationCosts, setRenovationCosts] = useState(DEFAULTS.renovationCosts);
  const [furnitureCosts, setFurnitureCosts] = useState(DEFAULTS.furnitureCosts);
  const [holdingCosts, setHoldingCosts] = useState(DEFAULTS.holdingCosts);

  // What If Section States
  const [capitalGrowthRate, setCapitalGrowthRate] = useState(DEFAULTS.capitalGrowthRate);
  const [inflationRate, setInflationRate] = useState(DEFAULTS.inflationRate);
  const [rentalIncomeRate, setRentalIncomeRate] = useState(DEFAULTS.rentalIncomeRate);
  const [rentalExpenseRate, setRentalExpenseRate] = useState(DEFAULTS.rentalExpenseRate);
  const [taxableIncomeRate, setTaxableIncomeRate] = useState(DEFAULTS.taxableIncomeRate);
  const [livingExpensesRate, setLivingExpensesRate] = useState(DEFAULTS.livingExpensesRate);

  const [chattelsValue, setChattelsValue] = useState(DEFAULTS.chattelsValue);
  const [depreciationMethod, setDepreciationMethod] = useState(DEFAULTS.depreciationMethod);
  const [chattelsDepreciationRate, setChattelsDepreciationRate] = useState(DEFAULTS.chattelsDepreciationRate);
  const [buildingDepreciationRate, setBuildingDepreciationRate] = useState(DEFAULTS.buildingDepreciationRate);

  const [investorTaxRate, setInvestorTaxRate] = useState(DEFAULTS.investorTaxRate);
  const [investorType, setInvestorType] = useState(DEFAULTS.investorType);
  const [interestDeductibility, setInterestDeductibility] = useState(DEFAULTS.interestDeductibility);
  const [isNewBuild, setIsNewBuild] = useState(DEFAULTS.isNewBuild);
  const [ringFencing, setRingFencing] = useState(DEFAULTS.ringFencing);
  const [buildingDepreciation, setBuildingDepreciation] = useState("0");
  const [chattelsDepreciation, setChattelsDepreciation] = useState("11250");
  const [result, setResult] = useState(null);
  const [loanError, setLoanError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // New Investor State Variables
  const [investorDetails, setInvestorDetails] = useState(DEFAULTS.investorDetails);
  const [jointWorkIncome, setJointWorkIncome] = useState(DEFAULTS.jointWorkIncome);
  const [jointWorkDeductions, setJointWorkDeductions] = useState(DEFAULTS.jointWorkDeductions);
  const [principalResidence, setPrincipalResidence] = useState(DEFAULTS.principalResidence);
  const [amountOwing, setAmountOwing] = useState(DEFAULTS.amountOwing);
  const [homeLoanRepayments, setHomeLoanRepayments] = useState(DEFAULTS.homeLoanRepayments);
  const [livingExpenses, setLivingExpenses] = useState(DEFAULTS.livingExpenses);
  const [portfolioProperties, setPortfolioProperties] = useState(DEFAULTS.portfolioProperties);
  const [portfolioValue, setPortfolioValue] = useState(DEFAULTS.portfolioValue);
  const [taxableIncomeSingle, setTaxableIncomeSingle] = useState(DEFAULTS.taxableIncomeSingle);

  const [loanA, setLoanA] = useState({
    amount: "0", rates: Array(5).fill(DEFAULTS.interestRate), type: "IO",
    ioFrom: "1", ioTo: "40", piFrom: "1", piTo: "25", capFrom: "1", capTo: "40", clFrom: "1", clTo: "40"
  });

  const [loanB, setLoanB] = useState({
    amount: "0", rates: Array(5).fill("0.00"), type: "IO",
    ioFrom: "1", ioTo: "40", piFrom: "1", piTo: "25", capFrom: "1", capTo: "40", clFrom: "1", clTo: "40"
  });

  useEffect(() => {
    if (result?.loanAmount && parseNum(loanB.amount) === 0) {
      setLoanA(prev => ({
        ...prev,
        amount: String(Math.round(result.loanAmount)),
        rates: Array(5).fill(String(interestRate))
      }));
    }
  }, [result?.loanAmount, interestRate, loanB.amount]);


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
    setRentalIncomeRate(DEFAULTS.rentalIncomeRate);
    setRentalExpenseRate(DEFAULTS.rentalExpenseRate);
    setTaxableIncomeRate(DEFAULTS.taxableIncomeRate);
    setLivingExpensesRate(DEFAULTS.livingExpensesRate);
    setChattelsValue(DEFAULTS.chattelsValue);
    setDepreciationMethod(DEFAULTS.depreciationMethod);
    setChattelsDepreciationRate(DEFAULTS.chattelsDepreciationRate);
    setBuildingDepreciationRate(DEFAULTS.buildingDepreciationRate);
    setInvestorTaxRate(DEFAULTS.investorTaxRate);
    setInvestorType(DEFAULTS.investorType);
    setInterestDeductibility(DEFAULTS.interestDeductibility);
    setIsNewBuild(DEFAULTS.isNewBuild);
    setRingFencing(DEFAULTS.ringFencing);

    // Reset Investor values
    setInvestorDetails(DEFAULTS.investorDetails);
    setJointWorkIncome(DEFAULTS.jointWorkIncome);
    setJointWorkDeductions(DEFAULTS.jointWorkDeductions);
    setPrincipalResidence(DEFAULTS.principalResidence);
    setAmountOwing(DEFAULTS.amountOwing);
    setHomeLoanRepayments(DEFAULTS.homeLoanRepayments);
    setLivingExpenses(DEFAULTS.livingExpenses);
    setPortfolioProperties(DEFAULTS.portfolioProperties);
    setPortfolioValue(DEFAULTS.portfolioValue);
    setTaxableIncomeSingle(DEFAULTS.taxableIncomeSingle);

    setResult(null);
    setLoanError("");
    setLoanB(prev => ({ ...prev, amount: "0", rates: Array(5).fill("0.00") }));
  }, []);

  const handleNewBuildToggle = useCallback((val) => {
    setIsNewBuild(val);
    if (val) setInterestDeductibility("100");
  }, []);

 const performCalculation = useCallback(() => {
    const pValue = parseNum(propertyValue);
    const cInvest = parseNum(cashInvested);
    const eInvest = parseNum(equityInvested);
    const lCostsRaw = String(loanCosts).trim();
    const aLoan = parseNum(additionalLoan);
    const rCosts = parseNum(renovationCosts);
    const fCosts = parseNum(furnitureCosts);
    const hCosts = parseNum(holdingCosts);
    const pCostsRaw = String(purchaseCosts).trim();

    const calcLoan = pValue + (pCostsRaw !== "" ? parseNum(purchaseCosts) : pValue * 0.005) + (lCostsRaw !== "" ? parseNum(loanCosts) : 0) + aLoan + rCosts + fCosts + hCosts - cInvest - eInvest;

    if (calcLoan > pValue && pValue > 0) {
      setLoanError("Loan amount cannot exceed property value");
    } else {
      setLoanError("");
    }

    if (pValue === 0) return;

    const res = calculatePIA({
      propertyValue: pValue,
      purchaseCostsManual: pCostsRaw !== "" ? parseNum(purchaseCosts) : null,
      grossRentWeekly: parseNum(grossRentWeekly),
      rentalExpensesPercent: parseNum(rentalExpensesPercent),
      cashInvested: cInvest,
      equityInvested: eInvest,
      loanCostsManual: lCostsRaw !== "" ? parseNum(loanCosts) : null,
      interestRate: parseNum(interestRate),
      loanType,
      additionalLoan: aLoan,
      renovationCosts: rCosts,
      furnitureCosts: fCosts,
      holdingCosts: hCosts,
      capitalGrowthRate: parseNum(capitalGrowthRate),
      inflationRate: parseNum(inflationRate),
      rentalIncomeRate: parseNum(rentalIncomeRate), // Pushed to engine
      rentalExpenseRate: parseNum(rentalExpenseRate), // Pushed to engine
      chattelsValue: parseNum(chattelsValue) || 45000,
      depreciationMethod,
      chattelsDepreciationRate: parseNum(chattelsDepreciationRate) || 25,
      buildingDepreciationRate: parseNum(buildingDepreciationRate),
      investorTaxRate: parseNum(investorTaxRate),
      interestDeductibility: parseNum(interestDeductibility),
      isNewBuild,
      ringFencing,
      renovationTimeline,
      furnitureTimeline,
      loanA,
      loanB
    });

    const yr1p = res.projections[0];

    res.originalInputs = {
      propertyValue: pValue + rCosts,
      purchaseCosts: res.purchaseCosts,
      investments: cInvest + eInvest,
      loanAmount: res.loanAmount,
      equity: res.startingEquity,
      capitalGrowthRate: parseNum(capitalGrowthRate),
      inflationRate: parseNum(inflationRate),
      grossRentWeekly: parseNum(grossRentWeekly),
      interestRate: parseNum(interestRate),
      rentalExpensesPercent: parseNum(rentalExpensesPercent),
      preTaxCashFlow: -(cInvest + eInvest),
      chattelsValue: parseNum(chattelsValue) || 45000,
      buildingDepreciationRate: parseNum(buildingDepreciationRate),
      loanCosts: res.loanCosts,
      totalDeductions: yr1p?.deductions ?? 0,
      investorIncome: parseNum(taxableIncomeSingle) || 120000, // Linked dynamically to your input!
      taxCredit: yr1p?.taxCredit ?? 0,
      afterTaxCashFlow: -(cInvest + eInvest),
    };

    setResult(res);
  }, [
    propertyValue, purchaseCosts, grossRentWeekly, rentalExpensesPercent,
    cashInvested, equityInvested, loanCosts, interestRate, loanType, additionalLoan,
    renovationCosts, furnitureCosts, holdingCosts,
    capitalGrowthRate, inflationRate,
    chattelsValue, depreciationMethod, chattelsDepreciationRate, buildingDepreciationRate,
    investorTaxRate, investorType, interestDeductibility, isNewBuild, ringFencing,
    renovationTimeline, furnitureTimeline, loanA, loanB,
    jointWorkIncome, 
    taxableIncomeSingle, 
    rentalIncomeRate,   
    rentalExpenseRate    
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
          <h2 className="text-[24px] font-bold text-[#0052CC]"></h2>
          <button
            onClick={handleReset}
            className="text-[#64748B] text-[13px] font-bold hover:text-[#0052CC] transition-colors underline"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
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
                buildingDepreciation={buildingDepreciation}
                setBuildingDepreciation={setBuildingDepreciation}
                chattelsDepreciation={chattelsDepreciation}
                setChattelsDepreciation={setChattelsDepreciation}
              />

              <FinancingInputsSection
                cashInvested={cashInvested} setCashInvested={setCashInvested}
                equityInvested={equityInvested} setEquityInvested={setEquityInvested}
                loanCosts={loanCosts} setLoanCosts={setLoanCosts}
                interestRate={interestRate} setInterestRate={setInterestRate}
                loanType={loanType} setLoanType={setLoanType}
                additionalLoan={additionalLoan} setAdditionalLoan={setAdditionalLoan}
                taxWriteOffPeriod={taxWriteOffPeriod} setTaxWriteOffPeriod={setTaxWriteOffPeriod}
                loanError={loanError}
                loanA={loanA}        // <-- Passed securely
                loanB={loanB}        // <-- Passed securely
                setLoanA={setLoanA}  // <-- Passed securely
                setIsModalOpen={setIsModalOpen}
                propertyValue={propertyValue}
                purchaseCosts={purchaseCosts}
                renovationCosts={renovationCosts}
              />

              <InvestorSection
                investorDetails={investorDetails} setInvestorDetails={setInvestorDetails}
                jointWorkIncome={jointWorkIncome} setJointWorkIncome={setJointWorkIncome}
                jointWorkDeductions={jointWorkDeductions} setJointWorkDeductions={setJointWorkDeductions}
                principalResidence={principalResidence} setPrincipalResidence={setPrincipalResidence}
                amountOwing={amountOwing} setAmountOwing={setAmountOwing}
                homeLoanRepayments={homeLoanRepayments} setHomeLoanRepayments={setHomeLoanRepayments}
                livingExpenses={livingExpenses} setLivingExpenses={setLivingExpenses}
                portfolioProperties={portfolioProperties} setPortfolioProperties={setPortfolioProperties}
                portfolioValue={portfolioValue} setPortfolioValue={setPortfolioValue}
                taxableIncomeSingle={taxableIncomeSingle} setTaxableIncomeSingle={setTaxableIncomeSingle}
                setActiveModal={setActiveModal}
              />

             <WhatIfSection
                inflationRate={inflationRate} setInflationRate={setInflationRate}
                rentalIncomeRate={rentalIncomeRate} setRentalIncomeRate={setRentalIncomeRate}
                rentalExpenseRate={rentalExpenseRate} setRentalExpenseRate={setRentalExpenseRate}
                taxableIncomeRate={taxableIncomeRate} setTaxableIncomeRate={setTaxableIncomeRate}
                livingExpensesRate={livingExpensesRate} setLivingExpensesRate={setLivingExpensesRate}
                capitalGrowthRate={capitalGrowthRate} setCapitalGrowthRate={setCapitalGrowthRate}
                setActiveModal={setActiveModal} 
              />

            </div>

            <button
              onClick={performCalculation}
              className="mt-6 w-full bg-[#39a859] hover:bg-[#32994f] text-white font-bold py-3.5 rounded-[8px] transition-colors shadow-sm"
            >
              CALCULATE
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-5 w-full min-w-0">
            <div className="bg-[#F8F8F8] rounded-[16px] p-6 border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">Property Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["Property cost", fmt((parseFloat(propertyValue) || 0) + (parseFloat(renovationCosts) || 0))],
                  ["Total cost", fmt(result?.totalCost)],
                  ["Gross rent (yr 1)", fmt(result?.projections?.[0]?.annualGrossRent)],
                  ["Gross yield (yr 1)", fmtPct(m?.grossYieldYr1)],
                  ["Net rent (yr 1)", fmt(m?.netRentYr1)],
                  ["Net yield (yr 1)", fmtPct(m?.netYieldYr1)],
                  ["Cash neutral investment", fmt(m?.cashNeutralInvestment)],
               ["Cash positive by", m?.cashPositiveYear ? m.cashPositiveYear : "—"],
               ].map(([label, val]) => (
                  <React.Fragment key={label}>
                    <span className="text-[13px] text-[#64748B]">{label}</span>
                    <span className="text-[13px] font-medium text-[#1E293B] text-right">{val}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="bg-[#F8F8F8] rounded-[16px] p-6 border border-[#E2E8F0]">
              <h3 className="text-[#23303B] font-bold text-[15px] mb-4">10-Year Summary</h3>
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
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">Save scenario</button>
                <button className="flex-1 bg-white border border-[#E2E8F0] text-[#23303B] font-bold py-3 rounded-[8px] hover:bg-[#F1F5F9] transition-colors text-[13px]">Share report (PDF)</button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-8 mb-8 flex justify-center">
            <button
              onClick={() => setIsProjectionsModalOpen(true)}
              className="bg-white border-2 border-[#0052CC] text-[#0052CC] font-bold py-3 px-8 rounded-[8px] hover:bg-[#F1F5F9] transition-colors shadow-sm"
            >
              View Detailed Data Grid
            </button>
          </div>
        )}
      </div>
      <ProjectionsGridModal
        isOpen={isProjectionsModalOpen}
        onClose={() => setIsProjectionsModalOpen(false)}
        projections={result?.projections || []}
        metrics={result?.metrics}
        inputs={result?.originalInputs}
      />
      <PropertyValueModal isOpen={activeModal === "propertyValue"} onClose={() => setActiveModal(null)} propertyValue={propertyValue} setPropertyValue={setPropertyValue} holdingCosts={holdingCosts} setHoldingCosts={setHoldingCosts} furnitureCosts={furnitureCosts} setFurnitureCosts={setFurnitureCosts} propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress} propertyDescription={propertyDescription} setPropertyDescription={setPropertyDescription} renovationTimeline={renovationTimeline} setRenovationTimeline={setRenovationTimeline} furnitureTimeline={furnitureTimeline} setFurnitureTimeline={setFurnitureTimeline} linkValueFittings={linkValueFittings} setLinkValueFittings={setLinkValueFittings} linkConstructionCost={linkConstructionCost} setLinkConstructionCost={setLinkConstructionCost} projections={result?.projections || []} renovationCosts={renovationCosts} setRenovationCosts={setRenovationCosts} />
      <PurchaseCostsModal isOpen={activeModal === "purchaseCosts"} onClose={() => setActiveModal(null)} purchaseCosts={purchaseCosts} setPurchaseCosts={setPurchaseCosts} propertyValue={propertyValue} />
      <RentalIncomeModal isOpen={activeModal === "rentalIncome"} onClose={() => setActiveModal(null)} grossRentWeekly={grossRentWeekly} setGrossRentWeekly={setGrossRentWeekly} inflationRate={inflationRate} rentTimeline={rentTimeline} setRentTimeline={setRentTimeline} />
      <RentalExpensesModal isOpen={activeModal === "rentalExpenses"} onClose={() => setActiveModal(null)} grossRentWeekly={grossRentWeekly} propertyValue={propertyValue} rentalExpensesPercent={rentalExpensesPercent} setRentalExpensesPercent={setRentalExpensesPercent} />
      <BuildingDepreciationModal isOpen={activeModal === "buildingDepreciation"} onClose={() => setActiveModal(null)} propertyValue={propertyValue} renovationCosts={renovationCosts} buildingDepreciation={buildingDepreciation} setBuildingDepreciation={setBuildingDepreciation} />
      <ChattelsDepreciationModal isOpen={activeModal === "chattelsDepreciation"} chattelsDepreciation={chattelsDepreciation} onClose={() => setActiveModal(null)} propertyValue={propertyValue} setChattelsDepreciation={setChattelsDepreciation} />

      <LoanAmountModal
        isOpen={isModalOpen === "loanAmount" || isModalOpen === true}
        onClose={() => setIsModalOpen(false)}
        propertyCost={parseNum(propertyValue)}
        renovationCosts={parseNum(renovationCosts)}
        purchaseCosts={purchaseCosts && String(purchaseCosts).trim() !== "" ? parseNum(purchaseCosts) : parseNum(propertyValue) * 0.005}
        furnitureCosts={parseNum(furnitureCosts)}
        holdingCosts={parseNum(holdingCosts)}
        loanCosts={(!loanCosts || String(loanCosts).trim() === "")
          ? (((parseNum(propertyValue) + (purchaseCosts ? parseNum(purchaseCosts) : parseNum(propertyValue) * 0.005) + parseNum(renovationCosts) + 363 + parseNum(additionalLoan) - parseNum(cashInvested) - parseNum(equityInvested)) / 0.99) * 0.01) + 363
          : parseNum(loanCosts)
        }
        initialCashInvested={parseNum(cashInvested)}
        initialEquityInvested={parseNum(equityInvested)}
        initialAdditionalLoan={parseNum(additionalLoan)}
        setCashInvested={setCashInvested}
        setEquityInvested={setEquityInvested}
        setAdditionalLoan={setAdditionalLoan}
        setLoanCosts={setLoanCosts}
      />

      <LoanInterestTypeModal
        isOpen={isModalOpen === "interestRate"}
        onClose={() => setIsModalOpen(false)}

        loanA={loanA}
        setLoanA={setLoanA}
        loanB={loanB}
        setLoanB={setLoanB}

        setInterestRate={setInterestRate}
      />
      <LoanCostsModal
        isOpen={isModalOpen === "loanCosts"}
        onClose={() => setIsModalOpen(false)}
        // FIX: Pass the base loan amount BEFORE costs are applied
        baseLoanRequired={
          parseNum(propertyValue) +
          (purchaseCosts && String(purchaseCosts).trim() !== "" ? parseNum(purchaseCosts) : parseNum(propertyValue) * 0.005) +
          parseNum(renovationCosts) +
          parseNum(additionalLoan) -
          parseNum(cashInvested) -
          parseNum(equityInvested)
        }
        setLoanCosts={setLoanCosts}
      />
      <InvestorDetailsModal
        // Map it so ANY of these edit buttons open this modal
        isOpen={[
          "investorDetails",
          "jointWorkIncome",
          "jointWorkDeductions",

        ].includes(activeModal)}

        onClose={() => setActiveModal(null)}
        investorDetails={investorDetails}
        setInvestorDetails={setInvestorDetails}
        jointWorkIncome={jointWorkIncome}
        setJointWorkIncome={setJointWorkIncome}
        jointWorkDeductions={jointWorkDeductions}
        setJointWorkDeductions={setJointWorkDeductions}
        taxableIncomeSingle={taxableIncomeSingle}
        setTaxableIncomeSingle={setTaxableIncomeSingle}
      />
      <HomeLoanDetailsModal
        isOpen={["principalResidence", "amountOwing", "homeLoanRepayments"].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        principalResidence={principalResidence}
        setPrincipalResidence={setPrincipalResidence}
        amountOwing={amountOwing}
        setAmountOwing={setAmountOwing}
        homeLoanRepayments={homeLoanRepayments}
        setHomeLoanRepayments={setHomeLoanRepayments}
      />
      <TaxCreditsModal
        isOpen={["taxableIncomeSingle"].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        investorIncome={taxableIncomeSingle} // <-- PROPERLY PASSED FROM PARENT
        partnerIncome={jointWorkIncome}      // <-- PROPERLY PASSED FROM PARENT
        projections={result?.projections || []}
        onSave={(newTotal) => setTaxableIncomeSingle(newTotal)}
      />
    {/* WHAT IF MODAL: Handles all inflation and indexed rates */}
      <InflationRateModal 
        isOpen={[
          "inflationRate", 
          "rentalIncomeRate", 
          "rentalExpenseRate", 
          "taxableIncomeRate", 
          "livingExpensesRate"
        ].includes(activeModal)} 
        onClose={() => setActiveModal(null)} 
        activeModalType={activeModal}
        inflationRate={inflationRate} setInflationRate={setInflationRate}
        rentalIncomeRate={rentalIncomeRate} setRentalIncomeRate={setRentalIncomeRate}
        rentalExpenseRate={rentalExpenseRate} setRentalExpenseRate={setRentalExpenseRate}
        taxableIncomeRate={taxableIncomeRate} setTaxableIncomeRate={setTaxableIncomeRate}
        livingExpensesRate={livingExpensesRate} setLivingExpensesRate={setLivingExpensesRate}
      />
    </div>
  );
}