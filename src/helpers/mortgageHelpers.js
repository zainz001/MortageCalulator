
export function getPeriodsPerYear(freq) {
  if (freq === "weekly") return 52;
  if (freq === "fortnightly") return 26;
  return 12;
}


function runAmortisation({ loanAmount, r, n, periodsPerYear, repaymentType, extraRepayment }) {

  let scheduledRepayment;
  if (repaymentType === "interest_only") {
    scheduledRepayment = loanAmount * r;
  }
  else if (r === 0) {
    scheduledRepayment = loanAmount / n;
  }
  else {
    scheduledRepayment = loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  let balance = loanAmount;
  let totalPaid = 0;
  let totalInterestPaid = 0;
  let periodsActual = 0;
  const yearlyBalances = [];
  const startYear = new Date().getFullYear();

  for (let i = 1; i <= n; i++) {
    if (balance <= 0) break;

    const interestPortion = balance * r;
    let principalPortion = scheduledRepayment + extraRepayment - interestPortion;

    // Cap final repayment so balance doesn't go below 0
    principalPortion = Math.min(principalPortion, balance);

    const actualRepayment = interestPortion + principalPortion;
    balance -= principalPortion;
    if (balance < 0.005) balance = 0;

    totalPaid += actualRepayment;
    totalInterestPaid += interestPortion;
    periodsActual = i;

    // Record end-of-year balance (and first period for chart start)
    const pointsPerYear = 4; // quarterly
    const step = Math.floor(periodsPerYear / pointsPerYear);

    if (i === 1 || i % step === 0) {
      yearlyBalances.push({
        year: startYear + i / periodsPerYear, // fractional year
        balance: Math.max(0, balance),
      });
    }

    if (balance === 0) break;
  }

  return {
    scheduledRepayment,
    totalRepaid: totalPaid,
    totalInterest: totalInterestPaid,
    numberOfRepayments: periodsActual,
    yearlyBalances,
  };
}

export function calculateMortgage({
  propertyPrice,
  depositAmount,
  rate,
  years,
  frequency = "monthly",
  repaymentType = "principal_interest",
  extraRepayment = 0,
}) {
  const loanAmount = propertyPrice - depositAmount;
  const periodsPerYear = getPeriodsPerYear(frequency);
  const r = rate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  const sim = runAmortisation({ loanAmount, r, n, periodsPerYear, repaymentType, extraRepayment });

  return {
    loanAmount,
    depositAmount,
    depositPercent: propertyPrice > 0 ? (depositAmount / propertyPrice) * 100 : 0,
    lvr: propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0,
    repayment: sim.scheduledRepayment,
    totalRepaid: sim.totalRepaid,
    totalInterest: sim.totalInterest,
    numberOfRepayments: sim.numberOfRepayments,
  };
}

export function calculateMortgageWithSavings({
  propertyPrice,
  depositAmount,
  rate,
  years,
  frequency = "monthly",
  repaymentType = "principal_interest",
  extraRepayment = 0,
}) {
  const loanAmount = propertyPrice - depositAmount;
  const periodsPerYear = getPeriodsPerYear(frequency);
  const r = rate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  const withExtra = runAmortisation({ loanAmount, r, n, periodsPerYear, repaymentType, extraRepayment });
  const withoutExtra = extraRepayment > 0
    ? runAmortisation({ loanAmount, r, n, periodsPerYear, repaymentType, extraRepayment: 0 })
    : withExtra;

  const interestSaved = extraRepayment > 0
    ? Math.max(0, withoutExtra.totalInterest - withExtra.totalInterest)
    : 0;

  const periodsSaved = extraRepayment > 0
    ? Math.max(0, withoutExtra.numberOfRepayments - withExtra.numberOfRepayments)
    : 0;

  const yearsSaved = Math.floor(periodsSaved / periodsPerYear);
  const monthsSaved = Math.round((periodsSaved % periodsPerYear) / (periodsPerYear / 12));

  return {
    loanAmount,
    depositAmount,
    depositPercent: propertyPrice > 0 ? (depositAmount / propertyPrice) * 100 : 0,
    lvr: propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0,
    repayment: withExtra.scheduledRepayment,
    totalRepaid: withExtra.totalRepaid,
    totalInterest: withExtra.totalInterest,
    numberOfRepayments: withExtra.numberOfRepayments,
    interestSaved,
    yearsSaved,
    monthsSaved,
    scheduleWithExtra: withExtra.yearlyBalances,
    scheduleWithoutExtra: withoutExtra.yearlyBalances,
  };
}

// Keep generateSchedule for backward compat — now returns the accurate sim data
export function generateSchedule({
  propertyPrice,
  depositAmount,
  rate,
  years,
  frequency = "monthly",
  repaymentType = "principal_interest",
  extraRepayment = 0,
}) {
  const loanAmount = propertyPrice - depositAmount;
  const periodsPerYear = getPeriodsPerYear(frequency);
  const r = rate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  const sim = runAmortisation({ loanAmount, r, n, periodsPerYear, repaymentType, extraRepayment });
  return sim.yearlyBalances;
}


function runAmortisationOffset({ loanAmount, r, n, periodsPerYear, offsetMode, offsetBalance, offsetScheduleArray, manualRepayment }) {
  let scheduledRepayment;
  
  // Calculate standard scheduled repayment based on full opening loan amount
  if (r === 0) {
    scheduledRepayment = loanAmount / n;
  } else {
    scheduledRepayment = loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  // USE CUSTOM REPAYMENT: If the user typed a number higher than the minimum, use it!
  const activeRepayment = (manualRepayment && manualRepayment > scheduledRepayment) 
    ? manualRepayment 
    : scheduledRepayment;

  let balance = loanAmount;
  let totalPaid = 0;
  let totalInterestPaid = 0;
  let periodsActual = 0;
  const yearlyBalances = [];
  const startYear = new Date().getFullYear();

  for (let i = 1; i <= n; i++) {
    if (balance <= 0) break;

    // Determine the current offset balance based on the mode
    let currentOffset = 0;
    if (offsetMode === 'constant') {
      currentOffset = offsetBalance;
    } else if (offsetMode === 'schedule' && offsetScheduleArray) {
      // Map current period `i` to the correct 0-indexed month
      const monthIndex = Math.floor((i - 1) * 12 / periodsPerYear);
      currentOffset = offsetScheduleArray[monthIndex] || 0;
    }

    // Interest is only charged on the effective balance
    const effectiveBalance = Math.max(0, balance - currentOffset);
    const interestPortion = effectiveBalance * r;
    
    // The principal portion absorbs whatever is left of the ACTIVE repayment
    let principalPortion = activeRepayment - interestPortion;

    // Cap final repayment
    if (principalPortion > balance) {
      principalPortion = balance;
    }

    const actualRepayment = interestPortion + principalPortion;
    balance -= principalPortion;
    if (balance < 0.005) balance = 0;

    totalPaid += actualRepayment;
    totalInterestPaid += interestPortion;
    periodsActual = i;

    // Record quarterly balances for the chart
    const pointsPerYear = 4; 
    const step = Math.floor(periodsPerYear / pointsPerYear);

    if (i === 1 || i % step === 0 || balance === 0) {
      yearlyBalances.push({
        year: startYear + i / periodsPerYear,
        balance: Math.max(0, balance),
      });
    }

    if (balance === 0) break;
  }

  return {
    scheduledRepayment,
    activeRepayment,
    totalRepaid: totalPaid,
    totalInterest: totalInterestPaid,
    numberOfRepayments: periodsActual,
    yearlyBalances,
  };
}

export function calculateOffsetMortgageSavings({
  propertyPrice,
  depositAmount,
  rate,
  years,
  frequency = "monthly",
  offsetMode = "constant",
  offsetBalance = 0,
  offsetScheduleArray = [],
  manualRepayment = 0, // NEW ARGUMENT HERE
}) {
  const loanAmount = Math.max(0, propertyPrice - depositAmount);
  const periodsPerYear = getPeriodsPerYear(frequency);
  const r = rate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  if (loanAmount <= 0 || n <= 0) return null;

  // Scenario A: Standard Loan (0 offset). Uses the manual override so we have a fair comparison.
  const standardSim = runAmortisationOffset({ loanAmount, r, n, periodsPerYear, offsetMode: 'constant', offsetBalance: 0, manualRepayment });
  
  // Scenario B: Offset Loan
  const offsetSim = runAmortisationOffset({ loanAmount, r, n, periodsPerYear, offsetMode, offsetBalance, offsetScheduleArray, manualRepayment });

  const interestSaved = Math.max(0, standardSim.totalInterest - offsetSim.totalInterest);
  const periodsSaved = Math.max(0, standardSim.numberOfRepayments - offsetSim.numberOfRepayments);

  const yearsSaved = Math.floor(periodsSaved / periodsPerYear);
  const monthsSaved = Math.round((periodsSaved % periodsPerYear) / (periodsPerYear / 12));

  return {
    loanAmount,
    depositAmount,
    depositPercent: propertyPrice > 0 ? (depositAmount / propertyPrice) * 100 : 0,
    lvr: propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0,
    repayment: standardSim.scheduledRepayment,
    activeRepayment: standardSim.activeRepayment, // Expose the active repayment
    totalRepaidStandard: standardSim.totalRepaid,
    totalInterestStandard: standardSim.totalInterest,
    numberOfRepaymentsStandard: standardSim.numberOfRepayments,
    totalRepaidOffset: offsetSim.totalRepaid,
    totalInterestOffset: offsetSim.totalInterest,
    numberOfRepaymentsOffset: offsetSim.numberOfRepayments,
    currentEffectiveBalance: Math.max(0, loanAmount - (offsetMode === 'constant' ? offsetBalance : (offsetScheduleArray[0] || 0))),
    currentInterestSaving: Math.max(0, (loanAmount * r) - (Math.max(0, loanAmount - (offsetMode === 'constant' ? offsetBalance : (offsetScheduleArray[0] || 0))) * r)),
    interestSaved,
    yearsSaved,
    monthsSaved,
    payoffYearsStandard: Math.floor(standardSim.numberOfRepayments / periodsPerYear),
    payoffMonthsStandard: Math.round((standardSim.numberOfRepayments % periodsPerYear) / (periodsPerYear / 12)),
    payoffYearsOffset: Math.floor(offsetSim.numberOfRepayments / periodsPerYear),
    payoffMonthsOffset: Math.round((offsetSim.numberOfRepayments % periodsPerYear) / (periodsPerYear / 12)),
    scheduleStandard: standardSim.yearlyBalances,
    scheduleOffset: offsetSim.yearlyBalances,
  };
}