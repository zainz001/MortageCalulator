import React, { useState } from "react";

/**
 * CollapsibleSection
 *
 * Spec ref: PIA Functional Spec §8.1 — Input Panel
 * "All inputs grouped into clearly labelled collapsible sections
 *  (Property, Financing, Assumptions, Depreciation, Tax)"
 *
 * Props:
 *   title        {string}    required  — Section heading shown in trigger button
 *   children     {ReactNode} required  — Form fields / controls rendered when expanded
 *   defaultOpen  {boolean}   optional  — Render expanded on first mount (default: false)
 */
export default function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E2E8F0] py-4 last:border-0">
      {/* Trigger button — full-width, accessible */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex justify-between items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC] focus-visible:ring-offset-2 rounded-sm"
      >
        <h3 className="font-bold text-[#1E293B] text-[15px] leading-snug">{title}</h3>

        {/* Chevron icon — rotates on open */}
        <span
          aria-hidden="true"
          className={`text-[#64748B] transition-transform duration-200 ease-in-out flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          {/* Down chevron SVG — scales cleanly at any size */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div
          id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
          role="region"
          aria-label={title}
          className="mt-4 flex flex-col gap-4 animate-fadeIn"
        >
          {children}
        </div>
      )}
    </div>
  );
}