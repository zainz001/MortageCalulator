import React from "react";

export default function FieldWithDetail({ label, onOpen, children }) {
  return (
    <div className="flex items-center gap-2">
      {children}
      <button
        type="button"
        onClick={onOpen}
        className="text-[11px] px-1.5 py-0.5 border border-[#CBD5E1] rounded text-[#64748B]
                   hover:border-[#94A3B8] hover:text-[#23303B] hover:bg-[#F8F8F8] transition-all whitespace-nowrap"
        title={`Edit ${label} details`}
      >
        Edit ↗
      </button>
    </div>
  );
}