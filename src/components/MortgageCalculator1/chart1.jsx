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
    chartData = [],
    savings = 0,
    yearsSaved = 0,
    monthsSaved = 0,
    result = null,
    frequency = "monthly",
  }) {
    const currentYearNum = new Date().getFullYear();

    // ==========================================
    // 1. THE TIME WARP LOGIC (Client Requirement)
    // ==========================================
    
    // Find the exact year the offset loan is paid off
    const offsetEndYear = useMemo(() => {
      if (!result || !result.unifiedSchedule) return currentYearNum + 5;
      let lastBlue = Number(result.unifiedSchedule[0].year);
      for (let i = 0; i < result.unifiedSchedule.length; i++) {
        if (result.unifiedSchedule[i].offset > 0.01) {
          lastBlue = Number(result.unifiedSchedule[i].year);
        }
      }
      return lastBlue;
    }, [result, currentYearNum]);

    // Adjust this to be closer to 1.0 to soften the sharp "bend" in the gray line
    const COMPRESS_RATIO =0.55;

    const warpYear = (realYear) => {
      if (realYear <= offsetEndYear) return realYear;
      // Compress everything that happens after the offset is paid off
      return offsetEndYear + (realYear - offsetEndYear) * COMPRESS_RATIO;
    };

    const unwarpYear = (warpedYear) => {
      if (warpedYear <= offsetEndYear) return warpedYear;
      // Reverse the compression for tooltips and labels
      return offsetEndYear + (warpedYear - offsetEndYear) / COMPRESS_RATIO;
    };

    // ==========================================

    // 2. Map data and apply the warp to the X coordinates
    const displayData = useMemo(() => {
      if (!result || !result.unifiedSchedule || !result.unifiedSchedule.length) {
        return [
          { warpedYear: currentYearNum, originalYear: currentYearNum, standard: 0, offset: 0 },
          { warpedYear: warpYear(currentYearNum + 30), originalYear: currentYearNum + 30, standard: 0, offset: 0 },
        ];
      }

      let offsetPaidOff = false;

      return result.unifiedSchedule.map((row) => {
        const y = Number(row.year);
        const std = Number(row.standard);
        let off = Number(row.offset);

        if (!offsetPaidOff && off <= 0.01) {
          offsetPaidOff = true;
          off = 0; 
        } else if (offsetPaidOff) {
          off = null; 
        }

        return { 
          warpedYear: warpYear(y), // Recharts uses this to draw the shape 
          originalYear: y,         // We keep this for reference
          standard: std, 
          offset: off 
        };
      });
    }, [result, currentYearNum, offsetEndYear]);

    const hasData = !!(result && result.repayment != null && displayData.length > 0);

    // Position the "Today" marker exactly at the start of the warped data
    const todayX = hasData ? displayData[0].warpedYear : currentYearNum;
    const todayY = hasData ? displayData[0].standard : 0;

    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
    const freqLabel = frequency === "monthly" ? "mo" : frequency === "fortnightly" ? "fn" : "wk";

    // 3. Generate clean milestones, then warp them so they align with the warped graph
    const xTicks = useMemo(() => {
      if (!displayData.length) return [];
      
      const first = Math.floor(displayData[0].originalYear);
      const last = Math.ceil(displayData[displayData.length - 1].originalYear);
      const span = last - first;

      const interval = span > 15 ? 5 : span > 6 ? 2 : 1; 
      const ticks = [];
      const startTick = Math.ceil(first / interval) * interval;
      
      // Generate REAL years first
      for (let t = startTick; t <= last; t += interval) {
        ticks.push(t);
      }
      if (ticks[0] !== first) ticks.unshift(first);
      if (ticks[ticks.length - 1] !== last) ticks.push(last);

      // Apply the warp to the ticks so they sit exactly under the correct data points
      return Array.from(new Set(ticks)).sort((a, b) => a - b).map(warpYear); 
    }, [displayData, offsetEndYear]);

    const fmt = (n) =>
      n != null
        ? "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : "—";

    const timeSavedText = result
      ? (() => {
          const periodsSaved = Math.max(0, result.numberOfRepaymentsStandard - result.numberOfRepaymentsOffset);
          const totalYearsSaved = Math.round((periodsSaved / periodsPerYear));
          return totalYearsSaved > 0
            ? `${totalYearsSaved} Year${totalYearsSaved !== 1 ? "s" : ""}`
            : "—";
        })()
      : "—";

    // 4. Update formatting to UNWARP the value before showing it to the user
    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const formatXTick = (val) => {
      const num = unwarpYear(Number(val)); // Reverse the math!
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
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <span style={{
          fontSize: "14px",
          color: "#FFFFFF",
          fontWeight: 400,
          flex: "1 1 120px", // Allows the label to shrink or grow
          boxSizing: "border-box"
        }}>
          {label}
        </span>
        <div style={{
          background: "#FFFFFF",
          color: "#0B2146",
          padding: "6px 12px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "600",
          textAlign: "right",
          flex: "1 1 140px", // Allows it to be 140px, but shrink if the screen is tiny
          maxWidth: "100%",  // Ensures it NEVER pushes off the screen
          boxSizing: "border-box",
          whiteSpace: "nowrap", // Keeps the number on one line
          overflow: "hidden",
          textOverflow: "ellipsis" // Adds "..." if the number is somehow insanely long
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
            background: "#0B2146",
            borderRadius: "12px",
            padding: "20px",         // Slightly reduced from 24px to give mobile more breathing room
            display: "flex",
            flexDirection: "column",
            width: "100%",           // Forces it to stay inside the parent
            boxSizing: "border-box", // CRITICAL: Ensures padding doesn't make it wider than 100%
            overflow: "hidden"
          }}>
            <SummaryRow label={`Regular Repayment (per ${freqLabel})`} value={hasData ? fmt(result.repayment) : "—"} />
            <SummaryRow label="Total Repaid (Standard)" value={hasData ? fmt(result.totalRepaidStandard) : "—"} />
            <SummaryRow label="Total Interest (Standard)" value={hasData ? fmt(result.totalInterestStandard) : "—"} />
          <SummaryRow label="Loan Term (Standard)" value={hasData ? `${result.payoffYearsStandard} Years` : "—"} />
            <SummaryRow label="Total Repaid (Offset)" value={hasData ? fmt(result.totalRepaidOffset) : "—"} />
            <SummaryRow label="Total Interest (Offset)" value={hasData ? fmt(result.totalInterestOffset) : "—"} />
        <SummaryRow label="Loan Term (Offset)" value={hasData ? `${result.payoffYearsOffset} Years` : "—"} />
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
                      dataKey="warpedYear" /* <-- Use warped year for positioning */
                      type="number"
                      scale="linear"   
                      domain={["dataMin", "dataMax"]}
                      ticks={xTicks}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                      dy={16}
                      tickFormatter={(v) => Math.floor(unwarpYear(v)).toString()} /* <-- Unwarp for the label */
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