import React from "react";
import EquityAndLeverageCalculator from "../../components/Equitycalculator/EquityAndLeverageCalculator";
import CapitalGrowthCalculator from "../../components/Equitycalculator/Captialgrowthcalculator"; 
import PropertyInvestmentCalculator from "../../components/Equitycalculator/interestcalculator"; 
import CalculatorThemeWrapper from "../../components/dynamictheme";
export default function EquityCalculatorPage() {
 const currentBrand = "opes"; 

  return (
    
    <div >
      <CalculatorThemeWrapper defaultBrand="opes">
    

  
      <section>
        <EquityAndLeverageCalculator brand={currentBrand} />
      </section>

     
      <div >
        <hr className="border-[#E2E8F0]" />
      </div>

 
      <section>
        <CapitalGrowthCalculator brand={currentBrand} />
      </section>

      <div>
        <hr className="border-[#E2E8F0]" />
      </div>

      
      <section>
        <PropertyInvestmentCalculator brand={currentBrand} />
      </section>
</CalculatorThemeWrapper>
    </div>
  );
}