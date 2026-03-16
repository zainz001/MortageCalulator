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
  loanAmount = 0,
  depositAmount = 0,
  depositPercent = 0,
  lvr = 0,
  frequency = "monthly",
  payoffDate = "",
}) {
  const currentYearNum = new Date().getFullYear();
  const currentYear = currentYearNum.toString();

  const hasData = !!(result && result.repayment != null && chartData && chartData.length > 0);
  const hasExtra = yearsSaved > 0 || monthsSaved > 0;

  const displayData = hasData
    ? chartData.map((row) => ({
      ...row,
      swish: hasExtra ? row.swish : row.bank,
    }))
    : [
      { year: currentYear, bank: 0, swish: 0 },
      { year: (currentYearNum + 30).toString(), bank: 0, swish: 0 },
    ];

  const todayData = displayData.find((d) => String(d.year) === currentYear) || displayData[0];
  const todayX = String(todayData?.year);
  const todayY = todayData?.bank ?? 0;

  const freqLabel = frequency === "monthly" ? "mo" : frequency === "fortnightly" ? "fn" : "wk";

  const fmt = (n) =>
    n != null
      ? "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—";

  const fmtShort = (n) =>
    n != null
      ? "$" + Number(n).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : "—";

  const timeSavedLabel = [
    yearsSaved > 0 ? `${yearsSaved} yr${yearsSaved !== 1 ? "s" : ""}` : "",
    monthsSaved > 0 ? `${monthsSaved} mo` : "",
  ].filter(Boolean).join(" ") + " sooner";

  const resultRows = hasData && result
    ? [
      { label: "Loan amount", value: fmt(loanAmount), highlight: false },
      { label: "Deposit amount", value: fmt(depositAmount), highlight: false },
      { label: "Deposit %", value: `${Number(depositPercent).toFixed(2)}%`, highlight: false },
      { label: "LVR", value: `${Number(lvr).toFixed(2)}%`, highlight: Number(lvr) > 80 ? "red" : false },
      { label: `Repayment / ${freqLabel}`, value: fmt(result.repayment), highlight: "blue" },
      { label: "Total amount repaid", value: fmt(result.totalRepaid), highlight: false },
      { label: "Total interest paid", value: fmt(result.totalInterest), highlight: "red" },
      { label: "No. of repayments", value: result.numberOfRepayments, highlight: false },
      { label: "Estimated payoff date", value: payoffDate, highlight: false },
      { label: "Interest saved (extra)", value: savings > 0 ? fmt(savings) : "—", highlight: savings > 0 ? "green" : false },
    ]
    : [];

  const skeletonRows = [
    "Loan amount", "Deposit amount", "Deposit %", "LVR",
    "Repayment / mo", "Total amount repaid", "Total interest paid",
    "No. of repayments", "Estimated payoff date", "Interest saved (extra)",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10,
        padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: "#1E293B", marginBottom: 6, marginTop: 0 }}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: p.dataKey === "bank" ? "#94A3B8" : "#3B82F6",
              display: "inline-block", flexShrink: 0,
            }} />
            <span style={{ color: "#64748B" }}>{p.dataKey === "bank" ? "Bank" : "Swish"}:</span>
            <span style={{ fontWeight: 600, color: "#1E293B" }}>${Math.round(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ minHeight: "100%" }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "#F8F8F8", borderRadius: 16, padding: "24px", gap: 16,
      }}>

        {/* ── HEADER ── */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#23303B", margin: "0 0 4px" }}>
            Your mortgage projection
          </h3>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
            {hasData ? "See how your loan balance reduces over time" : "Fill in the form and click Calculate to see your results"}
          </p>
        </div>

        {/* ── TOP SUMMARY CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{
            background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
            border: "1px solid #C7D2FE", borderRadius: 12, padding: "16px",
            textAlign: "center", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", minHeight: 90,
          }}>
            {!hasData ? (
              <>
                <p style={{ fontSize: 10, color: "#6366F1", fontWeight: 700, margin: "0 0 8px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Repayment amount
                </p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#C7D2FE", margin: 0 }}>—</p>
                <p style={{ fontSize: 11, color: "#A5B4FC", margin: "4px 0 0" }}>calculate to see</p>
              </>
            ) : hasExtra ? (
              <>
                <p style={{ fontSize: 10, color: "#6366F1", fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Interest saved with Swish
                </p>
                <p style={{ fontSize: "clamp(18px, 4vw, 28px)", fontWeight: 800, color: "#3730A3", lineHeight: 1.1, margin: 0, wordBreak: "break-word" }}>
                  {fmtShort(savings)}
                </p>
                <p style={{ fontSize: 11, color: "#818CF8", margin: "4px 0 0" }}>vs standard bank loan</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 10, color: "#6366F1", fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  {`Repayment / ${freqLabel}`}
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#3730A3", lineHeight: 1, margin: 0 }}>
                  {fmtShort(result.repayment)}
                </p>
                <p style={{ fontSize: 11, color: "#818CF8", margin: "4px 0 0" }}>scheduled repayment</p>
              </>
            )}
          </div>

          <div style={{
            background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
            border: "1px solid #6EE7B7", borderRadius: 12, padding: "16px",
            textAlign: "center", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", minHeight: 90,
          }}>
            {!hasData ? (
              <>
                <p style={{ fontSize: 10, color: "#059669", fontWeight: 700, margin: "0 0 8px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Payoff date
                </p>
                <p style={{ fontSize: 32, fontWeight: 800, color: "#A7F3D0", margin: 0 }}>—</p>
                <p style={{ fontSize: 11, color: "#6EE7B7", margin: "4px 0 0" }}>calculate to see</p>
              </>
            ) : hasExtra ? (
              <>
                <p style={{ fontSize: 10, color: "#059669", fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Mortgage free
                </p>
                <p style={{ fontSize: "clamp(18px, 4vw, 28px)", fontWeight: 800, color: "#065F46", lineHeight: 1.1, margin: 0, wordBreak: "break-word" }}>
                  {timeSavedLabel}
                </p>
                <p style={{ fontSize: 11, color: "#059669", margin: "4px 0 0" }}>earlier than scheduled</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 10, color: "#059669", fontWeight: 700, margin: "0 0 6px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Estimated payoff
                </p>
                <p style={{ fontSize: "clamp(14px, 3.5vw, 24px)", fontWeight: 800, color: "#065F46", lineHeight: 1.2, margin: 0, wordBreak: "break-word" }}>
                  {payoffDate}
                </p>
                <p style={{ fontSize: 11, color: "#34D399", margin: "4px 0 0" }}>
                  add extra repayments to pay off sooner
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── LOAN SUMMARY GRID ── */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8EDF2", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "#F1F5F9", borderBottom: "1px solid #E8EDF2" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", margin: 0 }}>Loan summary</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {hasData
              ? resultRows.map((row, idx) => (
                <div key={idx} style={{
                  padding: "10px 14px",
                  borderBottom: idx < resultRows.length - 2 ? "1px solid #F1F5F9" : "none",
                  borderRight: idx % 2 === 0 ? "1px solid #F1F5F9" : "none",
                }}>
                  <p style={{ fontSize: 10, color: "#94A3B8", margin: "0 0 2px", fontWeight: 500 }}>{row.label}</p>
                  <p style={{
                    fontSize: 13, fontWeight: 700, margin: 0,
                    color:
                      row.highlight === "blue" ? "#2563EB" :
                        row.highlight === "red" ? "#DC2626" :
                          row.highlight === "green" ? "#16A34A" : "#1E293B",
                  }}>
                    {row.value}
                  </p>
                </div>
              ))
              : skeletonRows.map((label, idx) => (
                <div key={idx} style={{
                  padding: "10px 14px",
                  borderBottom: idx < skeletonRows.length - 2 ? "1px solid #F1F5F9" : "none",
                  borderRight: idx % 2 === 0 ? "1px solid #F1F5F9" : "none",
                }}>
                  <p style={{ fontSize: 10, color: "#94A3B8", margin: "0 0 2px", fontWeight: 500 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1", margin: 0 }}>—</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── CHART ── */}
        {/* ✅ FIX: added height: "auto" so container doesn't collapse on mobile */}
        <div style={{
          flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #E8EDF2",
          padding: "16px 14px 12px", display: "flex", flexDirection: "column",
          minHeight: 280, height: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", margin: "0 0 2px" }}>
                Remaining balance over time
              </p>
              <p style={{ fontSize: 10, color: "#94A3B8", margin: 0 }}>
                {hasData
                  ? hasExtra
                    ? "Gray = bank · Blue = Swish with extra repayments"
                    : "Add extra repayments to see Swish savings vs bank"
                  : "Your projection will appear here"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 3, background: "#3B82F6", borderRadius: 2 }} />
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>Swish</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 3, background: "#94A3B8", borderRadius: 2 }} />
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>Bank</span>
              </div>
            </div>
          </div>

          {/* ✅ FIX: explicit height={220} instead of height="100%" to fix mobile rendering */}
          <div style={{ flex: 1, minHeight: 200, height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={displayData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CBD5E1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#CBD5E1" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="swishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
                  dy={6}
                  interval="preserveStartEnd"
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
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="bank"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  fill="url(#bankGrad)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#94A3B8" }}
                  isAnimationActive
                  animationDuration={900}
                />

                <Area
                  type="monotone"
                  dataKey="swish"
                  stroke="#3B82F6"
                  strokeWidth={hasExtra ? 2.5 : 0}
                  fill={hasExtra ? "url(#swishGrad)" : "none"}
                  dot={false}
                  activeDot={hasExtra ? { r: 3, fill: "#3B82F6" } : false}
                  isAnimationActive
                  animationDuration={900}
                  animationBegin={150}
                />

                {hasData && (
                  <>
                    <ReferenceLine x={todayX} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 3" />
                    <ReferenceDot
                      x={todayX}
                      y={todayY}
                      r={4}
                      fill="#fff"
                      stroke="#EF4444"
                      strokeWidth={2}
                      label={{ position: "top", value: "Today", fill: "#EF4444", fontSize: 10, fontWeight: 600, offset: 7 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <p style={{ fontSize: 11, color: "#9BA5B0", lineHeight: "15px", textAlign: "center", margin: 0 }}>
          A test rate of 6.80% has been used to calculate these results. This calculator is intended
          to provide you with an indication only. It does not constitute an offer of finance from Swish.
          All loans are subject to lenders' normal lending criteria, terms, and conditions.
        </p>

      </div>
    </div>
  );
}