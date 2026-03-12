export function calculateMortgage(balance, years, rate) {
  const r = rate / 100 / 12;
  const n = years * 12;

  return balance * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

export function generateSchedule(balance, years, rate) {
  const r = rate / 100 / 12;
  const n = years * 12;

  let remaining = balance;
  const data = [];

  for (let i = 1; i <= n; i++) {
    const repayment = calculateMortgage(balance, years, rate);
    const interest = remaining * r;
    const principal = repayment - interest;

    remaining -= principal;
    if (remaining < 0) remaining = 0;

    if (i % 12 === 0 || i === 1) {
      data.push({
        year: (2025 + Math.ceil(i / 12)).toString(),
        bank: remaining,
        swish: remaining * 0.75,
      });
    }

    if (remaining === 0) break;
  }

  return data;
}