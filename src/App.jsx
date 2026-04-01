import { useState } from "react";
import './App.css'

import MortgageCalculatorPage from './pages/MortgageCalculator/page'
import MortgageCalculatorPage1 from './pages/MortgageCalculator1/page'

function App() {
  const [selectedCalculator, setSelectedCalculator] = useState("mortgage");

  return (
    <div className="app-container px-4 md:px-8 lg:px-16 py-6 md:py-10 max-w-6xl mx-auto">

      {/* Header Section */}
      <div className="mb-4 md:mb-6 flex items-center justify-between">
        
        {/* Dynamic Title */}
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#0052CC]">
          {selectedCalculator === "mortgage"
            ? "Mortgage Calculator"
            : "Offset Calculator"}
        </h2>

        {/* Dropdown */}
        <select
          value={selectedCalculator}
          onChange={(e) => setSelectedCalculator(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none"
        >
          <option value="mortgage">Mortgage</option>
          <option value="offset">Offset Mortgage</option>
        </select>

      </div>

      {/* Render Selected Calculator */}
      <div>
        {selectedCalculator === "mortgage" && <MortgageCalculatorPage />}
        {selectedCalculator === "offset" && <MortgageCalculatorPage1 />}
      </div>

    </div>
  );
}

export default App;