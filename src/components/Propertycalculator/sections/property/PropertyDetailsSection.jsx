import React from "react";
import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function PropertyDetailsSection({
  propertyAddress, setPropertyAddress,
  propertyDescription, setPropertyDescription,
  propertyValue, setPropertyValue,
  purchaseCosts, setPurchaseCosts,
  grossRentWeekly, setGrossRentWeekly,
  rentalExpensesPercent, setRentalExpensesPercent,
  setActiveModal,
  renovationCosts,
  renovationTimeline = []
}) {
  
  const basePrice = parseFloat(propertyValue) || 0;
  const baseReno = parseFloat(renovationCosts) || 0;
  
  const timelineRenoTotal = renovationTimeline.reduce((sum, val) => {
    return sum + (parseFloat(val) || 0);
  }, 0);

  const combinedDisplayValue = basePrice + baseReno + timelineRenoTotal;

  const handleValueChange = (newTotal) => {
    const totalNum = parseFloat(newTotal) || 0;
    const totalExistingRenos = baseReno + timelineRenoTotal;
    const newBasePrice = totalNum > totalExistingRenos ? totalNum - totalExistingRenos : 0;
    setPropertyValue(newBasePrice.toString());
  };

  return (
    <CollapsibleSection title="1. Property Details" defaultOpen={true}>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Property value"
            prefix="$"
            value={combinedDisplayValue === 0 ? "" : combinedDisplayValue.toString()} 
            onChange={handleValueChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("propertyValue")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Purchase costs"
            prefix="$"
            value={purchaseCosts}
            onChange={setPurchaseCosts}
            placeholder="Auto (0.5% of value)"
            tooltip="Legal + due diligence fees. Leave blank to auto-calculate at 0.5% of property value."
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("purchaseCosts")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      {/* NEW EDIT BUTTON FOR RENTAL INCOME */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Gross rent per week"
            prefix="$"
            value={grossRentWeekly}
            onChange={setGrossRentWeekly}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("rentalIncome")}
          className="mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <InputField
        label="Rental expenses"
        suffix="%"
        value={rentalExpensesPercent}
        onChange={setRentalExpensesPercent}
        tooltip="Management fees, insurance, rates, maintenance. Default: 30%"
      />
    </CollapsibleSection>
  );
}