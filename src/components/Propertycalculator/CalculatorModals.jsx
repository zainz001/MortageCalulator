import React from "react";
import ProjectionsGridModal from "..//ProjectionsGrid";
import PropertyValueModal from "./componenets/property/PropertyPriceModal";
import PurchaseCostsModal from "./componenets/property/PurchaseCostsModal";
import RentalIncomeModal from "./componenets/property/RentalIncomeModal";
import RentalExpensesModal from "./componenets/property/RentalExpensesModal";
import BuildingDepreciationModal from "./componenets/property/BuildingDepreciationModal";
import ChattelsDepreciationModal from "./componenets/property/ChattelsDepreciationModal";
import LoanAmountModal from "./componenets/financemodals/LoanAmountModal";
import LoanInterestTypeModal from "./componenets/financemodals/LoanInterestTypeModal";
import LoanCostsModal from "./componenets/financemodals/LoanCostsModal";
import InvestorDetailsModal from "./componenets/investormodals/InvestorDetailsModal";
import HomeLoanDetailsModal from "./componenets/investormodals/HomeLoanDetailsModal";
import TaxCreditsModal from "./componenets/investormodals/TaxCreditsModal";
import InflationRateModal from "./componenets/whatifmodals/InflationRateModal";
import CapitalGrowthModal from "./componenets/whatifmodals/CapitalGrowthModal";
import { parseNum } from "../../utils/calculatorUtils";

export default function CalculatorModals({ calc, modals }) {
  const { inputs, updateInput, result, loanA, setLoanA, loanB, setLoanB } = calc;
  const { 
    activeModal, setActiveModal, 
    isModalOpen, setIsModalOpen, 
    isProjectionsModalOpen, setIsProjectionsModalOpen, 
    isCapitalGrowthOpen, setIsCapitalGrowthOpen 
  } = modals;

  return (
    <>
      <ProjectionsGridModal
        isOpen={isProjectionsModalOpen}
        onClose={() => setIsProjectionsModalOpen(false)}
        projections={result?.projections || []}
        metrics={result?.metrics}
        inputs={result?.originalInputs}
        onOpenModal={(modalKey) => {
          if (["loanAmount", "interestRate", "loanCosts"].includes(modalKey)) {
            setIsModalOpen(modalKey);
          } else {
            setActiveModal(modalKey);
          }
        }}
      />
      <PropertyValueModal 
        isOpen={activeModal === "propertyValue"}
        onClose={() => setActiveModal(null)}
        propertyValue={inputs.propertyValue}
        setPropertyValue={(v) => updateInput("propertyValue", v)}
        holdingCosts={inputs.holdingCosts}
        setHoldingCosts={(v) => updateInput("holdingCosts", v)}
        furnitureCosts={inputs.furnitureCosts}
        setFurnitureCosts={(v) => updateInput("furnitureCosts", v)}
        propertyAddress={inputs.propertyAddress}
        setPropertyAddress={(v) => updateInput("propertyAddress", v)}
        propertyDescription={inputs.propertyDescription}
        setPropertyDescription={(v) => updateInput("propertyDescription", v)}
        renovationTimeline={inputs.renovationTimeline}
        setRenovationTimeline={(v) => updateInput("renovationTimeline", v)}
        furnitureTimeline={inputs.furnitureTimeline}
        setFurnitureTimeline={(v) => updateInput("furnitureTimeline", v)}
        linkValueFittings={inputs.linkValueFittings}
        setLinkValueFittings={(v) => updateInput("linkValueFittings", v)}
        linkConstructionCost={inputs.linkConstructionCost}
        setLinkConstructionCost={(v) => updateInput("linkConstructionCost", v)}
        projections={result?.projections || []}
        renovationCosts={inputs.renovationCosts}
        setRenovationCosts={(v) => updateInput("renovationCosts", v)}
        onOpenCapitalGrowth={() => setIsCapitalGrowthOpen(true)}
      />
      <PurchaseCostsModal 
        isOpen={activeModal === "purchaseCosts"} 
        onClose={() => setActiveModal(null)} 
        purchaseCosts={inputs.purchaseCosts} 
        setPurchaseCosts={(v) => updateInput("purchaseCosts", v)} 
        propertyValue={inputs.propertyValue} 
      />
      <RentalIncomeModal 
        isOpen={activeModal === "rentalIncome"} 
        onClose={() => setActiveModal(null)} 
        grossRentWeekly={inputs.grossRentWeekly} 
        setGrossRentWeekly={(v) => updateInput("grossRentWeekly", v)} 
        inflationRate={inputs.inflationRate} 
        rentTimeline={inputs.rentTimeline} 
        setRentTimeline={(v) => updateInput("rentTimeline", v)} 
      />
      <RentalExpensesModal
        isOpen={activeModal === "rentalExpenses"}
        onClose={() => setActiveModal(null)}
        grossRentWeekly={inputs.grossRentWeekly}
        propertyValue={inputs.propertyValue}
        rentalExpensesPercent={inputs.rentalExpensesPercent}
        setRentalExpensesPercent={(v) => updateInput("rentalExpensesPercent", v)}
        setActiveModal={setActiveModal}
      />
      <BuildingDepreciationModal 
        isOpen={activeModal === "buildingDepreciation"} 
        onClose={() => setActiveModal(null)} 
        propertyValue={inputs.propertyValue} 
        renovationCosts={inputs.renovationCosts} 
        buildingDepreciation={inputs.buildingDepreciation} 
        setBuildingDepreciation={(v) => updateInput("buildingDepreciation", v)} 
      />
      <ChattelsDepreciationModal 
        isOpen={activeModal === "chattelsDepreciation"} 
        chattelsDepreciation={inputs.chattelsDepreciation} 
        onClose={() => setActiveModal(null)} 
        propertyValue={inputs.propertyValue} 
        setChattelsDepreciation={(v) => updateInput("chattelsDepreciation", v)} 
      />

      <LoanAmountModal
        isOpen={isModalOpen === "loanAmount" || isModalOpen === true || activeModal === "loanAmount"}
        onClose={() => { setIsModalOpen(false); setActiveModal(null); }}
        propertyCost={parseNum(inputs.propertyValue)}
        renovationCosts={parseNum(inputs.renovationCosts)}
        purchaseCosts={inputs.purchaseCosts && String(inputs.purchaseCosts).trim() !== "" ? parseNum(inputs.purchaseCosts) : parseNum(inputs.propertyValue) * 0.005}
        furnitureCosts={parseNum(inputs.furnitureCosts)}
        holdingCosts={parseNum(inputs.holdingCosts)}
        loanCosts={(!inputs.loanCosts || String(inputs.loanCosts).trim() === "")
          ? (((parseNum(inputs.propertyValue) + (inputs.purchaseCosts ? parseNum(inputs.purchaseCosts) : parseNum(inputs.propertyValue) * 0.005) + parseNum(inputs.renovationCosts) + 363 + parseNum(inputs.additionalLoan) - parseNum(inputs.cashInvested) - parseNum(inputs.equityInvested)) / 0.99) * 0.01) + 363
          : parseNum(inputs.loanCosts)
        }
        initialCashInvested={parseNum(inputs.cashInvested)}
        initialEquityInvested={parseNum(inputs.equityInvested)}
        initialAdditionalLoan={parseNum(inputs.additionalLoan)}
        setCashInvested={(v) => updateInput("cashInvested", v)}
        setEquityInvested={(v) => updateInput("equityInvested", v)}
        setAdditionalLoan={(v) => updateInput("additionalLoan", v)}
        setLoanCosts={(v) => updateInput("loanCosts", v)}
      />
      <LoanInterestTypeModal
        isOpen={isModalOpen === "interestRate" || activeModal === "interestRate"}
        onClose={() => setIsModalOpen(false)}
        loanA={loanA}
        setLoanA={setLoanA}
        loanB={loanB}
        setLoanB={setLoanB}
        setInterestRate={(v) => updateInput("interestRate", v)}
      />
      <LoanCostsModal
        isOpen={isModalOpen === "loanCosts" || activeModal === "loanCosts"}
        onClose={() => setIsModalOpen(false)}
        baseLoanRequired={
          parseNum(inputs.propertyValue) +
          (inputs.purchaseCosts && String(inputs.purchaseCosts).trim() !== "" ? parseNum(inputs.purchaseCosts) : parseNum(inputs.propertyValue) * 0.005) +
          parseNum(inputs.renovationCosts) +
          parseNum(inputs.additionalLoan) -
          parseNum(inputs.cashInvested) -
          parseNum(inputs.equityInvested)
        }
        setLoanCosts={(v) => updateInput("loanCosts", v)}
      />
      <InvestorDetailsModal
        isOpen={["investorDetails", "jointWorkIncome", "jointWorkDeductions"].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        investorDetails={inputs.investorDetails}
        setInvestorDetails={(v) => updateInput("investorDetails", v)}
        jointWorkIncome={inputs.jointWorkIncome}
        setJointWorkIncome={(v) => updateInput("jointWorkIncome", v)}
        jointWorkDeductions={inputs.jointWorkDeductions}
        setJointWorkDeductions={(v) => updateInput("jointWorkDeductions", v)}
        taxableIncomeSingle={inputs.taxableIncomeSingle}
        setTaxableIncomeSingle={(v) => updateInput("taxableIncomeSingle", v)}
      />
      <HomeLoanDetailsModal
        isOpen={["principalResidence", "amountOwing", "homeLoanRepayments"].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        principalResidence={inputs.principalResidence}
        setPrincipalResidence={(v) => updateInput("principalResidence", v)}
        amountOwing={inputs.amountOwing}
        setAmountOwing={(v) => updateInput("amountOwing", v)}
        homeLoanRepayments={inputs.homeLoanRepayments}
        setHomeLoanRepayments={(v) => updateInput("homeLoanRepayments", v)}
      />
      <TaxCreditsModal
        isOpen={["taxableIncomeSingle"].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        investorIncome={inputs.taxableIncomeSingle}
        partnerIncome={inputs.jointWorkIncome}
        projections={result?.projections || []}
        onSave={(newTotal) => updateInput("taxableIncomeSingle", newTotal)}
      />
      <InflationRateModal
        isOpen={["inflationRate", "rentalIncomeRate", "rentalExpenseRate", "taxableIncomeRate", "livingExpensesRate"].includes(activeModal)}
        onClose={() => setActiveModal(null)}
        activeModalType={activeModal}
        inflationRate={inputs.inflationRate} setInflationRate={(v) => updateInput("inflationRate", v)}
        rentalIncomeRate={inputs.rentalIncomeRate} setRentalIncomeRate={(v) => updateInput("rentalIncomeRate", v)}
        rentalExpenseRate={inputs.rentalExpenseRate} setRentalExpenseRate={(v) => updateInput("rentalExpenseRate", v)}
        taxableIncomeRate={inputs.taxableIncomeRate} setTaxableIncomeRate={(v) => updateInput("taxableIncomeRate", v)}
        livingExpensesRate={inputs.livingExpensesRate} setLivingExpensesRate={(v) => updateInput("livingExpensesRate", v)}
      />
      <CapitalGrowthModal
        isOpen={activeModal === "capitalGrowthRate" || isCapitalGrowthOpen}
        onClose={() => { setIsCapitalGrowthOpen(false); if (activeModal === "capitalGrowthRate") setActiveModal(null); }}
        capitalGrowthRate={inputs.capitalGrowthRate}
        setCapitalGrowthRate={(v) => updateInput("capitalGrowthRate", v)}
        capitalizationRate={inputs.capitalizationRate}
        setCapitalizationRate={(v) => updateInput("capitalizationRate", v)}
        capitalGrowthMode={inputs.capitalGrowthMode}
        setCapitalGrowthMode={(v) => updateInput("capitalGrowthMode", v)}
        propertyValue={inputs.propertyValue}
        setPropertyValue={(v) => updateInput("propertyValue", v)}
        renovationCosts={inputs.renovationCosts}
        grossRentWeekly={inputs.grossRentWeekly}
        rentalExpensesPercent={inputs.rentalExpensesPercent}
        rentalIncomeRate={inputs.rentalIncomeRate}
      />
    </>
  );
}