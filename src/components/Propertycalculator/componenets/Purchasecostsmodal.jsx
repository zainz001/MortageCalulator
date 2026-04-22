import React from "react";
import FieldDetailModal from "./FieldDetailModal";
import {
  ModalRow,
  ModalDivider,
  ModalSectionLabel,
  ModalTotal,
  ModalInfoBox,
} from "./ModalPrimitives";

/**
 * PurchaseCostsModal
 *
 * Detail popup for the "Purchase costs" field.
 *
 * Props:
 *   isOpen              boolean
 *   onClose             () => void
 *   propertyValue       string  (read-only reference)
 *   purchaseCosts       string  (the parent field value — kept in sync)
 *   setPurchaseCosts    (val: string) => void
 *
 * Internal sub-fields (local state — written back to purchaseCosts on change):
 *   The total of all sub-fields is kept as the canonical purchaseCosts value.
 */
export default function PurchaseCostsModal({
  isOpen,
  onClose,
  propertyValue,
  purchaseCosts,
  setPurchaseCosts,
}) {
  // Split purchaseCosts into sub-fields with local state.
  // On any sub-field change we write the new total back to setPurchaseCosts.
  const [transferOfTitle, setTransferOfTitle] = React.useState("90");
  const [conveyancing,    setConveyancing]    = React.useState("3750");
  const [otherCosts,      setOtherCosts]      = React.useState("0");

  const total = (+transferOfTitle || 0) + (+conveyancing || 0) + (+otherCosts || 0);

  // Keep parent state in sync whenever sub-fields change
  React.useEffect(() => {
    setPurchaseCosts(String(total));
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmtNZD = (v) => "$" + Math.round(v).toLocaleString("en-NZ");

  return (
    <FieldDetailModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onClose}
      title="Purchase costs"
    >
      <ModalSectionLabel>Reference</ModalSectionLabel>

      <ModalRow
        label="Purchase price"
        prefix="$"
        value={(+propertyValue || 0).toLocaleString("en-NZ")}
        readOnly
      />

      <ModalDivider />
      <ModalSectionLabel>Cost breakdown</ModalSectionLabel>

      <ModalRow
        label="Transfer of title"
        prefix="$"
        value={transferOfTitle}
        onChange={setTransferOfTitle}
      />
      <ModalRow
        label="Conveyancing costs"
        prefix="$"
        value={conveyancing}
        onChange={setConveyancing}
      />
      <ModalRow
        label="Other costs"
        prefix="$"
        value={otherCosts}
        onChange={setOtherCosts}
      />

      <ModalTotal label="Total purchase costs" value={fmtNZD(total)} />

      <ModalInfoBox variant="info">
        NZ residential property has no stamp duty. Leave conveyancing at the
        default or enter your solicitor's quote. Total is written back to the
        Purchase costs field automatically.
      </ModalInfoBox>
    </FieldDetailModal>
  );
}