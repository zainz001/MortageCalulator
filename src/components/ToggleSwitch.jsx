import React from "react";

export default function ToggleSwitch({ label, checked, onChange, tooltip, disabled = false }) {
  const handleToggle = () => {
    if (!disabled) onChange(!checked);
  };


  const id = `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="flex justify-between items-center py-2">
     
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