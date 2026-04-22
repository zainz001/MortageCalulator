import React from "react";
import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function GrowthAndInflationSection({
  capitalGrowthRate, setCapitalGrowthRate,
  inflationRate, setInflationRate
}) {
  return (
    <CollapsibleSection title="3. Growth & Inflation">
      <InputField
        label="Capital growth rate (p.a.)"
        suffix="%"
        value={capitalGrowthRate}
        onChange={setCapitalGrowthRate}
        tooltip="Applied to property value annually using compound growth."
      />
      <InputField
        label="Inflation rate / CPI (p.a.)"
        suffix="%"
        value={inflationRate}
        onChange={setInflationRate}
        tooltip="Applied to rent and rental expenses annually."
      />
    </CollapsibleSection>
  );
}