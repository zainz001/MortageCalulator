const InputField = ({ label, prefix, placeholder, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] sm:text-[13px] text-[#444F58] font-medium">
        {label}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 sm:left-4 text-[#A1A8B2]">{prefix}</span>
        )}

        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) =>
            onChange && onChange(Number(e.target.value.replace(/,/g, "")))
          }
          className={`w-full py-2.5 sm:py-2.5 border border-[#E2E8F0] rounded text-sm ${
            prefix ? "pl-7 sm:pl-8 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

export default InputField;