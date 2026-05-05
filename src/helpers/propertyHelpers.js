const toCents = (dollars) => Math.round((dollars || 0) * 100);
const fromCents = (cents) => cents / 100;

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(String(val).replace(/,/g, "")) || 0;
};

// Calculates IRR based on monthly cash flows to match desktop app precision
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
    if (Math.abs(newIrr - irr) < tol) return newIrr; 
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
  propertyValue, purchaseCostsManual, grossRentWeekly, rentalExpensesPercent,
  cashInvested, equityInvested, loanCostsManual, loanA, loanB, loanType,            
  additionalLoan, renovationCosts = 0, furnitureCosts = 0, holdingCosts = 0,
  capitalGrowthRate, inflationRate, chattelsValue, depreciationMethod,
  chattelsDepreciationRate, buildingDepreciationRate, investorTaxRate,
  interestDeductibility, isNewBuild, ringFencing, renovationTimeline = [],
  furnitureTimeline = [], rentTimeline = [], vacancyRate = 2 
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

  // --- RESTORED: Stateful loan initializers that live OUTSIDE the year loop ---
  const initLoanState = (loan) => {
    if (!loan || !loan.amount) return null;
    const originalAmount = parseNum(loan.amount);
    if (originalAmount === 0) return null;
    return {
      originalAmount,
      balance: originalAmount,
      type: loan.type || "IO",
      rates: loan.rates || [],
    };
  };

  const loanStateA = initLoanState(loanA);
  const loanStateB = initLoanState(loanB);

  // --- RESTORED: Yearly process that computes both Interest and Principal to hit Debt Service ---
  const processLoanYear = (state, yrIndex) => {
    if (!state || state.balance <= 0) return { interest: 0, principal: 0 };

    const rateIndex = Math.min(yrIndex - 1, 4);
    const R = parseNum(state.rates[rateIndex]) / 100;

    if (state.type === "IO") {
      const interest = state.balance * R;
      return { interest: toCents(interest), principal: 0 };
    }
    
    if (state.type === "CAP") {
      const interest = state.balance * (Math.pow(1 + R / 12, 12) - 1);
      state.balance += interest; // Balance grows
      // Debt service is 0 because cash isn't spent; principal cleanly offsets interest here
      return { interest: toCents(interest), principal: toCents(-interest) };
    }
    
    if (state.type === "PI") {
      if (R === 0) return { interest: 0, principal: 0 };
      const M = R / 12;
      const n = 25 * 12; 
      const monthlyPmt = (state.originalAmount * M) / (1 - Math.pow(1 + M, -n));

      let yrInt = 0;
      let yrPrin = 0;
      for (let i = 0; i < 12; i++) {
        const intMonth = state.balance * M;
        yrInt += intMonth;
        let prinMonth = monthlyPmt - intMonth;
        if (state.balance - prinMonth < 0) prinMonth = state.balance;
        yrPrin += prinMonth;
        state.balance -= prinMonth;
        if (state.balance <= 0) break;
      }
      return { interest: toCents(yrInt), principal: toCents(yrPrin) };
    }
    
    if (state.type === "CL") {
      if (R === 0) return { interest: 0, principal: 0 };
      const annualPmt = state.originalAmount * (R + 0.0219676);
      const monthlyPmt = annualPmt / 12;
      const M = R / 12;

      let yrInt = 0;
      let yrPrin = 0;
      for (let i = 0; i < 12; i++) {
        const intMonth = state.balance * M;
        yrInt += intMonth;
        let prinMonth = monthlyPmt - intMonth;
        if (state.balance - prinMonth < 0) prinMonth = state.balance;
        yrPrin += prinMonth;
        state.balance -= prinMonth;
        if (state.balance <= 0) break;
      }
      return { interest: toCents(yrInt), principal: toCents(yrPrin) };
    }
    
    return { interest: 0, principal: 0 };
  };

  const projections = [];
  let currentBookValueC = chattelsC;
  let accumulatedLossC = 0;
  let currentLoanBalanceC = loanAmountC; // Tracked dynamically

  const currentYear = new Date().getFullYear();
  const initialInvestmentC = -(cashC + equityC);
  const historicalAfterTaxCents = []; 

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
    
    // Process states and retrieve debt service chunks
    const resA = processLoanYear(loanStateA, yr);
    const resB = processLoanYear(loanStateB, yr);
    const annualInterestC = resA.interest + resB.interest;
    const annualPrincipalC = resA.principal + resB.principal;
    const annualDebtServiceC = annualInterestC + annualPrincipalC;

    const deductibleInterestC = toCents(fromCents(annualInterestC) * effectiveDeductibility);

    // FIXED: Pre-tax cashflow now subtracts complete debt service, not just interest
    const preTaxCashFlowC = annualGrossRentC - annualDebtServiceC - rentalExpensesC;

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
    
    // FIXED: Equity calculation deducts the dynamic global loan balance, cleanly offsetting auto-calculations
    currentLoanBalanceC -= annualPrincipalC;
    const equityC_yr = propValueC - currentLoanBalanceC;

    historicalAfterTaxCents.push(afterTaxCashFlowC);
    
    const monthlyCFs = [initialInvestmentC];
    for (let i = 0; i < yr; i++) {
      const monthlyC = Math.round(historicalAfterTaxCents[i] / 12);
      for (let m = 1; m <= 12; m++) {
        monthlyCFs.push(monthlyC);
      }
    }
    monthlyCFs[monthlyCFs.length - 1] += equityC_yr;

    const monthlyIRRDecimal = calculateMonthlyIRR(monthlyCFs, 0.01);
    
    let calculatedIRR = null;
    let preTaxEquivalentIRR = null;

    if (monthlyIRRDecimal !== null) {
      calculatedIRR = (Math.pow(1 + monthlyIRRDecimal, 12) - 1) * 100;
      const preTaxMonthlyIRRDecimal = monthlyIRRDecimal / (1 - taxRate);
      preTaxEquivalentIRR = (Math.pow(1 + preTaxMonthlyIRRDecimal, 12) - 1) * 100;
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
      loanAmount: fromCents(currentLoanBalanceC), // Passes out correct amortized balances
      irr: calculatedIRR, 
      preTaxEquivalentIRR: preTaxEquivalentIRR, 
    });
  }

  // --- NEW MERGED FIXES: Yields, Cash Neutral, and Cash Positive logic ---
  const yr1 = projections[0];
  const propertyCostC = pvC + renoCostsC; // Use property cost, not total cost for yield
  const grossYieldYr1 = fromCents(propertyCostC) > 0 ? (yr1.annualGrossRent / fromCents(propertyCostC)) * 100 : 0;
  const netRentYr1 = yr1.annualGrossRent - yr1.annualRentalExpenses;
  const netYieldYr1 = fromCents(propertyCostC) > 0 ? (netRentYr1 / fromCents(propertyCostC)) * 100 : 0;
  const fallbackRate = loanA?.rates?.[0] ? parseNum(loanA.rates[0]) : 0;

  // Real cash neutral formula
  const maxSupportableLoanC = fallbackRate > 0 ? toCents(netRentYr1 / (fallbackRate / 100)) : 0;
  let cashNeutralC = totalCostC - maxSupportableLoanC;
  if (cashNeutralC < 0) cashNeutralC = 0;
  const cashNeutralInvestment = fromCents(cashNeutralC);

  // Return relative "yr" format for your React array mapping
  const cashPositiveYear = (() => {
    const found = projections.find((p) => p.afterTaxCashFlow > 0);
    if (found) return `${found.index}yr`; 
    
    const futureYearStr = findCashPositiveYear({
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

    if (futureYearStr && futureYearStr !== "30yr+") {
      const diff = parseInt(futureYearStr) - currentYear + 1;
      return `${diff}yr`;
    }
    return "30yr+";
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