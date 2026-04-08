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

    principalPortion = Math.min(principalPortion, balance);

    const actualRepayment = interestPortion + principalPortion;
    balance -= principalPortion;
    if (balance < 0.005) balance = 0;

    totalPaid += actualRepayment;
    totalInterestPaid += interestPortion;
    periodsActual = i;

    const pointsPerYear = 4;
    const step = Math.floor(periodsPerYear / pointsPerYear);

    if (i === 1 || i % step === 0) {
      yearlyBalances.push({
        year: startYear + i / periodsPerYear,
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


export function runAmortisationOffset({
  loanAmount, r, n, periodsPerYear,
  currentSavings, monthlyContribution,
  monthlyIncome = 0,
  monthlyExpenses = 0
}) {
  let scheduledRepayment;
  if (r === 0) {
    scheduledRepayment = loanAmount / n;
  } else {
    scheduledRepayment = loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  // ── FIX: when using income/expense mode, offset grows by monthly surplus each period.
  // When using direct contribution mode, it grows by contributionPerPeriod.
  const monthlySurplus = monthlyIncome > 0
    ? monthlyIncome - monthlyExpenses - scheduledRepayment
    : null;
  const contributionPerPeriod = (monthlyContribution * 12) / periodsPerYear;

  let balance = loanAmount;
  let offsetBalance = currentSavings;
  let totalPaid = 0;
  let totalInterestPaid = 0;
  let periodsActual = 0;
  const yearlyBalances = [];
  const startYear = new Date().getFullYear();

  for (let i = 1; i <= n; i++) {
    if (balance <= 0 || offsetBalance >= balance) break;

    // Intra-period float: income lands day 1, outgoings leave mid-period on average.
    // Formula matches NZHL's detailed calculator exactly.
    let dailyBalanceAdjustment = 0;
    if (monthlyIncome > 0 && periodsPerYear === 12) {
      dailyBalanceAdjustment = monthlyIncome - monthlyExpenses;
    }
    const effectiveBalanceForInterest = Math.max(0, balance - offsetBalance - dailyBalanceAdjustment);
    const interestPortion = effectiveBalanceForInterest * r;

    let principalPortion = scheduledRepayment - interestPortion;
    if (principalPortion < 0) principalPortion = 0;

    balance -= principalPortion;
    if (balance < 0.005) balance = 0;

    // ── FIX: surplus accumulates month-over-month (was: static contributionPerPeriod only)
    const periodGrowth = monthlySurplus !== null ? monthlySurplus : contributionPerPeriod;
    offsetBalance += periodGrowth;
    if (offsetBalance < 0) offsetBalance = 0;

    totalPaid += scheduledRepayment;
    totalInterestPaid += interestPortion;
    periodsActual = i;

    const step = Math.max(1, Math.floor(periodsPerYear / 4));
    if (i === 1 || i % step === 0 || offsetBalance >= balance) {
      yearlyBalances.push({
        year: startYear + i / periodsPerYear,
        balance: Math.max(0, balance - offsetBalance),
      });
    }
  }

  totalPaid += balance; // Final lump sum payoff

  return {
    scheduledRepayment,
    activeRepayment: scheduledRepayment,
    totalRepaid: totalPaid,
    totalInterest: totalInterestPaid,
    numberOfRepayments: periodsActual,
    yearlyBalances,
    finalOffsetBalance: offsetBalance,
  };
}


export function calculateOffsetMortgageSavings({
  propertyPrice,
  depositAmount = 0,
  rate,
  years,
  frequency = "monthly",
  currentSavings = 0,
  monthlyContribution = 0,
  monthlyIncome = 0,
  monthlyExpenses = 0,
}) {
  const loanAmount = Math.max(0, propertyPrice - depositAmount);
  const periodsPerYear = getPeriodsPerYear(frequency);
  const r = rate / 100 / periodsPerYear;
  const n = years * periodsPerYear;

  if (loanAmount <= 0 || n <= 0) return null;

  const standardSim = runAmortisationOffset({
    loanAmount, r, n, periodsPerYear,
    currentSavings: 0,
    monthlyContribution: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });

  const offsetSim = runAmortisationOffset({
    loanAmount, r, n, periodsPerYear,
    currentSavings,
    monthlyContribution,
    monthlyIncome,
    monthlyExpenses,
  });

  const interestSaved = Math.max(0, standardSim.totalInterest - offsetSim.totalInterest);
  const periodsSaved = Math.max(0, standardSim.numberOfRepayments - offsetSim.numberOfRepayments);
  const yearsSaved = Math.floor(periodsSaved / periodsPerYear);
  const monthsSaved = Math.round((periodsSaved % periodsPerYear) / (periodsPerYear / 12));

  const offsetByPeriod = new Map(
    offsetSim.yearlyBalances.map((row) => [Math.round(row.year * 10000), row.balance])
  );

  const unifiedSchedule = standardSim.yearlyBalances.map((row) => {
    const key = Math.round(row.year * 10000);
    return {
      year: row.year,
      standard: row.balance,
      offset: offsetByPeriod.has(key) ? Math.max(0, offsetByPeriod.get(key)) : 0,
    };
  });

  return {
    loanAmount,
    depositAmount,
    depositPercent: propertyPrice > 0 ? (depositAmount / propertyPrice) * 100 : 0,
    lvr: propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0,
    repayment: standardSim.scheduledRepayment,
    activeRepayment: offsetSim.activeRepayment,
    totalRepaidStandard: standardSim.totalRepaid,
    totalInterestStandard: standardSim.totalInterest,
    numberOfRepaymentsStandard: standardSim.numberOfRepayments,
    totalRepaidOffset: offsetSim.totalRepaid,
    totalInterestOffset: offsetSim.totalInterest,
    numberOfRepaymentsOffset: offsetSim.numberOfRepayments,
    currentEffectiveBalance: Math.max(0, loanAmount - currentSavings),
    currentInterestSaving: Math.max(0, (loanAmount * r) - (Math.max(0, loanAmount - currentSavings) * r)),
    interestSaved,
    yearsSaved,
    monthsSaved,
    payoffYearsStandard: Math.floor(standardSim.numberOfRepayments / periodsPerYear),
    payoffMonthsStandard: Math.round((standardSim.numberOfRepayments % periodsPerYear) / (periodsPerYear / 12)),
    payoffYearsOffset: Math.floor(offsetSim.numberOfRepayments / periodsPerYear),
    payoffMonthsOffset: Math.round((offsetSim.numberOfRepayments % periodsPerYear) / (periodsPerYear / 12)),
    scheduleStandard: standardSim.yearlyBalances,
    scheduleOffset: offsetSim.yearlyBalances,
    unifiedSchedule,
  };
}