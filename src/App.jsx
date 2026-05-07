import { useState } from "react";
import './App.css'

import MortgageCalculatorPage from './pages/MortgageCalculator/page'
import Offset from './pages/offset/page'
import PropertyCalculator from "./pages/Propertycalculator/page";

const titles = {
  mortgage: "Mortgage Calculator",
  offset: "Offset Calculator",
  property: "Property Investment Calculator"
};

const calculatorIds = new Set(Object.keys(titles));

const normalizeCalculatorId = (calculatorId) =>
  calculatorIds.has(calculatorId) ? calculatorId : "mortgage";

/**
 * @param {{ initialCalculator?: 'mortgage' | 'offset' | 'property' }} props
 */
function App({ initialCalculator = "mortgage" }) {
  const [selectedCalculator, setSelectedCalculator] = useState(() =>
    normalizeCalculatorId(initialCalculator)
  );

  return (
    <div className="app-container w-full min-w-0 px-0 sm:px-4 md:px-8 lg:px-16 py-4 md:py-10 max-w-6xl mx-auto">

      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full px-2 sm:px-0">

        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] w-full sm:w-auto break-words">
          {titles[selectedCalculator] || "Calculator"}
        </h2>

        <select
          value={selectedCalculator}
          onChange={(e) => setSelectedCalculator(normalizeCalculatorId(e.target.value))}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none"
        >
          <option value="mortgage">Mortgage</option>
          <option value="offset">Offset Mortgage</option>
          <option value="property">PIA</option>
        </select>

      </div>

      <div className="w-full min-w-0">
        {selectedCalculator === "mortgage" && <MortgageCalculatorPage />}
        {selectedCalculator === "offset" && <Offset />}
        {selectedCalculator === "property" && <PropertyCalculator />}
      </div>

    </div>
  );
}

export default App;