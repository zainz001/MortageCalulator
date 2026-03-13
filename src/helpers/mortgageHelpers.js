// helpers/mortgageHelpers.js
export function getPeriodsPerYear(freq) {
  if (freq === "weekly") return 52;
  if (freq === "fortnightly") return 26;
  return 12; // monthly default
}

export function calculateMortgage({
  propertyPrice,
  depositAmount,
  depositPercent,
  rate,
  years,
  frequency = "monthly",
  repaymentType = "principal_interest",
  extraRepayment = 0,
}) {
  // Determine deposit amount if percent is provided
  if (depositPercent && !depositAmount) {
    depositAmount = propertyPrice * (depositPercent / 100);
  }
  // Determine deposit percent if amount is provided
  if (depositAmount && !depositPercent) {
    depositPercent = (depositAmount / propertyPrice) * 100;
  }

  const loanAmount = propertyPrice - depositAmount;
  const periodsPerYear = getPeriodsPerYear(frequency);
  const r = rate / 100 / periodsPerYear; // periodic interest rate
  const n = years * periodsPerYear; // total number of repayments

  let repayment;
  if (repaymentType === "interest_only") {
    repayment = loanAmount * r;
  } else {
    repayment = loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  const repaymentWithExtra = repayment + extraRepayment;
  const totalRepaid = repayment * n;
  const totalInterest = totalRepaid - loanAmount;
  const lvr = (loanAmount / propertyPrice) * 100;

  return {
    loanAmount,
    depositAmount,
    depositPercent,
    lvr,
    repayment,
    repaymentWithExtra,
    totalRepaid,
    totalInterest,
    numberOfRepayments: n,
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

  const repayment =
    repaymentType === "interest_only"
      ? loanAmount * r
      : loanAmount * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  let remaining = loanAmount;
  const schedule = [];

  for (let i = 1; i <= n; i++) {
    const interestPortion = remaining * r;
    const principalPortion = repayment + extraRepayment - interestPortion;

    remaining -= principalPortion;
    if (remaining < 0) remaining = 0;

    // Push end-of-year balance or first period
    if (i % periodsPerYear === 0 || i === 1) {
      schedule.push({
        year: new Date().getFullYear() + Math.ceil(i / periodsPerYear),
        balance: remaining,
      });
    }

    if (remaining === 0) break;
  }

  return schedule;
}