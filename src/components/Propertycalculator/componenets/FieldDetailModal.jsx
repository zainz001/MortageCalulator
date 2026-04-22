import React from "react";

/**
 * FieldDetailModal
 *
 * Generic shell used by every field-level detail popup.
 * You never edit this file — just pass children into it.
 *
 * Props:
 *   isOpen  — boolean, controls visibility
 *   onClose — called on Cancel or backdrop click
 *   onSave  — called on OK
 *   title   — string shown in the modal header
 *   width   — optional, e.g. "560px" (default "480px")
 *   children — the popup body (your per-field component)
 */
export default function FieldDetailModal({
  isOpen,
  onClose,
  onSave,
  title,
  width = "480px",
  children,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden shadow-lg"
        style={{ width, maxWidth: "95vw" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#E2E8F0]">
          <h3 className="text-[15px] font-bold text-[#23303B]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#23303B] text-xl px-1 leading-none"
          >
            ×
          </button>
        </div>

        {/* Body — provided by the per-field popup component */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end px-5 py-3 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] border border-[#E2E8F0] rounded-[8px] text-[#64748B] hover:bg-[#F8F8F8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-[13px] bg-[#0052CC] text-white rounded-[8px] font-medium hover:bg-[#003fa3] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}