import React from "react";


export function ModalRow({
  label,
  value,
  onChange,
  type = "number",
  prefix,
  suffix,
  readOnly = false,
  inputWidth = "128px",
}) {
  return (
    <div className="flex items-center gap-3 py-[5px]">
      <label className="text-[13px] text-[#64748B] flex-1 leading-snug">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-[13px] text-[#94A3B8]">{prefix}</span>
        )}
        <input
          type={readOnly ? "text" : type}
          value={value}
          readOnly={readOnly}
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          style={{ width: inputWidth }}
          className={[
            "text-right text-[13px] border rounded-[6px] px-2 py-1",
            readOnly
              ? "bg-[#F8F8F8] border-[#E2E8F0] text-[#94A3B8] cursor-default"
              : "bg-white border-[#E2E8F0] text-[#1E293B] focus:outline-none focus:border-[#0052CC]",
          ].join(" ")}
        />
        {suffix && (
          <span className="text-[13px] text-[#94A3B8]">{suffix}</span>
        )}
      </div>
    </div>
  );
}


export function ModalDivider() {
  return <hr className="border-[#E2E8F0] my-3" />;
}

export function ModalSectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mt-4 mb-2 first:mt-0">
      {children}
    </p>
  );
}


export function ModalTotal({ label, value, accent = true }) {
  return (
    <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#E2E8F0]">
      <span className="text-[13px] font-bold text-[#23303B]">{label}</span>
      <span
        className={[
          "text-[14px] font-bold",
          accent ? "text-[#0052CC]" : "text-[#23303B]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}


const VARIANT_STYLES = {
  info:    "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]",
  warning: "bg-[#FFF9ED] border-[#FEE08B] text-[#92400E]",
  success: "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]",
};

export function ModalInfoBox({ variant = "info", children }) {
  return (
    <div
      className={[
        "mt-3 p-3 border rounded-[8px] text-[12px] leading-relaxed",
        VARIANT_STYLES[variant],
      ].join(" ")}
    >
      {children}
    </div>
  );
}


export function ModalSelectRow({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-3 py-[5px]">
      <label className="text-[13px] text-[#64748B] flex-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px] border border-[#E2E8F0] rounded-[6px] px-2 py-1 bg-white text-[#1E293B] focus:outline-none focus:border-[#0052CC]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}