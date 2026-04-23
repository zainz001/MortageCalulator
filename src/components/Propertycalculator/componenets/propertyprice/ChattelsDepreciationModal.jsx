import React, { useState, useEffect, useMemo } from "react";
import InputField from "../../../inputField";

export default function ChattelsDepreciationModal({
  isOpen,
  onClose,
  propertyValue,
  setChattelsDepreciation
}) {
  const [startIndex, setStartIndex] = useState(0);
  
  // Preferences
  const [method, setMethod] = useState("DV"); // DV = Diminishing Value, PC = Prime Cost (Straight Line)
  const [isLinked, setIsLinked] = useState(true);
  const [linkRate, setLinkRate] = useState("6.00");

  // Grid Items
  const [items, setItems] = useState([
    { id: '1', name: 'Furniture', value: "", rate: "20.00" },
    { id: '2', name: 'General chattels', value: "45000", rate: "25.00" },
    { id: '3', name: 'Curtains', value: "", rate: "25.00" },
    { id: '4', name: 'Carpets', value: "", rate: "40.00" },
    { id: '5', name: 'Light fittings', value: "", rate: "20.00" },
    { id: '6', name: 'Lawn mower', value: "", rate: "50.00" },
    { id: '7', name: 'Refrigerator', value: "", rate: "25.00" },
    { id: '8', name: 'Stove', value: "", rate: "25.00" },
    { id: '9', name: 'Other', value: "", rate: "25.00" },
  ]);

  // Handle "Link value to property price"
  useEffect(() => {
    if (isOpen && isLinked) {
      const pv = parseFloat(propertyValue) || 0;
      const rate = parseFloat(linkRate) || 0;
      const calculatedValue = Math.round(pv * (rate / 100));
      
      setItems(prev => {
        const newItems = [...prev];
        // The legacy app targets the 2nd row (General chattels) for the linked value
        newItems[1] = { ...newItems[1], value: calculatedValue.toString() };
        return newItems;
      });
    }
  }, [isOpen, propertyValue, isLinked, linkRate]);

  // 20-Year Math Engine for each row
  const projections = useMemo(() => {
    return items.map(item => {
      const vals = [];
      let currentBookValue = parseFloat(item.value) || 0;
      const originalValue = currentBookValue;
      const rate = (parseFloat(item.rate) || 0) / 100;

      for (let i = 0; i < 20; i++) {
        if (currentBookValue <= 0) {
          vals.push(0);
          continue;
        }

        let dep = 0;
        if (method === "DV") {
          // Diminishing Value
          dep = currentBookValue * rate;
        } else {
          // Prime Cost (Straight Line) or Annual Claim
          dep = originalValue * rate;
          if (dep > currentBookValue) dep = currentBookValue; // Can't depreciate below 0
        }

        vals.push(dep);
        currentBookValue -= dep;
      }
      return vals;
    });
  }, [items, method]);

  // Calculate Totals
  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
  
  const totalProjections = useMemo(() => {
    const totals = Array(20).fill(0);
    projections.forEach(rowVals => {
      rowVals.forEach((val, idx) => {
        totals[idx] += val;
      });
    });
    return totals;
  }, [projections]);

  if (!isOpen) return null;

  const handleStart = () => setStartIndex(0);
  const handlePrev  = () => setStartIndex(Math.max(0, startIndex - 1));
  const handleNext  = () => setStartIndex(Math.min(15, startIndex + 1)); // Max 15 for a 20-yr array viewing 5 at a time
  const handleEnd   = () => setStartIndex(15);

  const handleItemChange = (index, field, val) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: val };
    setItems(newItems);
  };

  const formatVal = (val) => {
    if (!val || isNaN(val)) return "";
    return Math.round(val).toLocaleString("en-NZ");
  };

  const handleOk = () => {
    // Send Year 1 Total Depreciation back to the parent
    if (setChattelsDepreciation) {
      const year1Total = totalProjections[0] || 0;
      setChattelsDepreciation(Math.round(year1Total).toString());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[850px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-bold text-[#1E293B]">Depreciation of Chattels</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex flex-col gap-4">
          
          {/* Top: Itemised Schedule */}
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Itemised Depreciation Schedule</span>
            
            {/* Header Row */}
            <div className="flex items-center mb-2 pb-2 border-b border-[#E2E8F0]">
              <div className="w-[150px] text-[12px] font-bold text-[#1E293B]">Items</div>
              <div className="w-[80px] text-[12px] font-bold text-[#1E293B] text-right pr-2">Value</div>
              <div className="w-[70px] text-[12px] font-bold text-[#1E293B] text-center">Rate</div>
              <div className="flex-1 flex gap-2 ml-4">
                {[1, 2, 3, 4, 5].map(y => (
                  <div key={y} className="flex-1 text-center text-[12px] text-[#64748B] font-bold">
                    {startIndex + y}yr
                  </div>
                ))}
              </div>
            </div>

            {/* Data Rows */}
            <div className="flex flex-col gap-1.5">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center">
                  <div className="w-[150px] pr-2">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div className="w-[80px] pr-2">
                    <input 
                      type="text" 
                      value={item.value} 
                      onChange={(e) => handleItemChange(idx, 'value', e.target.value.replace(/,/g, ''))}
                      disabled={isLinked && idx === 1} // Lock General Chattels if linked
                      className={`w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-right text-[#1E293B] shadow-sm focus:outline-none focus:border-[#0052CC] ${isLinked && idx === 1 ? 'bg-[#F1F5F9] font-bold text-[#0052CC]' : 'bg-white'}`}
                    />
                  </div>
                  <div className="w-[70px]">
                    <input 
                      type="text" 
                      value={item.rate} 
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value.replace(/%/g, ''))}
                      className="w-full border border-[#CBD5E1] rounded-[4px] px-1.5 py-1 text-[13px] text-center text-[#1E293B] bg-white shadow-sm focus:outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <div className="flex-1 flex gap-2 ml-4">
                    {[0, 1, 2, 3, 4].map(y => {
                      const val = projections[idx][startIndex + y];
                      return (
                        <div key={y} className="flex-1 text-center text-[13px] text-[#1E293B] py-1">
                          {val > 0 ? formatVal(val) : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="flex items-center mt-3 pt-3 border-t border-[#CBD5E1]">
              <div className="w-[150px] text-[13px] font-bold text-[#1E293B]">Total</div>
              <div className="w-[80px] pr-2 text-right">
                <div className="w-full border border-[#CBD5E1] bg-white rounded-[4px] px-1.5 py-1 text-[13px] font-bold text-[#1E293B] shadow-sm">
                  {formatVal(totalValue)}
                </div>
              </div>
              <div className="w-[70px]"></div>
              <div className="flex-1 flex gap-2 ml-4">
                {[0, 1, 2, 3, 4].map(y => {
                  const val = totalProjections[startIndex + y];
                  return (
                    <div key={y} className="flex-1 text-center text-[13px] font-bold text-[#1E293B] border border-[#CBD5E1] bg-white rounded-[4px] py-1 shadow-sm">
                      {val > 0 ? formatVal(val) : ""}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom: Preferences & Navigation */}
          <div className="flex gap-4">
            
            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative flex gap-6">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Depreciation Preferences</span>
              
              <div className="flex-1 border border-[#E2E8F0] rounded-[6px] p-3 relative">
                <span className="absolute -top-2.5 left-2 bg-white px-1 text-[11px] font-bold text-[#64748B]">Method</span>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" checked={method === "DV"} onChange={() => setMethod("DV")} className="text-[#0052CC]" /> Diminishing value
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" checked={method === "PC"} onChange={() => setMethod("PC")} className="text-[#0052CC]" /> Prime cost
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="radio" checked={method === "AC"} onChange={() => setMethod("AC")} className="text-[#0052CC]" /> Annual claim
                  </label>
                </div>
              </div>

              <div className="flex-1 border border-[#E2E8F0] rounded-[6px] p-3 relative flex flex-col justify-center">
                <span className="absolute -top-2.5 left-2 bg-white px-1 text-[11px] font-bold text-[#64748B]">General</span>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="checkbox" checked={isLinked} onChange={(e) => setIsLinked(e.target.checked)} className="rounded" /> 
                    Link value to property price
                  </label>
                  <div className="w-[60px]">
                    <InputField value={linkRate} onChange={setLinkRate} suffix="%" />
                  </div>
                </div>
              </div>

            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-1">
                <button onClick={handleStart} className="w-10 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&lt;&lt;</button>
                <button onClick={handlePrev} className="w-10 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&lt;</button>
                <button onClick={handleNext} className="w-10 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&gt;</button>
                <button onClick={handleEnd} className="w-10 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&gt;&gt;</button>
              </div>
              
              <div className="flex gap-2">
                <button onClick={handleOk} className="flex-1 px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
                <button onClick={onClose} className="flex-1 px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}