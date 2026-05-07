export { default as MortgageCalculator } from "./components/MortgageCalculator/MortgageCalculator.jsx";
export { default as MortgageCalculatorPage } from "./pages/MortgageCalculator/page.jsx";
export { default as MortgageCalculatorV2 } from "./components/MortgageCalculator1/MortgageCalculator1.jsx";
export { default as MortgageCalculatorPageV2 } from "./pages/MortgageCalculator1/page.jsx";

export {
  calculateMortgage,
  calculateMortgageWithSavings,
  generateSchedule,
  getPeriodsPerYear,

} from "./helpers/mortgageHelpers.js";
