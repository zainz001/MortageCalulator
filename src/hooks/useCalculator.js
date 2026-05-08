import { useState, useEffect, useCallback } from "react";
import { calculatePIA } from "../helpers/propertyHelpers";
import { DEFAULTS, parseNum } from "../utils/calculatorUtils";

export function useCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loanError, setLoanError] = useState("");

  const [loanA, setLoanA] = useState({
    amount: "0", rates: Array(5).fill(DEFAULTS.interestRate), type: "IO",
    ioFrom: "1", ioTo: "40", piFrom: "1", piTo: "25", capFrom: "1", capTo: "40", clFrom: "1", clTo: "40"
  });

  const [loanB, setLoanB] = useState({
    amount: "0", rates: Array(5).fill("0.00"), type: "IO",
    ioFrom: "1", ioTo: "40", piFrom: "1", piTo: "25", capFrom: "1", capTo: "40", clFrom: "1", clTo: "40"
  });

  const updateInput = useCallback((key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (result?.loanAmount && parseNum(loanB.amount) === 0) {
      setLoanA(prev => ({
        ...prev,
        amount: String(Math.round(result.loanAmount)),
        rates: Array(5).fill(String(inputs.interestRate))
      }));
    }
  }, [result?.loanAmount, inputs.interestRate, loanB.amount]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULTS);
    setResult(null);
    setLoanError("");
    setLoanB(prev => ({ ...prev, amount: "0", rates: Array(5).fill("0.00") }));
  }, []);

  const handleNewBuildToggle = useCallback((val) => {
    updateInput("isNewBuild", val);
    if (val) updateInput("interestDeductibility", "100");
  }, [updateInput]);

  const performCalculation = useCallback(() => {
    const pValue = parseNum(inputs.propertyValue);
    const cInvest = parseNum(inputs.cashInvested);
    const eInvest = parseNum(inputs.equityInvested);
    const lCostsRaw = String(inputs.loanCosts).trim();
    const aLoan = parseNum(inputs.additionalLoan);
    const rCosts = parseNum(inputs.renovationCosts);
    const fCosts = parseNum(inputs.furnitureCosts);
    const hCosts = parseNum(inputs.holdingCosts);
    const pCostsRaw = String(inputs.purchaseCosts).trim();

    setLoanError("");

    if (pValue === 0) return;

    const res = calculatePIA({
      propertyValue: pValue,
      purchaseCostsManual: pCostsRaw !== "" ? parseNum(inputs.purchaseCosts) : null,
      grossRentWeekly: parseNum(inputs.grossRentWeekly),
      rentTimeline: inputs.rentTimeline,
      rentalExpensesPercent: parseNum(inputs.rentalExpensesPercent),
      cashInvested: cInvest,
      equityInvested: eInvest,
      loanCostsManual: lCostsRaw !== "" ? parseNum(inputs.loanCosts) : null,
      interestRate: parseNum(inputs.interestRate),
      loanType: inputs.loanType,
      additionalLoan: aLoan,
      renovationCosts: rCosts,
      furnitureCosts: fCosts,
      holdingCosts: hCosts,
      capitalGrowthRate: parseNum(inputs.capitalGrowthRate),
      capitalizationRate: parseNum(inputs.capitalizationRate),
      inflationRate: parseNum(inputs.inflationRate),
      rentalIncomeRate: parseNum(inputs.rentalIncomeRate),
      rentalExpenseRate: parseNum(inputs.rentalExpenseRate),
      chattelsValue: parseNum(inputs.chattelsValue) || 45000,
      depreciationMethod: inputs.depreciationMethod,
      chattelsDepreciationRate: parseNum(inputs.chattelsDepreciationRate) || 25,
      buildingDepreciationRate: parseNum(inputs.buildingDepreciationRate),
      investorTaxRate: parseNum(inputs.investorTaxRate),
      interestDeductibility: parseNum(inputs.interestDeductibility),
      isNewBuild: inputs.isNewBuild,
      ringFencing: inputs.ringFencing,
      renovationTimeline: inputs.renovationTimeline,
      furnitureTimeline: inputs.furnitureTimeline,
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
      capitalGrowthRate: parseNum(inputs.capitalGrowthRate),
      inflationRate: parseNum(inputs.inflationRate),
      grossRentWeekly: parseNum(inputs.grossRentWeekly),
      interestRate: parseNum(inputs.interestRate),
      rentalExpensesPercent: parseNum(inputs.rentalExpensesPercent),
      preTaxCashFlow: -(cInvest + eInvest),
      chattelsValue: parseNum(inputs.chattelsValue) || 45000,
      buildingDepreciationRate: parseNum(inputs.buildingDepreciationRate),
      loanCosts: res.loanCosts,
      totalDeductions: yr1p?.deductions ?? 0,
      investorIncome: parseNum(inputs.taxableIncomeSingle) || 120000,
      taxCredit: yr1p?.taxCredit ?? 0,
      afterTaxCashFlow: -(cInvest + eInvest),
    };

    setResult(res);
  }, [inputs, loanA, loanB]);

  useEffect(() => {
    const timer = setTimeout(performCalculation, 300);
    return () => clearTimeout(timer);
  }, [performCalculation]);

  return {
    inputs,
    updateInput,
    handleReset,
    handleNewBuildToggle,
    performCalculation,
    result,
    loanError,
    loanA, setLoanA,
    loanB, setLoanB,
  };
}