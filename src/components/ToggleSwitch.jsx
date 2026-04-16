import React from "react";

export default function ToggleSwitch({ label, checked, onChange, tooltip }) {
  return (
    <div className="flex justify-between items-center py-2">
      <label className="text-[14px] text-[#64748B] font-medium flex items-center gap-2">
        {label}
        {tooltip && <span className="text-[#A1A8B2] text-[12px] cursor-help" title={tooltip}>ⓘ</span>}
      </label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${
          checked ? 'bg-[#34A853]' : 'bg-[#E2E8F0]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}