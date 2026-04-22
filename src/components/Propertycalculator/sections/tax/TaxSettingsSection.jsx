import React from "react";
import SelectField from "../../../SelectField";
import ToggleSwitch from "../../../ToggleSwitch";
import CollapsibleSection from "../../../CollapsibleSection";

export default function TaxSettingsSection({
  investorTaxRate, setInvestorTaxRate,
  investorType, setInvestorType,
  isNewBuild, handleNewBuildToggle,
  interestDeductibility, setInterestDeductibility,
  ringFencing, setRingFencing
}) {
  return (
    <CollapsibleSection title="5. Tax Settings (NZ Rules)">
      <SelectField
        label="Investor tax rate"
        value={investorTaxRate}
        onChange={setInvestorTaxRate}
        options={[
          { label: "10.5%", value: "10.5" },
          { label: "17.5%", value: "17.5" },
          { label: "30%", value: "30" },
          { label: "33%", value: "33" },
          { label: "39%", value: "39" },
        ]}
      />
      <SelectField
        label="Investor type"
        value={investorType}
        onChange={setInvestorType}
        options={[
          { label: "Individual", value: "Individual" },
          { label: "Company", value: "Company" },
          { label: "Trust", value: "Trust" },
          { label: "LTC", value: "LTC" },
        ]}
      />
      <ToggleSwitch
        label="New build property"
        checked={isNewBuild}
        onChange={handleNewBuildToggle}
        tooltip="New builds retain full 100% interest deductibility."
      />
      <SelectField
        label="Interest deductibility"
        value={interestDeductibility}
        onChange={setInterestDeductibility}
        disabled={isNewBuild}
        tooltip="Configurable: 0%, 50%, 80%, 100%. Locked to 100% for new builds."
        options={[
          { label: "0%", value: "0" },
          { label: "50%", value: "50" },
          { label: "80%", value: "80" },
          { label: "100%", value: "100" },
        ]}
      />
      <div className="mt-1 p-3 bg-[#FFF9ED] border border-[#FEE08B] rounded-[8px]">
        <ToggleSwitch
          label="Ring-fencing applies"
          checked={ringFencing}
          onChange={setRingFencing}
          tooltip="When ON: rental losses cannot offset personal PAYE income."
        />
      </div>
    </CollapsibleSection>
  );
}