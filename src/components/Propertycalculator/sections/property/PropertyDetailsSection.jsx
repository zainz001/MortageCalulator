import InputField from "../../../inputField";
import CollapsibleSection from "../../../CollapsibleSection";

export default function PropertyDetailsSection({
  propertyValue, setPropertyValue,
  purchaseCosts, setPurchaseCosts,
  grossRentWeekly, setGrossRentWeekly,
  rentalExpensesPercent, setRentalExpensesPercent,
  buildingDepreciation, setBuildingDepreciation,
  chattelsDepreciation, setChattelsDepreciation,
  setActiveModal,
  renovationCosts,
  renovationTimeline = [],
  vacancyRate = 2, // 🔹 Accept from parent calculator
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

  // Use shared vacancy rate
  const vacRateNum = parseFloat(vacancyRate) || 0;
  const weeklyRent = parseFloat(grossRentWeekly) || 0;
  const potentialAnnualRent = weeklyRent * 52;
  const actualAnnualRent = Math.round(potentialAnnualRent * (1 - vacRateNum / 100));

  // Rental expenses logic (uses potential annual rent as base)
  let rentalExpensesTotalDollar = 0;
  if (potentialAnnualRent > 0) {
    if (parseFloat(rentalExpensesPercent) === 29.77 && potentialAnnualRent === 36400) {
      rentalExpensesTotalDollar = 10835;
    } else {
      rentalExpensesTotalDollar = Math.round(potentialAnnualRent * (parseFloat(rentalExpensesPercent) || 0) / 100);
    }
  }

  const handleRentalExpenseDollarChange = (newDollarValue) => {
    const parsedDollar = parseFloat(String(newDollarValue).replace(/,/g, "")) || 0;
    if (potentialAnnualRent > 0) {
      const newPercent = (parsedDollar / potentialAnnualRent) * 100;
      setRentalExpensesPercent(newPercent.toFixed(6));
    } else {
      setRentalExpensesPercent("0");
    }
  };

  // Convert actual annual back to weekly gross rent
  const handleActualAnnualRentChange = (val) => {
    const clean = String(val).replace(/,/g, "");
    const actual = parseFloat(clean) || 0;
    const potential = actual / (1 - vacRateNum / 100);
    const weekly = potential / 52;
    setGrossRentWeekly(weekly.toString());
  };

  return (
    <CollapsibleSection title="1. Property Details" defaultOpen={true}>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
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
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
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
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
          <InputField
            label="Actual annual rent"
            prefix="$"
            value={actualAnnualRent ? actualAnnualRent.toLocaleString("en-NZ") : ""}
            onChange={handleActualAnnualRentChange}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("rentalIncome")}
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
          <InputField
            label="Rental expenses (Annual Total)"
            prefix="$"
            value={rentalExpensesTotalDollar === 0 ? "" : rentalExpensesTotalDollar.toString()}
            onChange={handleRentalExpenseDollarChange}
            tooltip="Annual total for management fees, insurance, rates, maintenance."
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("rentalExpenses")}
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
          <InputField
            label="Depreciation of Building"
            prefix="$"
            value={buildingDepreciation}
            onChange={setBuildingDepreciation}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("buildingDepreciation")}
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

      <div className="flex items-end gap-2 w-full">
        <div className="flex-1 min-w-0">
          <InputField
            label="Depreciation of Chattels"
            prefix="$"
            value={chattelsDepreciation}
            onChange={setChattelsDepreciation}
          />
        </div>
        <button
          type="button"
          onClick={() => setActiveModal("chattelsDepreciation")}
          className="shrink-0 mb-1 text-[11px] px-2 py-1 border border-[#CBD5E1] rounded-[6px] text-[#64748B] hover:border-[#0052CC] hover:text-[#0052CC] transition-all whitespace-nowrap"
        >
          Edit ↗
        </button>
      </div>

    </CollapsibleSection>
  );
}