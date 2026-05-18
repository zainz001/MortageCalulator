/**
 * Calculates Total Equity, Useable Equity, and Borrowing Ability based on NZ property investment rules.
 * * @param {number} homeValue - The current estimated market value of the user's home.
 * @param {number} mortgage - The remaining balance on the user's home mortgage.
 * @param {number} savings - Any additional cash savings to be used as a deposit.
 * @param {string} propertyType - "new_build", "holiday_home", or "existing".
 * @returns {object} Object containing the calculated financial metrics.
 */
export function calculateEquityAndBorrowing({
  homeValue = 0,
  mortgage = 0,
  savings = 0,
  propertyType = "new_build"
}) {

  const totalEquity = Math.max(0, homeValue - mortgage) + savings;

  const maxLendableOnHome = homeValue * 0.80;
  const useableEquityFromHome = Math.max(0, maxLendableOnHome - mortgage);
  const useableEquity = useableEquityFromHome + savings;

  let depositRequirement = 0.20; 
  
  if (propertyType === "existing") {
    depositRequirement = 0.35;
  }

  const borrowingAbility = useableEquity / depositRequirement;

  return {
    totalEquity,
    useableEquity,
    borrowingAbility,
    depositRequirementPercentage: depositRequirement * 100
  };
}
/**
 * Calculates Capital Growth over time using compound interest.
 */
export function calculateCapitalGrowth(currentValue, annualRatePercent, years) {
  const rate = annualRatePercent / 100;
  const futureValue = currentValue * Math.pow(1 + rate, years);
  const increase = futureValue - currentValue;
  
  return {
    futureValue,
    increase
  };
}

/**
 * Calculates Interest-Only mortgage payments based on frequency.
 */
export function calculateInterestOnly(loanAmount, annualRatePercent, frequency) {
  const annualInterest = loanAmount * (annualRatePercent / 100);
  
  let payment = 0;
  if (frequency === 'monthly') payment = annualInterest / 12;
  if (frequency === 'fortnightly') payment = annualInterest / 26;
  if (frequency === 'weekly') payment = annualInterest / 52;
  
  return payment;
}