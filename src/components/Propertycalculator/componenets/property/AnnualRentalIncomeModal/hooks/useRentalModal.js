import { useState, useEffect, useRef, useCallback } from "react";
import { TOTAL_YEARS, MAX_START_INDEX } from "../../../../../../constants/expenseConfig";
import { sanitizeInput, isValidNumberInput } from "../../../../../../utils/calculatorUtils";

export const useRentalModal = ({
  isOpen,
  actualAnnualRent,
  inflationRate, // prop fallback
  rentTimeline,
  onClose,
  setRentTimeline,
  savedInflationStartYear,
  savedUseInflation,
  savedInflationRate, // 🔹 NEW
  onSettingsChange,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [useInflation, setUseInflation] = useState(savedUseInflation ?? true);
  const [inflationStartYear, setInflationStartYear] = useState(savedInflationStartYear ?? "1");
  const [localInflationRate, setLocalInflationRate] = useState(savedInflationRate ?? inflationRate ?? "3.00"); // 🔹 NEW
  const [localProjections, setLocalProjections] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(null);

  const initializedRef = useRef(false);
  const skipSettingsEffect = useRef(true);

  // Initialize once when modal opens
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      skipSettingsEffect.current = true;
      return;
    }
    if (initializedRef.current) return;

    const baseRent = parseFloat(actualAnnualRent) || 0;

    if (rentTimeline?.length > 0) {
      setLocalProjections([...rentTimeline]);
    } else {
      setLocalProjections(
        generateProjections({
          baseRent,
          inflationRate: localInflationRate,
          inflationStartYear,
          useInflation,
        })
      );
    }

    setStartIndex(0);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Recalculate when projection settings change
  useEffect(() => {
    if (!isOpen || !initializedRef.current) return;
    if (skipSettingsEffect.current) {
      skipSettingsEffect.current = false;
      return;
    }

    const baseRent = parseFloat(actualAnnualRent) || 0;
    setLocalProjections(
      generateProjections({
        baseRent,
        inflationRate: localInflationRate, // 🔹 use local state
        inflationStartYear,
        useInflation,
      })
    );
  }, [isOpen, useInflation, inflationStartYear, localInflationRate, actualAnnualRent]); // 🔹 added localInflationRate

  const handleInputChange = useCallback((idx, val) => {
    const raw = sanitizeInput(val);
    if (!isValidNumberInput(raw)) return;

    setLocalProjections((prev) => {
      const updated = [...prev];
      updated[startIndex + idx] = raw;
      return updated;
    });
  }, [startIndex]);

  const handleOk = useCallback(() => {
    setRentTimeline(localProjections);
    onSettingsChange?.({
      inflationStartYear,
      useInflation,
      inflationRate: localInflationRate, // 🔹 persist rate too
    });
    onClose();
  }, [localProjections, setRentTimeline, onClose, inflationStartYear, useInflation, localInflationRate, onSettingsChange]);

  const pagination = {
    startIndex,
    goToStart: () => setStartIndex(0),
    goToEnd: () => setStartIndex(MAX_START_INDEX),
    goPrev: () => setStartIndex((p) => Math.max(0, p - 1)),
    goNext: () => setStartIndex((p) => Math.min(MAX_START_INDEX, p + 1)),
  };

  return {
    localProjections,
    focusedIdx,
    setFocusedIdx,
    useInflation,
    setUseInflation,
    inflationStartYear,
    setInflationStartYear,
    localInflationRate,      // 🔹 expose
    setLocalInflationRate,   // 🔹 expose
    handleInputChange,
    handleOk,
    pagination,
  };
};

function generateProjections({
  baseRent,
  inflationRate,
  inflationStartYear,
  useInflation,
}) {
  const rate = parseFloat(inflationRate) || 0;
  const startYear = parseInt(inflationStartYear) || 1;

  return Array.from({ length: TOTAL_YEARS }, (_, i) => {
    const year = i + 1;
    if (!useInflation || year < startYear) {
      return Math.round(baseRent).toString();
    }
    const projected = baseRent * Math.pow(1 + rate / 100, year - startYear);
    return Math.round(projected).toString();
  });
}