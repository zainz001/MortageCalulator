/**
 * propertyHelpers.js
 *
 * Core PIA calculation engine.
 * Spec ref: PIA Functional Spec §4 (Calculated Fields & Formulas)
 *
 * §9.1: All monetary values stored as integers (cents) internally to avoid
 *       floating-point errors. Converted to display format on render.
 *       Helper: toCents(x) → integer. fromCents(x) → float for display.
 */

// ─── §9.1 Integer-cents helpers ──────────────────────────────────────────────
const toCents = (dollars) => Math.round((dollars || 0) * 100);
const fromCents = (cents) => cents / 100;

// ─── §4.5 IRR — Newton-Raphson ───────────────────────────────────────────────
// §9.1: seed 0.1, max iterations 100, tolerance 0.000001
function calculateIRR(cashflowsCents, guess = 0.1) {
  const maxIter = 100;
  const tol = 0.000001;
  // Work in dollars for numerical stability (cents cause tiny dNpv denominators)
  const cf = cashflowsCents.map(fromCents);
  let irr = guess;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cf.length; t++) {
      npv += cf[t] / Math.pow(1 + irr, t);
      if (t > 0) dNpv -= (t * cf[t]) / Math.pow(1 + irr, t + 1);
    }
    if (dNpv === 0) return null; // Prevent division by zero
    const newIrr = irr - npv / dNpv;
    if (Math.abs(newIrr - irr) < tol) return newIrr * 100; // Return as percentage
    irr = newIrr;
  }
  return null; // Failed to converge — display 'N/A' per §9.4
}

// ─── §9.4 Cash-positive crossover search ─────────────────────────────────────
// Spec: iterate through projection years to find first year afterTaxCashFlow > 0
// If not found within 30 years, display "30yr+" per §9.4
function findCashPositiveYear(params) {
  // Extend search to 30 years using same engine
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

    // Simplified depreciation for the extended search (DV)
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
  return "30yr+"; // §9.4 — "Not within projection range"
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function calculatePIA({
  propertyValue,
  purchaseCostsManual,
  grossRentWeekly,
  rentalExpensesPercent,
  cashInvested,
  equityInvested,
  loanCostsManual,
  interestRate,
  loanType,            // §10 Q6: reserved for future P+I expansion
  additionalLoan,
  renovationCosts = 0, // §5.1 modal line items
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
  // ── §9.1: Convert all inputs to cents immediately ─────────────────────────
  const pvC = toCents(propertyValue);
  const purchCostsC = purchaseCostsManual !== null
    ? toCents(purchaseCostsManual)
    : toCents(propertyValue * 0.005);         // §3.1 auto-calc: 0.5% of property value
  const loanCostsC = loanCostsManual !== null ? toCents(loanCostsManual) : 0;
  const cashC = toCents(cashInvested);
  const equityC = toCents(equityInvested);
  const addLoanC = toCents(additionalLoan);
  const renoCostsC = toCents(renovationCosts);
  const furniC = toCents(furnitureCosts);
  const holdC = toCents(holdingCosts);
  const chattelsC = toCents(chattelsValue);
  const grossRentWkC = toCents(grossRentWeekly);

  // ── §4.1 Loan & Equity Derivations ───────────────────────────────────────
  const totalCostC = pvC + purchCostsC + loanCostsC + renoCostsC + furniC + holdC;

  // Loan amount is total costs plus any additional drawdown, minus cash/equity deposits
  const loanAmountC = totalCostC + addLoanC - cashC - equityC;

  const startingEquityC = pvC - loanAmountC;
  const LVR = propertyValue > 0 ? (fromCents(loanAmountC) / propertyValue) * 100 : 0;
  // §7.1: New build locks deductibility to 100%
  const effectiveDeductibility = isNewBuild ? 1.0 : (interestDeductibility / 100);
  const taxRate = investorTaxRate / 100;

  // §4.2: Interest is static on IO basis
  const annualInterestC = toCents(fromCents(loanAmountC) * (interestRate / 100));
  const deductibleInterestC = toCents(fromCents(annualInterestC) * effectiveDeductibility);

  const projections = [];
  let currentBookValueC = chattelsC;
  let accumulatedLossC = 0;

  const currentYear = new Date().getFullYear();
  // §4.5 IRR: Year 0 outlay = cash + equity invested
  const cashflowsForIRRCents = [-(cashC + equityC)];

  // ── §4.2 Annual Projections Engine ───────────────────────────────────────
  const maxProjectedYears = Math.max(10, renovationTimeline?.length || 0, furnitureTimeline?.length || 0);

  let lastMarketValueC = pvC + renoCostsC; // Year 0 Book Value base

  // ── §4.2 Annual Projections Engine ───────────────────────────────────────
  for (let yr = 1; yr <= maxProjectedYears; yr++) {

    const renoYrC = toCents(renovationTimeline[yr - 1] || 0);
    const propValueC = toCents(fromCents(lastMarketValueC) * (1 + capitalGrowthRate / 100)) + renoYrC;
    lastMarketValueC = propValueC;

  
    let annualGrossRentC;

    // Check if the user defined a custom rent value for this specific year in the modal
    if (rentTimeline && rentTimeline[yr - 1]) {
      annualGrossRentC = toCents(rentTimeline[yr - 1]);
    } else {
     
      annualGrossRentC = toCents(
        fromCents(grossRentWkC * 52) * Math.pow(1 + inflationRate / 100, yr)
      );
    }
    // -------------------------------

    const rentalExpensesC = toCents(fromCents(annualGrossRentC) * (rentalExpensesPercent / 100));
    // §4.2: Pre-tax cash flow uses FULL interest (cash cost, not deductible portion)
    const preTaxCashFlowC = annualGrossRentC - annualInterestC - rentalExpensesC;

    // ── §4.3 Depreciation Schedule ─────────────────────────────────────────
    let chattelsDepC = 0;
    if (currentBookValueC > 0) {
      if (depreciationMethod === "DV") {
        // §4.3: DV — applied to reducing book value
        chattelsDepC = toCents(fromCents(currentBookValueC) * (chattelsDepreciationRate / 100));
        currentBookValueC = Math.max(0, currentBookValueC - chattelsDepC);
      } else {
        // §4.3: SL — fixed amount, cannot depreciate below $0
        const slC = toCents(fromCents(chattelsC) * (chattelsDepreciationRate / 100));
        chattelsDepC = Math.min(currentBookValueC, slC);
        currentBookValueC = Math.max(0, currentBookValueC - chattelsDepC);
      }
    }
    // §4.3: Building depreciation — 0% default for NZ residential (§7.3)
    // NOTE: Spec says "Building value × rate" but spec provides no separate
    //       building value input. Using propValue as proxy; moot at 0%.
    const buildingDepC = toCents(fromCents(propValueC) * (buildingDepreciationRate / 100));

    // ── §4.4 Tax Credit Calculation ────────────────────────────────────────
    // §4.4: Total deductions = deductible interest + rental expenses + dep (chattels + building)
    //       + loan costs in yr 1 only
    let deductionsC = deductibleInterestC + rentalExpensesC + chattelsDepC + buildingDepC;
    if (yr === 1) deductionsC += loanCostsC; // §4.4: Loan costs yr 1 only

    const netTaxableIncomeC = annualGrossRentC - deductionsC;
    let taxCreditC = 0;

    if (netTaxableIncomeC < 0) {
      if (ringFencing) {
        // §7.5: Ring-fencing ON — loss carried forward, no PAYE offset, credit = 0
        accumulatedLossC += Math.abs(netTaxableIncomeC);
        taxCreditC = 0;
      } else {
        // §4.4: Loss offsets personal income at marginal rate
        taxCreditC = toCents(fromCents(Math.abs(netTaxableIncomeC)) * taxRate);
      }
    } else if (ringFencing && accumulatedLossC > 0) {
      // §7.5: Positive income offsets accumulated carried-forward loss
      const offsetC = Math.min(netTaxableIncomeC, accumulatedLossC);
      accumulatedLossC -= offsetC;
    }

    // §4.4: After-tax cash flow
    const afterTaxCashFlowC = preTaxCashFlowC + taxCreditC;

    // §4.2: Cost per week — positive = investor out-of-pocket
    const costPerWeekC = Math.round((-preTaxCashFlowC) / 52);

    const equityC_yr = propValueC - loanAmountC;

    // §4.5 IRR: Terminal value at yr 10 = afterTax + equity
    if (yr === 10) {
      cashflowsForIRRCents.push(afterTaxCashFlowC + equityC_yr);
    } else {
      cashflowsForIRRCents.push(afterTaxCashFlowC);
    }

    projections.push({
      year: (currentYear + yr - 1).toString(),
      index: yr,
      // §9.1: Expose dollar values for display (fromCents)
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
      accumulatedLoss: fromCents(accumulatedLossC), // §7.5 ring-fencing display
      loanAmount: fromCents(loanAmountC),      // static on IO — same every year
    });
  }

  // ── §4.5 Return Metrics ───────────────────────────────────────────────────
  const yr1 = projections[0];

  // §4.5: Gross yield = Gross rent yr1 ÷ Total cost × 100
  const grossYieldYr1 = fromCents(totalCostC) > 0
    ? (yr1.annualGrossRent / fromCents(totalCostC)) * 100
    : 0;

  // §4.5: Net rent = gross rent − rental expenses (before interest)
  const netRentYr1 = yr1.annualGrossRent - yr1.annualRentalExpenses;

  // §4.5: Net yield = Net rent yr1 ÷ Total cost × 100
  const netYieldYr1 = fromCents(totalCostC) > 0
    ? (netRentYr1 / fromCents(totalCostC)) * 100
    : 0;

  // §4.5: Cash neutral investment ≈ Loan amount ÷ 2
  const cashNeutralInvestment = fromCents(loanAmountC) / 2;

  // §9.4: Cash positive year — search up to 30 years, display "30yr+" if not found
  const cashPositiveYear = (() => {
    // First check within existing projections (yrs 1-10)
    const found = projections.find((p) => p.afterTaxCashFlow > 0);
    if (found) return found.year;
    // Extend to 30 years
    return findCashPositiveYear({
      loanAmount: fromCents(loanAmountC),
      grossRentWeekly,
      inflationRate,
      annualInterest: annualInterestC,
      rentalExpensesPercent,
      taxRate,
      ringFencing,
      deductibleInterestFn: () => deductibleInterestC,
      chattelsValueCents: chattelsC,
      chattelsDepreciationRate,
      currentYear,
      startFromYear: 11,
    });
  })();

  // §4.5: IRR — Newton-Raphson, returns % or null
  const calculatedIRR = calculateIRR(cashflowsForIRRCents);

  // §4.5: Pre-tax equivalent IRR = IRR ÷ (1 − tax rate)
  const preTaxEquivalentIRR = calculatedIRR !== null
    ? calculatedIRR / (1 - taxRate)
    : null;

  // Summary averages (used in results panel)
  const totalRent = projections.reduce((s, p) => s + p.annualGrossRent, 0);
  const totalExpenses = projections.reduce((s, p) => s + p.annualRentalExpenses, 0);
  const totalCashflow = projections.reduce((s, p) => s + p.afterTaxCashFlow, 0);
  const finalPropValue = projections[9].propertyValue;

  return {
    // §4.1 derivations
    totalCost: fromCents(totalCostC),
    loanAmount: fromCents(loanAmountC),
    startingEquity: fromCents(startingEquityC),
    LVR,
    purchaseCosts: fromCents(purchCostsC),
    loanCosts: fromCents(loanCostsC),

    projections,

    // §4.5 metrics
    metrics: {
      grossYieldYr1,
      netRentYr1,
      netYieldYr1,
      cashNeutralInvestment,
      cashPositiveYear,
      irr: calculatedIRR,
      preTaxEquivalentIRR,

      // Summary averages for results panel
      avgWeeklyRent: totalRent / 10 / 52,
      avgWeeklyExpenses: totalExpenses / 10 / 52,
      avgWeeklyCashflow: totalCashflow / 10 / 52,
      totalEquityIn10Years: projections[9].equity,
      avgEquityGainWeekly: (finalPropValue - propertyValue) / (10 * 52),
      avgNetGainWeekly: (finalPropValue - propertyValue) / (10 * 52) + totalCashflow / 10 / 52,
      isCashflowPositive: (totalCashflow / 10 / 52) > 0,
    },
  };
}