import { memo } from "react";
import { YEARS_PER_PAGE } from "../../../../../../constants/expenseConfig";
import { formatVal } from "../../../../../../utils/calculatorUtils";

const YEAR_INDICES = Array.from({ length: YEARS_PER_PAGE }, (_, i) => i);

export const RentalIncomeSection = memo(
    ({ startIndex, projections, focusedIdx, onFocus, onChange }) => (
        <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative mb-4 min-w-[450px]">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">
                Annual Rental Income
            </span>

            <YearLabels startIndex={startIndex} />

            <div className="flex items-center mb-2 w-full">
                <div className="w-[110px] text-right pr-4 text-[13px] text-[#64748B] font-bold flex-shrink-0">
                    Annual rent:
                </div>
                <div className="flex-1 flex gap-2 ml-1">
                    {YEAR_INDICES.map((idx) => {
                        const absoluteIdx = startIndex + idx;
                        const rawVal = projections[absoluteIdx] ?? "";
                        const isFocused = focusedIdx === absoluteIdx;
                        const displayVal = isFocused ? rawVal : formatVal(rawVal);

                        return (
                            <div key={idx} className="flex-1">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={displayVal}
                                    onChange={(e) => onChange(idx, e.target.value)}
                                    onFocus={() => onFocus(absoluteIdx)}
                                    onBlur={() => onFocus(null)}
                                    className="w-full border border-[#CBD5E1] rounded-[4px] px-1 py-1.5 text-[13px] text-center text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
);

function YearLabels({ startIndex }) {
  return (
    <div className="flex items-center mb-4 w-full">
      <div className="w-[110px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">
        Year:
      </div>
      <div className="flex-1 flex gap-2 ml-1">
        {YEAR_INDICES.map((idx) => (
          <div key={idx} className="flex-1 text-center text-[12px] text-[#64748B] font-bold">
            {startIndex + idx + 1}yr
          </div>
        ))}
      </div>
    </div>
  );
}