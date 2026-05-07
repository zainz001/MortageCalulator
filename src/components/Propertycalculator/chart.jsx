import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Chart({ data }) {
  if (!data || data.length === 0) return null;

  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return "$0";
    return `$${(tickItem / 1000).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 shadow-lg flex flex-col items-center">
          <p className="text-[#0052CC] text-[12px] font-semibold mb-1">Property Value</p>
          <p className="text-[#A0AEC0] text-[12px] mb-1">Year {label}</p>
          <p className="text-[#1E293B] font-bold text-[14px]">
            ${Math.round(payload[0].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#A0AEC0", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{ fill: "#A0AEC0", fontSize: 12 }}
            dx={-10}
              domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#CBD5E1', strokeWidth: 2 }} />
          <Line
            type="monotone"
            dataKey="propertyValue"
            stroke="#0052CC"
            strokeWidth={2}
            dot={{ r: 4, fill: "#0052CC", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#0052CC", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
