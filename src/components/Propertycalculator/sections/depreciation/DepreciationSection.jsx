import React from "react";
import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

import SelectField from "../../../SelectField";

export default function DepreciationSection({
  chattelsValue, setChattelsValue,
  depreciationMethod, setDepreciationMethod,
  chattelsDepreciationRate, setChattelsDepreciationRate,
  buildingDepreciationRate, setBuildingDepreciationRate
}) {
  return (
    <CollapsibleSection title="4. Depreciation">
      <InputField
        label="Chattels value"
        prefix="$"
        value={chattelsValue}
        onChange={setChattelsValue}
        tooltip="Total value of depreciable chattels from QS report."
      />
      <SelectField
        label="Chattels depreciation method"
        value={depreciationMethod}
        onChange={setDepreciationMethod}
        options={[
          { label: "Diminishing Value (DV)", value: "DV" },
          { label: "Straight Line (SL)", value: "SL" },
        ]}
      />
      <InputField
        label="Chattels depreciation rate"
        suffix="%"
        value={chattelsDepreciationRate}
        onChange={setChattelsDepreciationRate}
        tooltip="IRD-compliant blended rate. Default: 25% DV."
      />
      <InputField
        label="Building depreciation rate"
        suffix="%"
        value={buildingDepreciationRate}
        onChange={setBuildingDepreciationRate}
        disabled={true}
        tooltip="Building depreciation for NZ residential property is 0% (abolished from 2011/12 tax year)."
      />
    </CollapsibleSection>
  );
}