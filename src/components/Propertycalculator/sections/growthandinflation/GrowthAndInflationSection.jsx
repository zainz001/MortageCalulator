import React from "react";
import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function GrowthAndInflationSection({
  capitalGrowthRate, setCapitalGrowthRate,
  inflationRate, setInflationRate,
  setActiveModal // Added this prop so the edit buttons work
}) {
  return (
    <CollapsibleSection title="3. Growth & Inflation">
      
      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
          <InputField
            label="Capital growth rate (p.a.)"
            suffix="%"
            value={capitalGrowthRate}
            onChange={setCapitalGrowthRate}
            tooltip="Applied to property value annually using compound growth."
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("capitalGrowthRate")}
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
          <InputField
            label="Inflation rate / CPI (p.a.)"
            suffix="%"
            value={inflationRate}
            onChange={setInflationRate}
            tooltip="Applied to rent and rental expenses annually."
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("inflationRate")}
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

    </CollapsibleSection>
  );
}