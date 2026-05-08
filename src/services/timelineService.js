export const generateInflationTimeline = ({
  baseAmount,
  inflationRate,
  inflationStartYear,
  useInflation,
  totalYears = 30,
}) => {
  const baseVal = Math.round(parseFloat(baseAmount) || 0);
  const rate = parseFloat(inflationRate) || 0;
  const startYear = parseInt(inflationStartYear, 10) || 1;

  return Array.from({ length: totalYears }, (_, index) => {
    const currentYear = index + 1;

   if (!useInflation || currentYear < startYear) {
      return String(baseVal);
    }

    const yearsOfGrowth = currentYear - startYear;
    const projectedVal = baseVal * Math.pow(1 + rate / 100, yearsOfGrowth);
    
    return String(Math.round(projectedVal));
  });
};