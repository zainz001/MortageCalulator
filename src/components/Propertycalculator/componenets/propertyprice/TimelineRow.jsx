import React, { useState } from "react";

export default function TimelineRow({
  label,
  baseValue,
  onBaseChange,
  timelineValues = [],
  onTimelineChange,
  startIndex = 0,
  isReadOnly = false,
  isBaseOnly = false,
  prefix = "",
}) {
  const [focusedBase, setFocusedBase] = useState(false);
  const [focusedTimelineIdx, setFocusedTimelineIdx] = useState(null);

  const formatVal = (raw) => {
    if (raw === "" || raw === undefined || raw === null) return "";
    const num = parseFloat(raw);
    if (isNaN(num)) return raw;
    const parts = String(raw).split(".");
    const intFormatted = Math.abs(Math.trunc(num)).toLocaleString("en-NZ");
    const sign = num < 0 ? "-" : "";
    return parts.length > 1 ? `${sign}${intFormatted}.${parts[1]}` : `${sign}${intFormatted}`;
  };

  const handleBaseChange = (e) => {
    if (isReadOnly || !onBaseChange) return;
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
      onBaseChange(raw);
    }
  };

  const handleTimelineUpdate = (idx, val) => {
    if (isReadOnly || !onTimelineChange) return;
    const raw = val.replace(/,/g, "");
    if (raw !== "" && !/^-?\d*\.?\d*$/.test(raw)) return;

    // Dynamically expand array if user scrolls infinitely into the future
    let newArr = [...timelineValues];
    while (newArr.length <= startIndex + idx) {
      newArr.push("0");
    }

    newArr[startIndex + idx] = raw;
    onTimelineChange(newArr);
  };

 const displayBaseValue = focusedBase ? baseValue : formatVal(baseValue);

  return (
    <div className="flex items-center mb-2 w-full">
      {/* Label */}
      <div className="w-[130px] text-right pr-4 text-[13px] text-[#64748B] font-bold flex-shrink-0">
        {label}:
      </div>

      {/* Base Input (Time 0) */}
      <div className="w-[100px] flex-shrink-0">
        {baseValue !== undefined && (
          <input
            type="text"
            inputMode="decimal"
            value={isReadOnly && !focusedBase ? `${prefix}${formatVal(baseValue)}` : displayBaseValue || ""}
            onChange={handleBaseChange}
            onFocus={() => setFocusedBase(true)}
            onBlur={() => setFocusedBase(false)}
            readOnly={isReadOnly}
            className={`w-full border rounded-[4px] px-2 py-1.5 text-[13px] text-right transition-colors focus:outline-none ${
              isReadOnly
                ? "bg-transparent border-transparent text-[#1E293B] font-bold"
                : "border-[#CBD5E1] text-[#1E293B] focus:border-[#0052CC] bg-white shadow-sm"
            }`}
          />
        )}
      </div>

      {/* Timeline Grid (Sliding Window) */}
      <div className="flex-1 flex gap-2 ml-4">
        {[0, 1, 2, 3, 4].map(idx => {
          if (isBaseOnly) return <div key={idx} className="flex-1"></div>;

          const rawVal = timelineValues[startIndex + idx] || (isReadOnly ? 0 : "");
          const isFocused = focusedTimelineIdx === idx;

          // Format large numbers with "m" perfectly matching the old software for ReadOnly
          let displayVal = rawVal;
          if (isReadOnly) {
            const num = Number(rawVal) || 0;
            if (num >= 1000000) {
              displayVal = `${prefix}${(num / 1000000).toFixed(3)}m`;
            } else {
              displayVal = `${prefix}${formatVal(rawVal)}`;
            }
          } else {
            displayVal = isFocused ? rawVal : formatVal(rawVal);
          }

          return (
            <div key={idx} className="flex-1">
              <input
                type="text"
                inputMode="decimal"
                value={displayVal || ""}
                onChange={(e) => handleTimelineUpdate(idx, e.target.value)}
                onFocus={() => setFocusedTimelineIdx(idx)}
                onBlur={() => setFocusedTimelineIdx(null)}
                readOnly={isReadOnly}
                className={`w-full border rounded-[4px] px-1 py-1.5 text-[13px] text-center transition-colors focus:outline-none ${
                  isReadOnly
                    ? "bg-transparent border-transparent text-[#1E293B] font-medium"
                    : "border-[#CBD5E1] text-[#1E293B] focus:border-[#0052CC] bg-white shadow-sm"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
