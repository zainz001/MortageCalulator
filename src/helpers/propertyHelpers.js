function calculateIRR(cashflows, guess = 0.1) {
  const maxIter = 100;
  const tol = 0.000001;
  let irr = guess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + irr, t);
      if (t > 0) dNpv -= (t * cashflows[t]) / Math.pow(1 + irr, t + 1);
    }
    let newIrr = irr - npv / dNpv;
    if (Math.abs(newIrr - irr) < tol) return newIrr * 100; // Return as percentage
    irr = newIrr;
  }
  return null; // Failed to converge
}

export function calculatePIA({
  propertyValue,
  purchaseCostsManual,
  grossRentWeekly,
  rentalExpensesPercent,
  cashInvested,
  equityInvested,
  loanCostsManual,
  interestRate,
  loanType, // Included for future P+I expansion (Sec 10, Q6)
  additionalLoan,
  renovationCosts = 0, // Added from Sec 5.1
  furnitureCosts = 0,  // Added from Sec 5.1
  holdingCosts = 0,    // Added from Sec 5.1
  capitalGrowthRate,
  inflationRate,
  chattelsValue,
  depreciationMethod,
  chattelsDepreciationRate,
  buildingDepreciationRate,
  investorTaxRate,
  interestDeductibility,
  isNewBuild,
  ringFencing
}) {
  // --- 4.1 Loan & Equity Derivations ---
  const purchaseCosts = purchaseCostsManual !== null ? purchaseCostsManual : (propertyValue * 0.005);
  const loanCosts = loanCostsManual !== null ? loanCostsManual : 0;
  
  const totalCost = propertyValue + purchaseCosts;
  
  // Adjusted to include all Modal line items (Sec 5.1)
  const totalFundingRequired = totalCost + loanCosts + additionalLoan + renovationCosts + furnitureCosts + holdingCosts;
  const loanAmount = totalFundingRequired - cashInvested - equityInvested;
  
  const startingEquity = propertyValue - loanAmount;
  const LVR = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

  const effectiveDeductibility = isNewBuild ? 1.0 : (interestDeductibility / 100);
  const taxRate = investorTaxRate / 100;

  const projections = [];
  let currentBookValue = chattelsValue;
  let accumulatedLoss = 0;

  let totalRent = 0;
  let totalExpenses = 0;
  let totalCashflow = 0;

  const currentYear = new Date().getFullYear();
  const cashflowsForIRR = [-(cashInvested + equityInvested)]; // Year 0 initial outlay

  // --- 4.2 Annual Projections Engine ---
  for (let yearIndex = 1; yearIndex <= 10; yearIndex++) {
    const propValue = propertyValue * Math.pow(1 + capitalGrowthRate / 100, yearIndex);
    const annualGrossRent = (grossRentWeekly * 52) * Math.pow(1 + inflationRate / 100, yearIndex);
    
    const annualInterest = loanAmount * (interestRate / 100);
    const deductibleInterest = annualInterest * effectiveDeductibility; // Handles Sec 9.4 Edge Case
    
    const annualRentalExpenses = annualGrossRent * (rentalExpensesPercent / 100);
    const preTaxCashFlow = annualGrossRent - annualInterest - annualRentalExpenses;

    // --- 4.3 Depreciation Schedule ---
    let chattelsDepreciation = 0;
    if (currentBookValue > 0) {
      if (depreciationMethod === 'DV') {
        chattelsDepreciation = currentBookValue * (chattelsDepreciationRate / 100);
        currentBookValue -= chattelsDepreciation;
      } else { // SL Method Fix
        const calculatedSL = chattelsValue * (chattelsDepreciationRate / 100);
        chattelsDepreciation = Math.min(currentBookValue, calculatedSL); // Prevents depreciating below $0
        currentBookValue -= chattelsDepreciation;
      }
    }
    const buildingDepreciation = propValue * (buildingDepreciationRate / 100); 

    // --- 4.4 Tax Credit Calculation ---
    let deductions = deductibleInterest + annualRentalExpenses + chattelsDepreciation + buildingDepreciation;
    if (yearIndex === 1) deductions += loanCosts; // Yr 1 only

    const netTaxableIncome = annualGrossRent - deductions;
    let taxCredit = 0;

    if (netTaxableIncome < 0) {
      if (ringFencing) { // Sec 7.5 Ring-Fencing
        accumulatedLoss += Math.abs(netTaxableIncome);
        taxCredit = 0; 
      } else {
        taxCredit = Math.abs(netTaxableIncome) * taxRate;
      }
    } else if (ringFencing && accumulatedLoss > 0) {
      const offset = Math.min(netTaxableIncome, accumulatedLoss);
      accumulatedLoss -= offset;
    }

    const afterTaxCashFlow = preTaxCashFlow + taxCredit;
    
    // Fixed: Sec 4.2 explicitly mandates Pre-tax cash flow for this formula
    const costPerWeek = (preTaxCashFlow / 52) * -1; 
    const equity = propValue - loanAmount;

    // Track for IRR
    if (yearIndex === 10) {
      cashflowsForIRR.push(afterTaxCashFlow + equity); // Terminal value + final year cashflow
    } else {
      cashflowsForIRR.push(afterTaxCashFlow);
    }

    projections.push({
      year: (currentYear + yearIndex - 1).toString(),
      index: yearIndex,
      propertyValue: propValue,
      equity,
      annualGrossRent,
      annualInterest,
      annualRentalExpenses,
      preTaxCashFlow,
      chattelsDepreciation,
      buildingDepreciation,
      deductions,
      taxCredit,
      afterTaxCashFlow,
      costPerWeek
    });

    totalRent += annualGrossRent;
    totalExpenses += annualRentalExpenses;
    totalCashflow += afterTaxCashFlow;
  }

  // --- 4.5 Return Metrics ---
  const yr1 = projections[0];
  
  // Added division-by-zero guards
  const grossYieldYr1 = totalCost > 0 ? (yr1.annualGrossRent / totalCost) * 100 : 0;
  const netRentYr1 = yr1.annualGrossRent - yr1.annualRentalExpenses;
  const netYieldYr1 = totalCost > 0 ? (netRentYr1 / totalCost) * 100 : 0;
  
  const cashNeutralInvestment = loanAmount / 2; 
  const cashPositiveYear = projections.find(p => p.afterTaxCashFlow > 0)?.year || 'Not within 10 yrs';
  
  const calculatedIRR = calculateIRR(cashflowsForIRR);
  
  // Missing output added: Pre-tax equivalent = IRR ÷ (1 − Investor tax rate)
  const preTaxEquivalentIRR = calculatedIRR !== null ? calculatedIRR / (1 - taxRate) : null;

  const avgWeeklyRent = totalRent / 10 / 52;
  const avgWeeklyExpenses = totalExpenses / 10 / 52;
  const avgWeeklyCashflow = totalCashflow / 10 / 52;
  const finalPropertyValue = projections[9].propertyValue;
  const totalEquityIn10Years = projections[9].equity;
  const avgEquityGainWeekly = (finalPropertyValue - propertyValue) / (10 * 52);
  const avgNetGainWeekly = avgEquityGainWeekly + avgWeeklyCashflow;

  return {
    totalCost,
    loanAmount,
    startingEquity,
    LVR,
    projections,
    metrics: {
      grossYieldYr1,
      netYieldYr1,
      cashNeutralInvestment,
      cashPositiveYear,
      avgWeeklyRent,
      avgWeeklyExpenses,
      avgWeeklyCashflow,
      totalEquityIn10Years,
      avgEquityGainWeekly,
      avgNetGainWeekly,
      isCashflowPositive: avgWeeklyCashflow > 0,
      irr: calculatedIRR,
      preTaxEquivalentIRR: preTaxEquivalentIRR // Included for completeness
    }
  };
}