import React from "react";
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
  const currentYear = currentYearNum.toString();

  const hasData = !!(result && result.repayment != null && chartData && chartData.length > 0);
  const hasExtra = yearsSaved > 0 || monthsSaved > 0;

  // Map incoming data to ensure we always have 'standard' and 'offset' keys
  const displayData = hasData
    ? chartData.map((row) => ({
      ...row,
      standard: row.standard,
      offset: row.offset,
    }))
    : [
      { year: currentYear, standard: 0, offset: 0 },
      { year: (currentYearNum + 30).toString(), standard: 0, offset: 0 },
    ];

  const todayData = displayData.find((d) => String(d.year) === currentYear) || displayData[0];
  const todayX = String(todayData?.year);
  const todayY = todayData?.standard ?? 0;

  const freqLabel = frequency === "monthly" ? "mo" : frequency === "fortnightly" ? "fn" : "wk";

  const fmt = (n) =>
    n != null
      ? "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";

  const timeSavedLabel = [
    yearsSaved > 0 ? `${yearsSaved} Year${yearsSaved !== 1 ? "s" : ""}` : "",
    monthsSaved > 0 ? `${monthsSaved} Month${monthsSaved !== 1 ? "s" : ""}` : "",
  ].filter(Boolean).join(", ");

  const timeSavedText = timeSavedLabel.length > 0 ? timeSavedLabel : "—";

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Format an X-axis tick: decimal year → "MMM 'YY", whole year → "2026"
  const formatXTick = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return String(val);
    const yr = Math.floor(num);
    const fraction = num - yr;
    if (fraction < 0.001) return String(yr);
    const mIdx = Math.min(Math.max(Math.floor(fraction * 12), 0), 11);
    return `${MONTH_NAMES[mIdx]} '${String(yr).slice(-2)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const displayLabel = formatXTick(label);
    return (
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10,
        padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: "#1E293B", marginBottom: 6, marginTop: 0 }}>{displayLabel}</p>
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

  // Reusable row component for the blue box
  const SummaryRow = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <span style={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 400 }}>{label}</span>
      <div style={{
        background: "#FFFFFF",
        color: "#0B2146",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "14px",
        fontWeight: "600",
        minWidth: "140px",
        textAlign: "right"
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

        {/* ── TOP SUMMARY BLUE BOX (Matched to Image & Spec) ── */}
        <div style={{
          background: "#0B2146",
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}>
          <SummaryRow 
            label={`Regular Repayment (per ${freqLabel})`} 
            value={hasData ? fmt(result.repayment) : "—"} 
          />
          <SummaryRow 
            label="Total Amount Repaid (Offset)" 
            value={hasData ? fmt(result.totalRepaidOffset) : "—"} 
          />
          <SummaryRow 
            label="Total Interest Paid (Offset)" 
            value={hasData ? fmt(result.totalInterestOffset) : "—"} 
          />
          <SummaryRow 
            label="Interest Saved" 
            value={hasData && savings > 0 ? fmt(savings) : "—"} 
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 400 }}>Time Saved</span>
            <div style={{
              background: "#FFFFFF",
              color: "#0B2146",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "600",
              minWidth: "140px",
              textAlign: "right"
            }}>
              {hasData ? timeSavedText : "—"}
            </div>
          </div>
        </div>

        {/* ── CHART AREA ── */}
        <div style={{
          flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #E8EDF2",
          padding: "24px 16px 16px", display: "flex", flexDirection: "column",
          minHeight: 340, height: "auto",
        }}>
          
          <div style={{ flex: 1, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayData} margin={{ top: 20, right: 8, left: 0, bottom: 20 }}>
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
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                  dy={16}
                  interval="preserveStartEnd"
                  tickFormatter={formatXTick}
                />
                <YAxis
                  width={62}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v === 0 ? "$0" : v >= 1000000
                      ? `$${(v / 1000000).toFixed(1)}M`
                      : `$${(v / 1000).toFixed(0)}K`
                  }
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Standard Loan Area (Grey) */}
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

                {/* Offset Loan Area (Blue) */}
                <Area
                  type="monotone"
                  dataKey="offset"
                  stroke="#4A72FF"
                  strokeWidth={hasExtra ? 2 : 0}
                  fill={hasExtra ? "url(#offsetGrad)" : "none"}
                  dot={false}
                  activeDot={hasExtra ? { r: 4, fill: "#4A72FF" } : false}
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

          {/* ── CUSTOM LEGEND ── */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginTop: 12 }}>
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