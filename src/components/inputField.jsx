import React, { useState } from "react";

const InputField = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  error,
  tooltip,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 1. Formatting logic (NOW COMMA-PROOF)
  const formatDisplay = (raw) => {
    if (raw === "" || raw === undefined || raw === null) return "";
    
    // Strip commas before parsing to prevent the NaN / truncation bug
    const cleanRaw = String(raw).replace(/,/g, "");
    const num = parseFloat(cleanRaw);
    
    if (isNaN(num)) return raw;
    
    const parts = String(cleanRaw).split(".");
    const intFormatted = Math.abs(Math.trunc(num)).toLocaleString("en-NZ");
    const sign = num < 0 ? "-" : "";
    return parts.length > 1
      ? `${sign}${intFormatted}.${parts[1]}`
      : `${sign}${intFormatted}`;
  };

  const displayValue = isFocused ? (value === 0 ? "0" : value || "") : formatDisplay(value);

  // 3. Handle typing
  const handleChange = (e) => {
    if (disabled) return;
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  };

  const safeLabel = label || "input";
  const id      = `field-${safeLabel.replace(/[\s()*/?.]+/g, "-").toLowerCase()}`;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  const borderClass = hasError
    ? "border-[#EF4444] focus-within:ring-1 focus-within:ring-[#EF4444]"
    : isFocused
    ? "border-[#0052CC] ring-1 ring-[#0052CC]"
    : "border-[#E2E8F0] hover:border-[#94A3B8]";

  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <div className="flex items-center gap-1.5">
          <label
            htmlFor={id}
            className={`text-[13px] font-medium leading-snug ${
              disabled ? "text-[#A1A8B2]" : "text-[#64748B]"
            }`}
          >
            {label}
          </label>

          {tooltip && (
            <span
              className="relative flex-shrink-0"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <span
                aria-label={`Info: ${tooltip}`}
                role="img"
                className="text-[#A1A8B2] text-[12px] cursor-help leading-none select-none"
              >
                ⓘ
              </span>
              {showTooltip && (
                <div className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-[260px] bg-[#23303B] text-white text-[12px] rounded-[6px] px-3 py-2 shadow-lg leading-relaxed pointer-events-none">
                  {tooltip}
                  <div className="absolute top-full left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#23303B]" />
                </div>
              )}
            </span>
          )}
        </div>
      )}

      <div
        className={`flex items-center h-[48px] bg-white border rounded-[8px] overflow-hidden transition-all ${borderClass} ${
          disabled ? "bg-[#F8FAFC] opacity-60" : ""
        }`}
      >
        {prefix && (
          <div
            aria-hidden="true"
            className={`flex items-center justify-center h-full px-4 border-r border-[#E2E8F0] select-none text-[15px] font-bold flex-shrink-0 ${
              disabled ? "bg-[#E9EEF4] text-[#CBD5E1]" : "bg-white text-[#23303B]"
            }`}
          >
            {prefix}
          </div>
        )}

        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          placeholder={placeholder ?? ""}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          className={`flex-1 h-full bg-transparent text-[15px] focus:outline-none placeholder-[#A1A8B2] ${
            prefix ? "pl-3" : "pl-4"
          } ${suffix ? "pr-2" : "pr-4"} ${
            disabled ? "text-[#94A3B8] cursor-not-allowed" : "text-[#23303B]"
          }`}
        />

        {suffix && (
          <div
            aria-hidden="true"
            className={`flex items-center h-full pr-4 pl-1 select-none text-[14px] flex-shrink-0 ${
              disabled ? "text-[#CBD5E1]" : "text-[#94A3B8]"
            }`}
          >
            {suffix}
          </div>
        )}
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="text-[12px] text-[#EF4444] leading-snug">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;