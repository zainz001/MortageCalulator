import React, { useState } from "react";

export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E2E8F0] py-4 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <h3 className="font-bold text-[#1E293B] text-[15px]">{title}</h3>
        <span className="text-[#64748B] text-xl font-light transform transition-transform duration-200">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && <div className="mt-4 flex flex-col gap-4 animate-fadeIn">{children}</div>}
    </div>
  );
}