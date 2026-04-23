import React, { useState, useEffect } from "react";
import InputField from "../../../inputField";
import AnnualRentalIncomeModal from "./AnnualRentalIncomeModal";

export default function RentalIncomeModal({
    isOpen,
    onClose,
    grossRentWeekly,
    setGrossRentWeekly,
    inflationRate,
    rentTimeline,
    setRentTimeline,
    propertyValue = 750000, // <--- Added for yield calc
    purchaseCosts = 0       // <--- Added for yield calc
}) {
    // 1. Core State
    const [frequency, setFrequency] = useState("weekly");
    const [rentValue, setRentValue] = useState(grossRentWeekly || ""); // Represents rent per week/month/year
    const [vacancyRate, setVacancyRate] = useState("2.00");
    const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);

    // Sync when modal opens
    useEffect(() => {
        if (isOpen) {
            setRentValue(grossRentWeekly || "");
            setFrequency("weekly");
        }
    }, [isOpen, grossRentWeekly]);

    // 2. The Core Math Logic (Forward Calculation)
    const getMultiplier = (freq) => {
        if (freq === "weekly") return 52;
        if (freq === "monthly") return 12;
        return 1; // yearly
    };

    const rv = parseFloat(rentValue) || 0;
    const vac = parseFloat(vacancyRate) || 0;
    const totalCost = (parseFloat(propertyValue) || 0) + (parseFloat(purchaseCosts) || 0);

    const potentialAnnualRent = rv * getMultiplier(frequency);
    const actualAnnualRent = potentialAnnualRent * (1 - (vac / 100));
    
    // Yield is calculated on actual rent vs total cost
    const grossYield = totalCost > 0 ? (actualAnnualRent / totalCost) * 100 : 0;

    // 3. Reverse Math Handlers (When a user types into a derived field)
    const handlePotentialRentChange = (newVal) => {
        const potential = parseFloat(newVal) || 0;
        const newRentValue = potential / getMultiplier(frequency);
        setRentValue(newRentValue.toString());
    };

    const handleActualRentChange = (newVal) => {
        const actual = parseFloat(newVal) || 0;
        // Avoid divide by zero if vacancy is 100%
        const potential = vac === 100 ? 0 : actual / (1 - (vac / 100));
        const newRentValue = potential / getMultiplier(frequency);
        setRentValue(newRentValue.toString());
    };

    const handleYieldChange = (newVal) => {
        const targetYield = parseFloat(newVal) || 0;
        const targetActualRent = (targetYield / 100) * totalCost;
        const targetPotential = vac === 100 ? 0 : targetActualRent / (1 - (vac / 100));
        const newRentValue = targetPotential / getMultiplier(frequency);
        setRentValue(newRentValue.toString());
    };

    // 4. Handle Frequency Toggle
    const handleFrequencyChange = (newFreq) => {
        // When changing frequency, we want the *Annual Rent* to stay exactly the same.
        // So we take current potential rent, and divide by the NEW multiplier.
        const currentPotential = rv * getMultiplier(frequency);
        const newRentValue = currentPotential / getMultiplier(newFreq);
        
        setRentValue(newRentValue.toString());
        setFrequency(newFreq);
    };

    const handleOk = () => {
        // Ensure we always save the WEEKLY equivalent back to the parent state
        // regardless of what frequency radio button they are currently viewing.
        const potential = rv * getMultiplier(frequency);
        const weeklyEquivalent = potential / 52;
        setGrossRentWeekly(weeklyEquivalent.toString());
        onClose();
    };

    if (!isOpen) return null;

    // Formatting helpers for display
    const labelMapping = {
        weekly: "Rent per week:",
        monthly: "Rent per month:",
        yearly: "Rent per year:"
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm">
                <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-[520px] flex flex-col border border-[#CBD5E1] overflow-hidden">

                    <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0]">
                        <h2 className="text-[14px] font-bold text-[#1E293B]">Rental Income</h2>
                        <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
                    </div>

                    <div className="p-4">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
                                <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Rental Income (1st Year)</span>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">{labelMapping[frequency]}</span>
                                        <div className="w-[110px]">
                                            <InputField value={rentValue} onChange={setRentValue} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Potential annual rent:</span>
                                        <div className="w-[110px]">
                                            {/* Changed to Editable Input */}
                                            <InputField value={Math.round(potentialAnnualRent).toString()} onChange={handlePotentialRentChange} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Annual vacancy rate:</span>
                                        <div className="w-[110px]">
                                            <InputField value={vacancyRate} onChange={setVacancyRate} suffix="%" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Actual annual rent:</span>
                                        <div className="w-[110px]">
                                            {/* Changed to Editable Input */}
                                            <InputField value={Math.round(actualAnnualRent).toString()} onChange={handleActualRentChange} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Gross yield:</span>
                                        <div className="w-[110px]">
                                            {/* Changed to Editable Input */}
                                            <InputField value={grossYield.toFixed(2)} onChange={handleYieldChange} suffix="%" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[140px] border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
                                <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Preferences</span>
                                <div className="flex flex-col gap-2.5 mt-1">
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                                        <input type="radio" checked={frequency === "weekly"} onChange={() => handleFrequencyChange("weekly")} className="text-[#0052CC]" /> Per week
                                    </label>
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                                        <input type="radio" checked={frequency === "monthly"} onChange={() => handleFrequencyChange("monthly")} className="text-[#0052CC]" /> Per month
                                    </label>
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                                        <input type="radio" checked={frequency === "yearly"} onChange={() => handleFrequencyChange("yearly")} className="text-[#0052CC]" /> Per year
                                    </label>
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer opacity-50">
                                        <input type="radio" disabled className="text-[#0052CC]" /> Holiday letting
                                    </label>
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer opacity-50">
                                        <input type="radio" disabled className="text-[#0052CC]" /> Gross yield
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex justify-between items-center rounded-b-[8px]">
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
                                Advanced
                            </button>
                            <button onClick={() => setIsAnnualModalOpen(true)} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">
                                Annual Rent
                            </button>
                            <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-bold">
                                ?
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleOk} className="px-6 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] font-bold hover:bg-[#E2E8F0] transition-colors shadow-sm">OK</button>
                            <button onClick={onClose} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <AnnualRentalIncomeModal 
                isOpen={isAnnualModalOpen} 
                onClose={() => setIsAnnualModalOpen(false)}
                actualAnnualRent={actualAnnualRent.toString()} 
                inflationRate={inflationRate}
                rentTimeline={rentTimeline}
                setRentTimeline={setRentTimeline}
            />
        </>
    );
}