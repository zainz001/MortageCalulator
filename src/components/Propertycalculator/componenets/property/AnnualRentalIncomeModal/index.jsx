import ReactDOM from "react-dom";
import { useRentalModal } from "./hooks/useRentalModal";
import { ModalHeader } from "./components/ModalHeader";
import { RentalIncomeSection } from "./components/RentalIncomeSection";
import { ProjectionSettings } from "./components/ProjectionSettings";
import { ModalFooter } from "./components/ModalFooter";

export default function AnnualRentalIncomeModal({
  isOpen,
  onClose,
  actualAnnualRent,
  inflationRate,
  rentTimeline,
  setRentTimeline,
  savedInflationStartYear,
  savedUseInflation,
  savedInflationRate, // 🔹 NEW
  onSettingsChange,
}) {
  const modal = useRentalModal({
    isOpen,
    actualAnnualRent,
    inflationRate,
    rentTimeline,
    onClose,
    setRentTimeline,
    savedInflationStartYear,
    savedUseInflation,
    savedInflationRate,
    onSettingsChange,
  });

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[600px] max-h-[95vh] flex flex-col border border-[#CBD5E1] overflow-hidden">
        <ModalHeader title="Annual Rental Income" onClose={onClose} />
        
        <div className="p-4 overflow-y-auto overflow-x-auto">
          <RentalIncomeSection
            startIndex={modal.pagination.startIndex}
            projections={modal.localProjections}
            focusedIdx={modal.focusedIdx}
            onFocus={modal.setFocusedIdx}
            onChange={modal.handleInputChange}
          />
          <ProjectionSettings
            useInflation={modal.useInflation}
            onToggleInflation={modal.setUseInflation}
            inflationStartYear={modal.inflationStartYear}
            onChangeStartYear={modal.setInflationStartYear}
            inflationRate={modal.localInflationRate}          // 🔹 local state
            onChangeInflationRate={modal.setLocalInflationRate} // 🔹 local setter
          />
        </div>

        <ModalFooter
          pagination={modal.pagination}
          onOk={modal.handleOk}
          onCancel={onClose}
        />
      </div>
    </div>,
    document.body
  );
}