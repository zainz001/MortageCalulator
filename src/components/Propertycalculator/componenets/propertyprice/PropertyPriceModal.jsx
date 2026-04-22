import React, { useState } from "react";
import TimelineRow from "./TimelineRow";

export default function PropertyValueModal({
  isOpen, onClose,
  propertyValue, setPropertyValue,
  renovationCosts, setRenovationCosts,
  holdingCosts, setHoldingCosts,
  furnitureCosts, setFurnitureCosts,
  propertyAddress, setPropertyAddress,
  propertyDescription, setPropertyDescription,
  renovationTimeline, setRenovationTimeline,
  furnitureTimeline, setFurnitureTimeline,
  linkValueFittings, setLinkValueFittings,
  linkConstructionCost, setLinkConstructionCost,
  projections = [] 
}) {
  const [startIndex, setStartIndex] = useState(0);
  const currentYear = new Date().getFullYear();

  if (!isOpen) return null;

  // Infinite Scroll Arrow Handlers
  const handleStart = () => setStartIndex(0);
  const handlePrev  = () => setStartIndex(Math.max(0, startIndex - 1));
  const handleNext  = () => setStartIndex(startIndex + 1); // Infinite forward
  const handleEnd   = () => setStartIndex(Math.max(0, projections.length - 5));

  const pv = +propertyValue || 0;
  const rc = +renovationCosts || 0;
  const bookValue = pv + rc;
  
  // Read calculated future market values from main engine
  const projectedMarketValues = projections.map(p => p.propertyValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[800px] flex flex-col border border-[#CBD5E1] overflow-hidden">
        
        {/* Title Bar */}
        <div className="flex justify-between items-center px-5 py-3 bg-white border-b border-[#E2E8F0]">
          <h2 className="text-[15px] font-bold text-[#1E293B]">Property Value</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          
          {/* Section 1: Property Value Grid */}
          <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative mb-6">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Property Value</span>
            
            {/* Table Header (End of Year & Sliding Timeline Years) */}
            <div className="flex items-center mb-4 w-full">
               <div className="w-[130px] text-right pr-4 text-[13px] text-[#1E293B] font-medium">End of year:</div>
               <div className="w-[100px] text-right px-2 font-bold text-[#1E293B] text-[13px]">{currentYear}</div>
               <div className="flex-1 flex gap-2 ml-4">
                  {[1, 2, 3, 4, 5].map(y => (
                     <div key={y} className="flex-1 text-center text-[12px] text-[#64748B] font-bold">
                       {startIndex + y}yr
                     </div>
                  ))}
               </div>
            </div>

            <TimelineRow label="Property Price" baseValue={propertyValue} onBaseChange={setPropertyValue} isBaseOnly={true} />
            <TimelineRow label="Renovations" baseValue={renovationCosts} onBaseChange={setRenovationCosts} timelineValues={renovationTimeline} onTimelineChange={setRenovationTimeline} startIndex={startIndex} />
            <TimelineRow label="Book value" baseValue={bookValue} isBaseOnly={true} isReadOnly={true} />
            <TimelineRow label="Market value" baseValue={bookValue} timelineValues={projectedMarketValues} isReadOnly={true} startIndex={startIndex} />
            <TimelineRow label="Holding costs" baseValue={holdingCosts} onBaseChange={setHoldingCosts} isBaseOnly={true} />
            <TimelineRow label="Furniture" baseValue={furnitureCosts} onBaseChange={setFurnitureCosts} timelineValues={furnitureTimeline} onTimelineChange={setFurnitureTimeline} startIndex={startIndex} />
          </div>

          {/* Bottom Layout: Details & Linked Settings */}
          <div className="flex gap-4">
            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
               <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Property Details</span>
               <div className="flex flex-col gap-3">
                 <div className="flex items-center">
                    <span className="w-[80px] text-right pr-3 text-[13px] text-[#64748B]">Address:</span>
                    <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="flex-1 border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] focus:outline-none focus:border-[#0052CC]" />
                 </div>
                 <div className="flex items-center">
                    <span className="w-[80px] text-right pr-3 text-[13px] text-[#64748B]">Description:</span>
                    <input type="text" value={propertyDescription} onChange={(e) => setPropertyDescription(e.target.value)} className="flex-1 border border-[#CBD5E1] rounded-[4px] px-2 py-1.5 text-[13px] focus:outline-none focus:border-[#0052CC]" />
                 </div>
               </div>
            </div>

            <div className="w-[220px] border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
               <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Linked to Property Price</span>
               <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="checkbox" checked={linkValueFittings} onChange={(e) => setLinkValueFittings(e.target.checked)} className="rounded" /> Value of fittings
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input type="checkbox" checked={linkConstructionCost} onChange={(e) => setLinkConstructionCost(e.target.checked)} className="rounded" /> Construction cost
                  </label>
               </div>
            </div>
          </div>
        </div>
        
        {/* Footer Panel with Arrows */}
        <div className="px-5 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
          <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
            Annual Growth Rates
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
             <button onClick={handleStart} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">?</button>
             <button onClick={handleStart} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&lt;&lt;</button>
             <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&lt;</button>
             <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&gt;</button>
             <button onClick={handleEnd} className="w-8 h-8 flex items-center justify-center border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#64748B] font-bold hover:bg-[#E2E8F0] shadow-sm">&gt;&gt;</button>
          </div>

          <div className="flex gap-2">
             <button onClick={onClose} className="px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
             <button onClick={onClose} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
          </div>
        </div>

      </div>
    </div>
  );
}