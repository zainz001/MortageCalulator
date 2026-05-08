import { memo } from "react";
import InputField from "../../../../../inputField";

export const ProjectionSettings = memo(
  ({
    useInflation,
    onToggleInflation,
    inflationStartYear,
    onChangeStartYear,
    inflationRate,
    onChangeInflationRate, // 🔹 NEW
  }) => (
    <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative min-w-[450px]">
      <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">
        Rental Projections
      </span>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={useInflation}
            onChange={(e) => onToggleInflation(e.target.checked)}
            className="rounded text-[#0052CC]"
          />
          Inflation indexed from year
        </label>

        <div className="w-[60px] relative">
          <InputField value={inflationStartYear} onChange={onChangeStartYear} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#64748B] pointer-events-none">
            yr
          </span>
        </div>

        <span className="text-[13px] text-[#64748B]">at a rate of:</span>

        <div className="w-[80px]">
          {/* 🔹 REMOVED disabled, ADDED onChange */}
          <InputField
            value={inflationRate}
            onChange={onChangeInflationRate}
            suffix="%"
          />
        </div>
      </div>
    </div>
  )
);