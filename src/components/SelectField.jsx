import React from "react";

export default function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className="text-[14px] text-[#4A5568] font-medium">{label}</label>
      <div className="relative h-[48px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full px-4 bg-white border border-[#E2E8F0] rounded-[8px] outline-none text-[#1E293B] font-medium appearance-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}