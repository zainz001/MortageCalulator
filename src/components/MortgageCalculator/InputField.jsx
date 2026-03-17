import React from "react";

const InputField = ({
  label,
  prefix,
  placeholder,
  value,
  onChange,
  type = "text",
  min,
  step
}) => {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[13px] md:text-[14px] text-[#64748B] font-medium">
        {label}
      </label>

      <div className="flex items-center w-full h-[48px] bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden focus-within:border-[#0052CC] focus-within:ring-1 focus-within:ring-[#0052CC] transition-all">
        {prefix && (
          <div className="flex items-center justify-center h-full px-4 border-r border-[#E2E8F0] bg-white">
            <span className="text-[#23303B] font-bold text-[15px]">
              {prefix}
            </span>
          </div>
        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          min={min}
          step={step}
          onChange={(e) => {
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
          className="flex-1 w-full h-full px-4 text-[#23303B] text-[15px] outline-none bg-transparent placeholder-[#A1A8B2]"
        />
      </div>
    </div>
  );
};

export default InputField;