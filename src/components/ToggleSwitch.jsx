import React from "react";

/**
 * ToggleSwitch
 *
 * Spec ref: PIA Functional Spec §3.5, §7.1, §7.5
 * Used for:
 *   - "New build" toggle → locks interest deductibility to 100% (§7.1)
 *   - "Ring-fencing applies (losses carried forward)" toggle (§7.5)
 *
 * Spec notes:
 *   - New build toggle: when ON, must lock deductibility dropdown to 100%
 *     and disable it. Handle this side-effect in the parent via onChange.
 *   - Ring-fencing toggle: when ON, tax credit = 0 for all years in loss
 *     position; show accumulated loss carried forward instead.
 *   - Tooltip (ⓘ) is RECOMMENDED for tax-sensitive toggles per §8.5.
 *
 * This is a CONTROLLED component — no internal state.
 * The parent owns `checked` and must pass `onChange`.
 *
 * Props:
 *   label    {string}              required — Display label to the left of the toggle
 *   checked  {boolean}             required — Controlled on/off value
 *   onChange {(val: boolean)=>void} required — Called with new boolean on click
 *   tooltip  {string}              optional — Hover text shown via ⓘ glyph
 *   disabled {boolean}             optional — Prevents interaction (e.g. when New Build
 *                                             locks the deductibility dropdown to 100%)
 */
export default function ToggleSwitch({ label, checked, onChange, tooltip, disabled = false }) {
  const handleToggle = () => {
    if (!disabled) onChange(!checked);
  };

  // Generate a stable id for label–input association (WCAG §8.5)
  const id = `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="flex justify-between items-center py-2">
      {/* Label + optional tooltip */}
      <label
        htmlFor={id}
        className={`text-[14px] font-medium flex items-center gap-2 select-none ${
          disabled ? "text-[#A1A8B2] cursor-not-allowed" : "text-[#64748B] cursor-pointer"
        }`}
      >
        {label}

        {tooltip && (
          <span
            role="img"
            aria-label={`Info: ${tooltip}`}
            title={tooltip}
            className="text-[#A1A8B2] text-[12px] cursor-help leading-none"
          >
            ⓘ
          </span>
        )}
      </label>

      {/* Toggle button — ARIA switch role (WCAG §8.5) */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-[24px] w-[44px] shrink-0 rounded-full
          border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-[#0052CC]
          ${disabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer"
          }
          ${checked ? "bg-[#34A853]" : "bg-[#E2E8F0]"}
        `}
      >
        {/* Thumb */}
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-[20px] w-[20px]
            transform rounded-full bg-white shadow-md ring-0
            transition duration-200 ease-in-out
            ${checked ? "translate-x-[20px]" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}