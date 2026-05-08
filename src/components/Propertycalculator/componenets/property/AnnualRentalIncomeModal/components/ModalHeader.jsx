import { memo } from "react";

export const ModalHeader = memo(({ title, onClose }) => (
  <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
    <h2 className="text-[14px] font-bold text-[#1E293B]">{title}</h2>
    <button
      onClick={onClose}
      className="text-[#64748B] hover:text-[#0F172A] text-[18px]"
      aria-label="Close"
    >
      &times;
    </button>
  </div>
));