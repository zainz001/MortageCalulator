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

function App() {
  const [selectedCalculator, setSelectedCalculator] = useState("mortgage");

  return (
    <div className="app-container px-4 md:px-8 lg:px-16 py-6 md:py-10 max-w-6xl mx-auto overflow-hidden">

      {/* Header Section (Responsive Wrap) */}
      <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-4 w-full">

        {/* Dynamic Title */}
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC] flex-1 min-w-[200px] break-words">
          {titles[selectedCalculator] || "Calculator"}
        </h2>

        {/* Dropdown */}
        <select
          value={selectedCalculator}
          onChange={(e) => setSelectedCalculator(e.target.value)}
          className="w-full sm:w-auto flex-shrink-0 border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none"
        >
          <option value="mortgage">Mortgage</option>
          <option value="offset">Offset Mortgage</option>
          <option value="property">PIA</option>
        </select>

      </div>

      {/* Render Selected Calculator */}
      <div className="w-full overflow-x-hidden">
        {selectedCalculator === "mortgage" && <MortgageCalculatorPage />}
        {selectedCalculator === "offset" && <Offset />}
        {selectedCalculator === "property" && <PropertyCalculator />}
      </div>

    </div>
  );
}

export default App;