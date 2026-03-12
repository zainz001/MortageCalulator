import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

export default function Chart({ chartData = [], savings = 0, yearsSaved = 0 }) {
  const currentYearNum = new Date().getFullYear();
  const currentYear = currentYearNum.toString();

  // Check if we have actual calculated data
  const hasData = chartData && chartData.length > 0;

  // Use the real data exactly as it comes in, no fake past years
  const displayData = hasData
    ? chartData
    : [
        { year: currentYear, bank: 0, swish: 0 },
        { year: (currentYearNum + 30).toString(), bank: 0, swish: 0 },
      ];

  // Find the data point for the current year
  const todayData = displayData.find((d) => String(d.year) === currentYear) || displayData[0];
  const todayX = String(todayData.year);
  const todayY = todayData.bank;

  return (
    // OUTER CONTAINER
    <div className="flex-1 bg-[#F8F8F8] rounded-[16px] p-3 md:p-5 flex flex-col">

      {/* INNER CONTAINER */}
      <div className="flex-1 bg-white rounded-[14px] p-4 md:p-5 shadow-sm border border-[#E2E8F0] flex flex-col">

        {/* RESULT CARDS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
          <div className="flex-1 bg-[#F5F7FF] rounded-[12px] p-3 md:p-4 text-center flex flex-col justify-center">
            <p className="text-xs md:text-sm text-[#444F58] mb-1">With Swish, you could save</p>
            <p className="text-[20px] md:text-[28px] font-bold text-[#0052CC]">
              ${savings.toLocaleString()}
            </p>
          </div>

          <div className="flex-1 bg-[#eefbf4] rounded-[12px] p-3 md:p-4 text-center flex flex-col justify-center">
            <p className="text-xs md:text-sm text-[#444F58] mb-1">
              You could be Mortgage free in
            </p>
            <p className="text-[20px] md:text-[28px] font-bold text-[#2e9e4f]">
              {hasData ? yearsSaved : 0} Years
            </p>
          </div>
        </div>

        {/* AREA CHART */}
        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] relative mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              
              {/* Added minTickGap to strictly prevent duplicate year labels */}
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A1A8B2', fontSize: 12 }}
                dy={10}
                minTickGap={20} 
              />
              <YAxis
                width={60}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v === 0 ? "$0" : `$${v / 1000}K`)}
                tick={{ fill: '#A1A8B2', fontSize: 12 }}
              />

              <Tooltip
                formatter={(v) => `$${Math.round(v).toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />

              <Area
                type="monotone"
                dataKey="bank"
                stroke="#B3B8C2"
                fill="#C4C9D1"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={800}
              />

              <Area
                type="monotone"
                dataKey="swish"
                stroke="#4078FF"
                fill="#4078FF"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={800}
              />

              {/* Renders the "Today" marker exactly on 2026 */}
              {hasData && todayY !== undefined && (
                <>
                  <ReferenceLine x={todayX} stroke="#ED2F00" strokeWidth={1.5} />

                  <ReferenceDot
                    x={todayX}
                    y={todayY}
                    r={6}
                    fill="#fff"
                    stroke="#ED2F00"
                    strokeWidth={2}
                    label={{
                      position: "top",
                      value: "Today",
                      fill: "#ED2F00",
                      fontSize: 12,
                      fontWeight: 500,
                      offset: 10
                    }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <div className="flex justify-center gap-6 mt-4 md:mt-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#4078FF] rounded-full"></div>
            <span className="text-[12px] md:text-[13px] text-[#444F58]">Projected with Swish</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#C4C9D1] rounded-full"></div>
            <span className="text-[12px] md:text-[13px] text-[#444F58]">Projected with Bank</span>
          </div>
        </div>
      </div>
    </div>
  );
}