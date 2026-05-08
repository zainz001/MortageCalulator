// ModalFooter.jsx — buttons are cheap, callbacks are stable via useCallback
export function ModalFooter({ pagination, onOk, onCancel }) {
  return (
    <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row justify-between items-center gap-4 rounded-b-[8px] shrink-0">
      <HelpButton />
      <PaginationControls {...pagination} />
      <ActionButtons onOk={onOk} onCancel={onCancel} />
    </div>
  );
}

function HelpButton() {
  return (
    <button className="hidden sm:block px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">
      ?
    </button>
  );
}

function PaginationControls({ goToStart, goPrev, goNext, goToEnd }) {
  return (
    <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
      <PaginationButton onClick={goToStart}>{"<<"}</PaginationButton>
      <PaginationButton onClick={goPrev}>{"<"}</PaginationButton>
      <PaginationButton onClick={goNext}>{">"}</PaginationButton>
      <PaginationButton onClick={goToEnd}>{">>"}</PaginationButton>
    </div>
  );
}

function PaginationButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm"
    >
      {children}
    </button>
  );
}

function ActionButtons({ onOk, onCancel }) {
  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        onClick={onOk}
        className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] transition-colors shadow-sm"
      >
        OK
      </button>
      <button
        onClick={onCancel}
        className="flex-1 sm:flex-none px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-medium"
      >
        Cancel
      </button>
    </div>
  );
}