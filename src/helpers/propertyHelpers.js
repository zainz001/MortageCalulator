const toCents = (dollars) => Math.round((dollars || 0) * 100);
const fromCents = (cents) => cents / 100;

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

function calculateIRR(cashflowsCents, guess = 0.1) {
  const maxIter = 100;
  const tol = 0.000001;
  const cf = cashflowsCents.map(fromCents);
  let irr = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cf.length; t++) {
      npv += cf[t] / Math.pow(1 + irr, t);
      if (t > 0) dNpv -= (t * cf[t]) / Math.pow(1 + irr, t + 1);
    }
    if (dNpv === 0) return null; 
    const newIrr = irr - npv / dNpv;
    if (Math.abs(newIrr - irr) < tol) return newIrr * 100; 
    irr = newIrr;
  }
  return null; 
}

function findCashPositiveYear(params) {
  const { loanAmount, grossRentWeekly, inflationRate, annualInterest,
    rentalExpensesPercent, taxRate, ringFencing, deductibleInterestFn,
    currentYear } = params;

  let accLoss = 0;
  let bookVal = params.chattelsValueCents;

  for (let yr = 1; yr <= 30; yr++) {
    const rent = toCents(
      fromCents(toCents(grossRentWeekly * 52)) * Math.pow(1 + inflationRate / 100, yr)
    );
    const expenses = toCents(fromCents(rent) * (rentalExpensesPercent / 100));
    const preTax = rent - annualInterest - expenses;

    const dep = toCents(fromCents(bookVal) * (params.chattelsDepreciationRate / 100));
    if (bookVal > 0) bookVal = Math.max(0, bookVal - dep);

    const deductibleInt = deductibleInterestFn();
    const deductions = deductibleInt + expenses + dep;
    const netTaxable = rent - deductions;

    let taxCredit = 0;
    if (netTaxable < 0) {
      if (ringFencing) {
        accLoss += Math.abs(netTaxable);
      } else {
        taxCredit = toCents(fromCents(Math.abs(netTaxable)) * taxRate);
      }
    } else if (ringFencing && accLoss > 0) {
      const offset = Math.min(netTaxable, accLoss);
      accLoss -= offset;
    }

    const afterTax = preTax + taxCredit;
    if (afterTax > 0) return (currentYear + yr - 1).toString();
  }
  return "30yr+"; 
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
  loanType,            
  additionalLoan,
  renovationCosts = 0, 
  furnitureCosts = 0,
  holdingCosts = 0,
  capitalGrowthRate,
  inflationRate,
  chattelsValue,
  depreciationMethod,
  chattelsDepreciationRate,
  buildingDepreciationRate,
  investorTaxRate,
  interestDeductibility,
  isNewBuild,
  ringFencing,
  renovationTimeline = [],
  furnitureTimeline = [],
  rentTimeline = []
}) {
  
  const pvC = toCents(parseNum(propertyValue));
  
  const purchCostsC = purchaseCostsManual && String(purchaseCostsManual).trim() !== ""
    ? toCents(parseNum(purchaseCostsManual))
    : toCents(parseNum(propertyValue) * 0.005);        
    
  const cashC = toCents(parseNum(cashInvested));
  const equityC = toCents(parseNum(equityInvested));
  const addLoanC = toCents(parseNum(additionalLoan));
  const renoCostsC = toCents(parseNum(renovationCosts));
  const furniC = toCents(parseNum(furnitureCosts));
  const holdC = toCents(parseNum(holdingCosts));
  const chattelsC = toCents(parseNum(chattelsValue));
  const grossRentWkC = toCents(parseNum(grossRentWeekly));
  
  const interestRateP = parseNum(interestRate);
  const investorTaxRateP = parseNum(investorTaxRate);
  const capitalGrowthRateP = parseNum(capitalGrowthRate);
  const inflationRateP = parseNum(inflationRate);
  const rentalExpensesPercentP = parseNum(rentalExpensesPercent);
  const chattelsDepreciationRateP = parseNum(chattelsDepreciationRate);
  const buildingDepreciationRateP = parseNum(buildingDepreciationRate);

  // --- THE FIX: Algebraic Auto-Calculate for Loan Costs ---
  let loanCostsC = 0;
  let loanAmountC = 0;
  let totalCostC = 0;

  const baseCostsC = pvC + purchCostsC + renoCostsC + furniC + holdC;
  const isLcAuto = !loanCostsManual || String(loanCostsManual).trim() === "";

  if (isLcAuto) {
    const baseReqC = baseCostsC + toCents(363) + addLoanC - cashC - equityC;
    loanAmountC = Math.round(baseReqC / 0.99);
    loanCostsC = Math.round(loanAmountC * 0.01) + toCents(363);
    totalCostC = baseCostsC + loanCostsC;
  } else {
    loanCostsC = toCents(parseNum(loanCostsManual));
    totalCostC = baseCostsC + loanCostsC;
    loanAmountC = totalCostC + addLoanC - cashC - equityC;
  }
  // --------------------------------------------------------

  const startingEquityC = pvC - loanAmountC;
  const LVR = pvC > 0 ? (loanAmountC / pvC) * 100 : 0;
  
  const effectiveDeductibility = isNewBuild ? 1.0 : (parseNum(interestDeductibility) / 100);
  const taxRate = investorTaxRateP / 100;

  const annualInterestC = toCents(fromCents(loanAmountC) * (interestRateP / 100));
  const deductibleInterestC = toCents(fromCents(annualInterestC) * effectiveDeductibility);

  const projections = [];
  let currentBookValueC = chattelsC;
  let accumulatedLossC = 0;

  const currentYear = new Date().getFullYear();
  const cashflowsForIRRCents = [-(cashC + equityC)];

  const maxProjectedYears = Math.max(10, renovationTimeline?.length || 0, furnitureTimeline?.length || 0);
  let lastMarketValueC = pvC + renoCostsC; 

  for (let yr = 1; yr <= maxProjectedYears; yr++) {
    const renoYrC = toCents(parseNum(renovationTimeline[yr - 1] || 0));
    const propValueC = toCents(fromCents(lastMarketValueC) * (1 + capitalGrowthRateP / 100)) + renoYrC;
    lastMarketValueC = propValueC;

    let annualGrossRentC;
    if (rentTimeline && rentTimeline[yr - 1]) {
      annualGrossRentC = toCents(parseNum(rentTimeline[yr - 1]));
    } else {
      annualGrossRentC = toCents(
        fromCents(grossRentWkC * 52) * Math.pow(1 + inflationRateP / 100, yr)
      );
    }

    const rentalExpensesC = toCents(fromCents(annualGrossRentC) * (rentalExpensesPercentP / 100));
    const preTaxCashFlowC = annualGrossRentC - annualInterestC - rentalExpensesC;

    let chattelsDepC = 0;
    if (currentBookValueC > 0) {
      if (depreciationMethod === "DV") {
        chattelsDepC = toCents(fromCents(currentBookValueC) * (chattelsDepreciationRateP / 100));
        currentBookValueC = Math.max(0, currentBookValueC - chattelsDepC);
      } else {
        const slC = toCents(fromCents(chattelsC) * (chattelsDepreciationRateP / 100));
        chattelsDepC = Math.min(currentBookValueC, slC);
        currentBookValueC = Math.max(0, currentBookValueC - chattelsDepC);
      }
    }
    const buildingDepC = toCents(fromCents(propValueC) * (buildingDepreciationRateP / 100));

    let deductionsC = deductibleInterestC + rentalExpensesC + chattelsDepC + buildingDepC;
    if (yr === 1) deductionsC += loanCostsC; 

    const netTaxableIncomeC = annualGrossRentC - deductionsC;
    let taxCreditC = 0;

    if (netTaxableIncomeC < 0) {
      if (ringFencing) {
        accumulatedLossC += Math.abs(netTaxableIncomeC);
        taxCreditC = 0;
      } else {
        taxCreditC = toCents(fromCents(Math.abs(netTaxableIncomeC)) * taxRate);
      }
    } else if (ringFencing && accumulatedLossC > 0) {
      const offsetC = Math.min(netTaxableIncomeC, accumulatedLossC);
      accumulatedLossC -= offsetC;
    }

    const afterTaxCashFlowC = preTaxCashFlowC + taxCreditC;
    const costPerWeekC = Math.round((-preTaxCashFlowC) / 52);
    const equityC_yr = propValueC - loanAmountC;

    if (yr === 10) {
      cashflowsForIRRCents.push(afterTaxCashFlowC + equityC_yr);
    } else {
      cashflowsForIRRCents.push(afterTaxCashFlowC);
    }

    projections.push({
      year: (currentYear + yr - 1).toString(),
      index: yr,
      propertyValue: fromCents(propValueC),
      equity: fromCents(equityC_yr),
      annualGrossRent: fromCents(annualGrossRentC),
      annualInterest: fromCents(annualInterestC),
      annualRentalExpenses: fromCents(rentalExpensesC),
      preTaxCashFlow: fromCents(preTaxCashFlowC),
      chattelsDepreciation: fromCents(chattelsDepC),
      buildingDepreciation: fromCents(buildingDepC),
      deductions: fromCents(deductionsC),
      netTaxableIncome: fromCents(netTaxableIncomeC),
      taxCredit: fromCents(taxCreditC),
      afterTaxCashFlow: fromCents(afterTaxCashFlowC),
      costPerWeek: fromCents(costPerWeekC),
      accumulatedLoss: fromCents(accumulatedLossC), 
      loanAmount: fromCents(loanAmountC),      
    });
  }

  const yr1 = projections[0];
  const grossYieldYr1 = fromCents(totalCostC) > 0 ? (yr1.annualGrossRent / fromCents(totalCostC)) * 100 : 0;
  const netRentYr1 = yr1.annualGrossRent - yr1.annualRentalExpenses;
  const netYieldYr1 = fromCents(totalCostC) > 0 ? (netRentYr1 / fromCents(totalCostC)) * 100 : 0;
  const cashNeutralInvestment = fromCents(loanAmountC) / 2;

  const cashPositiveYear = (() => {
    const found = projections.find((p) => p.afterTaxCashFlow > 0);
    if (found) return found.year;
    return findCashPositiveYear({
      loanAmount: fromCents(loanAmountC),
      grossRentWeekly: parseNum(grossRentWeekly),
      inflationRate: inflationRateP,
      annualInterest: annualInterestC,
      rentalExpensesPercent: rentalExpensesPercentP,
      taxRate,
      ringFencing,
      deductibleInterestFn: () => deductibleInterestC,
      chattelsValueCents: chattelsC,
      chattelsDepreciationRate: chattelsDepreciationRateP,
      currentYear,
      startFromYear: 11,
    });
  })();

  const calculatedIRR = calculateIRR(cashflowsForIRRCents);
  const preTaxEquivalentIRR = calculatedIRR !== null ? calculatedIRR / (1 - taxRate) : null;

  const totalRent = projections.reduce((s, p) => s + p.annualGrossRent, 0);
  const totalExpenses = projections.reduce((s, p) => s + p.annualRentalExpenses, 0);
  const totalCashflow = projections.reduce((s, p) => s + p.afterTaxCashFlow, 0);
  const finalPropValue = projections[9].propertyValue;

  return {
    totalCost: fromCents(totalCostC),
    loanAmount: fromCents(loanAmountC),
    startingEquity: fromCents(startingEquityC),
    LVR,
    purchaseCosts: fromCents(purchCostsC),
    loanCosts: fromCents(loanCostsC),
    projections,
    metrics: {
      grossYieldYr1,
      netRentYr1,
      netYieldYr1,
      cashNeutralInvestment,
      cashPositiveYear,
      irr: calculatedIRR,
      preTaxEquivalentIRR,
      avgWeeklyRent: totalRent / 10 / 52,
      avgWeeklyExpenses: totalExpenses / 10 / 52,
      avgWeeklyCashflow: totalCashflow / 10 / 52,
      totalEquityIn10Years: projections[9].equity,
      avgEquityGainWeekly: (finalPropValue - parseNum(propertyValue)) / (10 * 52),
      avgNetGainWeekly: (finalPropValue - parseNum(propertyValue)) / (10 * 52) + totalCashflow / 10 / 52,
      isCashflowPositive: (totalCashflow / 10 / 52) > 0,
    },
  };
}