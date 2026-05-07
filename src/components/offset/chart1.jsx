import React, { useMemo } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

export default function Chart({
  savings = 0,
  result = null,
  frequency = "monthly",
}) {
  const currentYearNum = new Date().getFullYear();
  const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
  const freqLabel = frequency === "monthly" ? "mo" : frequency === "fortnightly" ? "fn" : "wk";

  // STRICT MATH OVERRIDE: Loan Term (Offset) = Loan Term (Standard) - Time Saved
  const stdTotalMonths = result ? (result.payoffYearsStandard * 12) + result.payoffMonthsStandard : 0;
  const savedTotalMonths = result ? (result.yearsSaved * 12) + result.monthsSaved : 0;
  const offsetTotalMonths = Math.max(0, stdTotalMonths - savedTotalMonths);

  // Round off to nearest year for display ONLY
  const roundedOffsetYears = Math.round(offsetTotalMonths / 12);

  const offsetTermText = result
    ? `${roundedOffsetYears} Year${roundedOffsetYears !== 1 ? "s" : ""}`
    : "—";

  // The true starting year of the schedule
  const startYearRaw = (result && result.unifiedSchedule && result.unifiedSchedule.length > 0)
    ? Number(result.unifiedSchedule[0].year)
    : currentYearNum;

  // Float calculations to ensure the graph drops mathematically perfectly (ignores the rounding above)
  const stdTermYearsFloat = stdTotalMonths / 12;
  const offsetTermYearsFloat = offsetTotalMonths / 12;
  const exactDropYear = startYearRaw + offsetTermYearsFloat;
  const offsetEndYear = exactDropYear;

  const COMPRESS_RATIO = 1;

  const unwarpYear = (warpedYear) => {
    if (warpedYear <= offsetEndYear) return warpedYear;
    return offsetEndYear + (warpedYear - offsetEndYear) / COMPRESS_RATIO;
  };

  // UPDATE: Generate a proper amortization curve for the blue line
  const displayData = useMemo(() => {
    const warpDisplayYear = (realYear) => {
      if (realYear <= offsetEndYear) return realYear;
      return offsetEndYear + (realYear - offsetEndYear) * COMPRESS_RATIO;
    };

    const getDisplayStdBalanceAtYear = (targetYear) => {
      if (!result || !result.unifiedSchedule || result.unifiedSchedule.length === 0) return 0;
      const schedule = result.unifiedSchedule;
      if (targetYear <= schedule[0].year) return schedule[0].standard;
      if (targetYear >= schedule[schedule.length - 1].year) return 0;

      for (let i = 0; i < schedule.length - 1; i++) {
        const curr = schedule[i];
        const next = schedule[i + 1];
        if (targetYear >= curr.year && targetYear <= next.year) {
          const ratio = (targetYear - curr.year) / (next.year - curr.year);
          return curr.standard - ratio * (curr.standard - next.standard);
        }
      }

      return 0;
    };

    if (!result || !result.unifiedSchedule || !result.unifiedSchedule.length) {
      return [
        { warpedYear: currentYearNum, originalYear: currentYearNum, standard: 0, offset: 0 },
        { warpedYear: warpDisplayYear(currentYearNum + 30), originalYear: currentYearNum + 30, standard: 0, offset: 0 },
      ];
    }

    // Generate a high-density set of years to ensure the curve is perfectly smooth (no straight triangles)
    const yearSet = new Set(result.unifiedSchedule.map(r => Number(r.year)));
    yearSet.add(exactDropYear);

    // Inject intermediate half-year points to force a smooth curve
    for (let y = Math.floor(startYearRaw); y <= exactDropYear; y += 0.5) {
      if (y >= startYearRaw) yearSet.add(y);
    }

    const sortedYears = Array.from(yearSet).sort((a, b) => a - b);

    const data = sortedYears.map(y => {
      const std = getDisplayStdBalanceAtYear(y);
      let off = null;

      if (y < exactDropYear) {
        if (offsetTermYearsFloat > 0) {
          // Map the elapsed offset time directly onto the proper standard amortization curve shape
          const elapsed = y - startYearRaw;
          const progress = elapsed / offsetTermYearsFloat;
          const equivalentStdYear = startYearRaw + (progress * stdTermYearsFloat);
          off = getDisplayStdBalanceAtYear(equivalentStdYear);
        } else {
          off = 0;
        }
      } else if (y === exactDropYear) {
        // Drop exactly to zero here
        off = 0;
      }
      // If y > exactDropYear, 'off' stays null which completely stops the blue line from drawing a flat tail.

      return {
        warpedYear: warpDisplayYear(y),
        originalYear: y,
        standard: std,
        offset: off
      };
    });

    return data;
  }, [result, exactDropYear, startYearRaw, offsetTermYearsFloat, stdTermYearsFloat, currentYearNum, offsetEndYear]);

  const hasData = !!(result && result.repayment != null && displayData.length > 0);

  const todayX = hasData ? displayData[0].warpedYear : currentYearNum;
  const todayY = hasData ? displayData[0].standard : 0;

  const xTicks = useMemo(() => {
    if (!displayData.length) return [];

    const first = Math.max(currentYearNum, Math.floor(displayData[0].originalYear));
    const last = Math.ceil(displayData[displayData.length - 1].originalYear);
    const span = last - first;

    if (span <= 0) {
      return [first <= offsetEndYear ? first : offsetEndYear + (first - offsetEndYear) * COMPRESS_RATIO];
    }

    const numTicks = 6;
    const interval = span / (numTicks - 1);
    const ticks = [];

    for (let i = 0; i < numTicks; i++) {
      let tickYear = Math.round(first + (i * interval));
      if (i === numTicks - 1) {
        tickYear = last;
      }
      ticks.push(tickYear);
    }

    return Array.from(new Set(ticks))
      .sort((a, b) => a - b)
      .map((tickYear) => (
        tickYear <= offsetEndYear ? tickYear : offsetEndYear + (tickYear - offsetEndYear) * COMPRESS_RATIO
      ));
  }, [displayData, currentYearNum, offsetEndYear]);

  const fmt = (n) =>
    n != null
      ? "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";

  // Rounded to show only years
  const timeSavedText = result
    ? (() => {
      const periodsSaved = Math.max(0, result.numberOfRepaymentsStandard - result.numberOfRepaymentsOffset);
      const totalYearsSavedRounded = Math.round(periodsSaved / periodsPerYear);
      return periodsSaved > 0
        ? `${totalYearsSavedRounded} Year${totalYearsSavedRounded !== 1 ? "s" : ""}`
        : "—";
    })()
    : "—";

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatXTick = (val) => {
    const num = unwarpYear(Number(val));
    if (isNaN(num)) return String(val);
    const yr = Math.floor(num);
    const fraction = num - yr;
    if (fraction <= 0.01) return String(yr);
    const mIdx = Math.min(Math.max(Math.floor(fraction * 12), 0), 11);
    return `${MONTH_NAMES[mIdx]} '${String(yr).slice(-2)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10,
        padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: "#1E293B", marginBottom: 6, marginTop: 0 }}>{formatXTick(label)}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: p.dataKey === "standard" ? "#AFAFAF" : "#4A72FF",
              display: "inline-block", flexShrink: 0,
            }} />
            <span style={{ color: "#64748B" }}>{p.dataKey === "standard" ? "Standard Loan" : "Offset Loan"}:</span>
            <span style={{ fontWeight: 600, color: "#1E293B" }}>${Math.round(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const SummaryRow = ({ label, value }) => (
    <div style={{
      display: "flex", flexWrap: "wrap", justifyContent: "space-between",
      alignItems: "center", gap: "8px", marginBottom: "16px", width: "100%", boxSizing: "border-box"
    }}>
      <span style={{
        fontSize: "14px", color: "#FFFFFF", fontWeight: 400, flex: "1 1 120px", boxSizing: "border-box"
      }}>
        {label}
      </span>
      <div style={{
        background: "#FFFFFF", color: "#0B2146", padding: "6px 12px", borderRadius: "4px",
        fontSize: "14px", fontWeight: "600", textAlign: "right", flex: "1 1 140px",
        maxWidth: "100%", boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ minHeight: "100%" }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "#F8F8F8", borderRadius: 16, padding: "24px", gap: 24,
      }}>
        <div style={{
          background: "#0B2146", borderRadius: "12px", padding: "20px",
          display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box", overflow: "hidden"
        }}>
          <SummaryRow label={`Regular Repayment (per ${freqLabel})`} value={hasData ? fmt(result.repayment) : "—"} />
          <SummaryRow label="Total Repaid (Standard)" value={hasData ? fmt(result.totalRepaidStandard) : "—"} />
          <SummaryRow label="Total Interest (Standard)" value={hasData ? fmt(result.totalInterestStandard) : "—"} />
          <SummaryRow label="Loan Term (Standard)" value={hasData ? `${result.payoffYearsStandard} Years` : "—"} />
          <SummaryRow label="Total Repaid (Offset)" value={hasData ? fmt(result.totalRepaidOffset) : "—"} />
          <SummaryRow label="Total Interest (Offset)" value={hasData ? fmt(result.totalInterestOffset) : "—"} />

          <SummaryRow label="Loan Term (Offset)" value={hasData ? offsetTermText : "—"} />

          <SummaryRow label="Interest Saved" value={hasData ? fmt(result.interestSaved || savings) : "—"} />
          <SummaryRow label="Time Saved" value={hasData ? timeSavedText : "—"} />
          <SummaryRow label="Effective Balance for Interest" value={hasData ? fmt(result.currentEffectiveBalance) : "—"} />
          <SummaryRow label="Current Interest Saving (per period)" value={hasData ? fmt(result.currentInterestSaving) : "—"} />
        </div>

        <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #E8EDF2", padding: "24px 16px 16px", display: "flex", flexDirection: "column", minHeight: 180, width: "100%" }}>
          <div style={{ flex: 1, position: "relative", minHeight: 180, width: "100%" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayData} margin={{ top: 10, right: 0, left: -10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="standardGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C4C4C4" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#C4C4C4" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="offsetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A72FF" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#4A72FF" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

                  <XAxis
                    dataKey="warpedYear"
                    type="number"
                    scale="linear"
                    domain={["dataMin", "dataMax"]}
                    ticks={xTicks}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                    dy={16}
                    tickFormatter={(v) => Math.floor(unwarpYear(v)).toString()}
                  />

                  <YAxis
                    width={55}
                    domain={[0, 'dataMax']}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v === 0 ? "$0" : v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="standard"
                    stroke="#AFAFAF"
                    strokeWidth={2}
                    fill="url(#standardGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#AFAFAF" }}
                    isAnimationActive
                    animationDuration={900}
                  />

                  <Area
                    type="monotone"
                    dataKey="offset"
                    stroke="#4A72FF"
                    strokeWidth={hasData ? 2 : 0}
                    fill={hasData ? "url(#offsetGrad)" : "none"}
                    dot={false}
                    activeDot={hasData ? { r: 4, fill: "#4A72FF" } : false}
                    isAnimationActive
                    animationDuration={900}
                    animationBegin={150}
                  />

                  {hasData && (
                    <>
                      <ReferenceLine x={todayX} stroke="#EF4444" strokeWidth={1.5} />
                      <ReferenceDot
                        x={todayX}
                        y={todayY}
                        r={5}
                        fill="#fff"
                        stroke="#EF4444"
                        strokeWidth={2}
                        label={{ position: "top", value: "Today", fill: "#EF4444", fontSize: 12, fontWeight: 600, offset: 10 }}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "16px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, background: "#4A72FF", borderRadius: "50%" }} />
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Projected with Offset</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, background: "#C4C4C4", borderRadius: "50%" }} />
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Projected Standard Loan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
