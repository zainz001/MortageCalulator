
export function getPeriodsPerYear(freq) {
  if (freq === "weekly") return 52;
  if (freq === "fortnightly") return 26;
  return 12;
}


function runAmortisation({ loanAmount, r, n, periodsPerYear, repaymentType, extraRepayment }) {
 
  let scheduledRepayment;
  if (repaymentType === "interest_only") {
    scheduledRepayment = loanAmount * r;
  } else {
    if (r === 0) {
      scheduledRepayment = loanAmount / n;
    } else {
      scheduledRepayment = loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }
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
    if (principalPortion > balance) {
      principalPortion = balance;
    }

    const actualRepayment = interestPortion + principalPortion;
    balance -= principalPortion;
    if (balance < 0.005) balance = 0;

    totalPaid += actualRepayment;
    totalInterestPaid += interestPortion;
    periodsActual = i;

    // Record end-of-year balance (and first period for chart start)
    if (i === 1 || i % periodsPerYear === 0) {
      yearlyBalances.push({
        year: startYear + Math.ceil(i / periodsPerYear),
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