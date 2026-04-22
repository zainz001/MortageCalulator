import React from "react";

/**
 * SelectField
 *
 * Spec ref: PIA Functional Spec §3.5, §7.1
 *
 * §7.1: The 'New build' toggle must lock the interest deductibility dropdown
 *       to 100% and DISABLE it. The `disabled` prop enables this.
 * §8.5: Visible labels and ARIA attributes required (WCAG 2.1 AA).
 *
 * Props:
 *   label    {string}              required
 *   value    {string}              required
 *   onChange {(val:string)=>void}  required
 *   options  {Array<{label,value}>} required
 *   disabled {boolean}             optional — Prevents interaction (e.g. deductibility when new build ON)
 *   tooltip  {string}              optional — ⓘ hint text
 */
export default function SelectField({ label, value, onChange, options, disabled = false, tooltip }) {
  const id = `select-${label.replace(/[\s()*/?.]+/g, "-").toLowerCase()}`;

  return (
    <div className="flex flex-col gap-[6px]">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className={`text-[13px] font-medium ${
            disabled ? "text-[#A1A8B2]" : "text-[#64748B]"
          }`}
        >
          {label}
        </label>
        {tooltip && (
          <span
            role="img"
            aria-label={`Info: ${tooltip}`}
            title={tooltip}
            className="text-[#A1A8B2] text-[12px] cursor-help leading-none select-none"
          >
            ⓘ
          </span>
        )}
      </div>

      <div className="relative h-[48px]">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-full px-4 pr-10 border rounded-[8px] text-[15px]
            appearance-none outline-none transition-all
            focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]
            ${disabled
              ? "bg-[#F8FAFC] border-[#E2E8F0] text-[#A1A8B2] cursor-not-allowed opacity-60"
              : "bg-white border-[#E2E8F0] text-[#1E293B] hover:border-[#94A3B8] cursor-pointer"
            }
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron — hidden when disabled to signal locked state */}
        <div
          aria-hidden="true"
          className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity ${
            disabled ? "opacity-30" : "opacity-100"
          }`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}