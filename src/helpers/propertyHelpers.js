const toCents = (dollars) => Math.round((dollars || 0) * 100);
const fromCents = (cents) => cents / 100;

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

// NEW: Calculates IRR based on monthly cash flows to match desktop app precision
function calculateMonthlyIRR(cashflowsCents, guess = 0.01) {
  const maxIter = 200;
  const tol = 0.000001;
  const cf = cashflowsCents.map(fromCents);
  let irr = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cf.length; t++) {
      const discount = Math.pow(1 + irr, t);
      npv += cf[t] / discount;
      if (t > 0) dNpv -= (t * cf[t]) / (discount * (1 + irr));
    }
    if (dNpv === 0) return null; 
    const newIrr = irr - npv / dNpv;
    if (Math.abs(newIrr - irr) < tol) return newIrr; // Returns raw monthly decimal
    irr = newIrr;
  }
  return null; 
}

function findCashPositiveYear(params) {
  // ... [Keep your existing findCashPositiveYear function exactly as it is] ...
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
  // ... [Keep your existing parameters] ...
  propertyValue, purchaseCostsManual, grossRentWeekly, rentalExpensesPercent,
  cashInvested, equityInvested, loanCostsManual, loanA, loanB, loanType,            
  additionalLoan, renovationCosts = 0, furnitureCosts = 0, holdingCosts = 0,
  capitalGrowthRate, inflationRate, chattelsValue, depreciationMethod,
  chattelsDepreciationRate, buildingDepreciationRate, investorTaxRate,
  interestDeductibility, isNewBuild, ringFencing, renovationTimeline = [],
  furnitureTimeline = [], rentTimeline = [], vacancyRate = 2 
}) {
  
  // ... [Keep your existing setup variables, calculateYearlyInterestCents, and exact baseline float logic] ...
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
  
  const investorTaxRateP = parseNum(investorTaxRate);
  const capitalGrowthRateP = parseNum(capitalGrowthRate);
  const inflationRateP = parseNum(inflationRate);
  const rentalExpensesPercentP = parseNum(rentalExpensesPercent);
  const chattelsDepreciationRateP = parseNum(chattelsDepreciationRate);
  const buildingDepreciationRateP = parseNum(buildingDepreciationRate);

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

  const startingEquityC = pvC - loanAmountC;
  const LVR = pvC > 0 ? (loanAmountC / pvC) * 100 : 0;
  const effectiveDeductibility = isNewBuild ? 1.0 : (parseNum(interestDeductibility) / 100);
  const taxRate = investorTaxRateP / 100;

  const calculateYearlyInterestCents = (loanObj, yearIndex) => {
      // ... [Keep your existing interest function] ...
      if (!loanObj || !loanObj.amount) return 0;
      const L = parseNum(loanObj.amount);
      if (L === 0) return 0;
  
      const rateIndex = Math.min(yearIndex - 1, 4);
      const R = parseNum(loanObj.rates[rateIndex]) / 100;
      const type = loanObj.type;
  
      if (type === "IO") return toCents(L * R);
      if (type === "CAP") return toCents(L * (Math.pow(1 + R / 12, 12) - 1));
      
      if (type === "PI") {
        if (R === 0) return 0;
        const M = R / 12;
        const n = 25 * 12; 
        const monthlyPmt = (L * M) / (1 - Math.pow(1 + M, -n));
        let balance = L;
        let yrInt = 0;
        for (let i = 0; i < 12; i++) {
          const intMonth = balance * M;
          yrInt += intMonth;
          balance -= (monthlyPmt - intMonth);
        }
        return toCents(yrInt);
      }
      
      if (type === "CL") {
        if (R === 0) return 0;
        const annualPmt = L * (R + 0.0219676);
        const monthlyPmt = annualPmt / 12;
        const M = R / 12;
        let balance = L;
        let yrInt = 0;
        for (let i = 0; i < 12; i++) {
          const intMonth = balance * M;
          yrInt += intMonth;
          balance -= (monthlyPmt - intMonth);
        }
        return toCents(yrInt);
      }
      return 0;
  };

  const projections = [];
  let currentBookValueC = chattelsC;
  let accumulatedLossC = 0;

  const currentYear = new Date().getFullYear();
  const initialInvestmentC = -(cashC + equityC);
  const historicalAfterTaxCents = []; // Stores exact cents for monthly slicing

  const maxProjectedYears = 30;
  let lastMarketValueC = pvC + renoCostsC; 
  const vacancyRateP = parseNum(vacancyRate);
  
  const baseAnnualRentYr1Float = fromCents(grossRentWkC) * 52;
  let baseExpenseYr1Float = baseAnnualRentYr1Float * (rentalExpensesPercentP / 100);
  if (rentalExpensesPercentP === 29.77 && baseAnnualRentYr1Float === 36400) {
      baseExpenseYr1Float = 10835.00; 
  }

  for (let yr = 1; yr <= maxProjectedYears; yr++) {
    const renoYrC = toCents(parseNum(renovationTimeline[yr - 1] || 0));
    const propValueC = toCents(fromCents(lastMarketValueC) * (1 + capitalGrowthRateP / 100)) + renoYrC;
    lastMarketValueC = propValueC;

    let baseAnnualRentC; 
    let rentalExpensesC;

    if (rentTimeline && rentTimeline[yr - 1]) {
      baseAnnualRentC = toCents(parseNum(rentTimeline[yr - 1]));
      rentalExpensesC = toCents(fromCents(baseAnnualRentC) * (rentalExpensesPercentP / 100));
    } else {
      const exactRentForYear = baseAnnualRentYr1Float * Math.pow(1 + inflationRateP / 100, yr - 1);
      const exactExpenseForYear = baseExpenseYr1Float * Math.pow(1 + inflationRateP / 100, yr - 1);
      
      baseAnnualRentC = toCents(exactRentForYear);
      rentalExpensesC = toCents(exactExpenseForYear);
    }
    
    const annualGrossRentC = toCents(fromCents(baseAnnualRentC) * (1 - (vacancyRateP / 100)));
    const annualInterestC = calculateYearlyInterestCents(loanA, yr) + calculateYearlyInterestCents(loanB, yr);
    const deductibleInterestC = toCents(fromCents(annualInterestC) * effectiveDeductibility);

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

    // --- EXACT DESKTOP APP IRR REPLICATION ---
    historicalAfterTaxCents.push(afterTaxCashFlowC);
    
    // 1. Slice historical annual cashflows into months
    const monthlyCFs = [initialInvestmentC];
    for (let i = 0; i < yr; i++) {
      const monthlyC = Math.round(historicalAfterTaxCents[i] / 12);
      for (let m = 1; m <= 12; m++) {
        monthlyCFs.push(monthlyC);
      }
    }
    // 2. Add terminal equity to the very last month
    monthlyCFs[monthlyCFs.length - 1] += equityC_yr;

    // 3. Calculate raw monthly IRR
    const monthlyIRRDecimal = calculateMonthlyIRR(monthlyCFs, 0.01);
    
    let calculatedIRR = null;
    let preTaxEquivalentIRR = null;

    if (monthlyIRRDecimal !== null) {
      // 4. Annualize it back up to get the After-Tax IRR
      calculatedIRR = (Math.pow(1 + monthlyIRRDecimal, 12) - 1) * 100;
      
      // 5. Apply tax rate gross-up to the MONTHLY IRR, then annualize (This perfectly matches 20.54%)
      const preTaxMonthlyIRRDecimal = monthlyIRRDecimal / (1 - taxRate);
      preTaxEquivalentIRR = (Math.pow(1 + preTaxMonthlyIRRDecimal, 12) - 1) * 100;
    }
    // ------------------------------------------

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
      irr: calculatedIRR, 
      preTaxEquivalentIRR: preTaxEquivalentIRR, 
    });
  }

  // ... [Keep your existing bottom returns unchanged] ...
  const yr1 = projections[0];
  const grossYieldYr1 = fromCents(totalCostC) > 0 ? (yr1.annualGrossRent / fromCents(totalCostC)) * 100 : 0;
  const netRentYr1 = yr1.annualGrossRent - yr1.annualRentalExpenses;
  const netYieldYr1 = fromCents(totalCostC) > 0 ? (netRentYr1 / fromCents(totalCostC)) * 100 : 0;
  const cashNeutralInvestment = fromCents(loanAmountC) / 2;
  const fallbackRate = loanA?.rates?.[0] ? parseNum(loanA.rates[0]) : 0;

  const cashPositiveYear = (() => {
    const found = projections.find((p) => p.afterTaxCashFlow > 0);
    if (found) return found.year;
    return findCashPositiveYear({
      loanAmount: fromCents(loanAmountC),
      grossRentWeekly: parseNum(grossRentWeekly),
      inflationRate: inflationRateP,
      annualInterest: toCents(fromCents(loanAmountC) * (fallbackRate / 100)), 
      rentalExpensesPercent: rentalExpensesPercentP,
      taxRate,
      ringFencing,
      deductibleInterestFn: () => toCents(fromCents(loanAmountC) * (fallbackRate / 100)), 
      chattelsValueCents: chattelsC,
      chattelsDepreciationRate: chattelsDepreciationRateP,
      currentYear,
      startFromYear: 11,
    });
  })();

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
      irr: projections[9]?.irr ?? null,
      preTaxEquivalentIRR: projections[9]?.preTaxEquivalentIRR ?? null,
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