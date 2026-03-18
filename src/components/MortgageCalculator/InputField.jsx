import React, { useState } from "react";

const InputField = ({
  label,
  prefix,
  placeholder,
  value,
  onChange,
  type = "text",
  min,
  step,
  error,
  disabled = false,
  tooltip = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">
        {label}
      </label>

      <div
        className="relative"
        onMouseEnter={() => disabled && tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          className={`flex items-center w-full h-[48px] bg-white border rounded-[8px] overflow-hidden transition-all
            ${disabled
              ? "border-[#E2E8F0] bg-[#F1F5F9] cursor-not-allowed opacity-60"
              : error
                ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                : "border-[#E2E8F0] focus-within:border-[#0052CC] focus-within:ring-1 focus-within:ring-[#0052CC]"
            }`}
        >
          {prefix && (
            <div className={`flex items-center justify-center h-full px-4 border-r border-[#E2E8F0] ${disabled ? "bg-[#E9EEF4]" : "bg-white"}`}>
              <span className="text-[#23303B] font-bold text-[15px]">
                {prefix}
              </span>
            </div>
          )}

          {/* ✅ Native input logic completely unchanged */}
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            min={min}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              if (disabled) return;
              let raw = e.target.value;

              if (type === "text") {
                raw = raw.replace(/,/g, "");
                if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
                  onChange && onChange(raw);
                }
              } else {
                // For number inputs, round to nearest integer before passing up
                if (raw === "") {
                  onChange && onChange("");
                } else {
                  const rounded = String(Math.round(parseFloat(raw)));
                  onChange && onChange(rounded);
                }
              }
            }}
            className={`flex-1 w-full h-full px-4 text-[#23303B] text-[15px] outline-none bg-transparent placeholder-[#A1A8B2]
              ${disabled ? "cursor-not-allowed text-[#94A3B8]" : ""}`}
          />
        </div>

        {/* Tooltip */}
        {showTooltip && tooltip && (
          <div
            style={{ width: "280px" }}
            className="absolute bottom-[calc(100%+6px)] left-0 z-50 bg-[#23303B] text-white text-[12px] rounded-[6px] px-3 py-2 shadow-lg leading-relaxed"
          >
            {tooltip}
            <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#23303B]" />
          </div>
        )}
      </div>

      {error && !disabled && (
        <span className="text-red-500 text-[12px] font-medium">{error}</span>
      )}
    </div>
  );
};

export default InputField;