import React, { useState, useEffect } from "react";
import InputField from "../../../inputField";
import AnnualRentalIncomeModal from "./AnnualRentalIncomeModal";
import ReactDOM from "react-dom";

export default function RentalIncomeModal({
    isOpen,
    onClose,
    grossRentWeekly,
    setGrossRentWeekly,
    inflationRate,
    rentTimeline,
    setRentTimeline,
    propertyValue = 750000,
    purchaseCosts = 0
}) {

    const [frequency, setFrequency] = useState("weekly");
    const [rentValue, setRentValue] = useState(grossRentWeekly || ""); // Represents rent per week/month/year
    const [vacancyRate, setVacancyRate] = useState("2.00");
    const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);

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
        return 1;
    };

    const rv = parseFloat(rentValue) || 0;
    const vac = parseFloat(vacancyRate) || 0;
    const totalCost = (parseFloat(propertyValue) || 0) + (parseFloat(purchaseCosts) || 0);

    const potentialAnnualRent = rv * getMultiplier(frequency);
    const actualAnnualRent = potentialAnnualRent * (1 - (vac / 100));
    const grossYield = totalCost > 0 ? (actualAnnualRent / totalCost) * 100 : 0;

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

    const handleFrequencyChange = (newFreq) => {
        const currentPotential = rv * getMultiplier(frequency);
        const newRentValue = currentPotential / getMultiplier(newFreq);

        setRentValue(newRentValue.toString());
        setFrequency(newFreq);
    };

    const handleOk = () => {
        const potential = rv * getMultiplier(frequency);
        const weeklyEquivalent = potential / 52;
        setGrossRentWeekly(weeklyEquivalent.toString());
        onClose();
    };

    if (!isOpen) return null;

    const labelMapping = {
        weekly: "Rent per week:",
        monthly: "Rent per month:",
        yearly: "Rent per year:"
    };

    return (
        <>
            {/* THE FIX: We only wrap the HTML div inside the createPortal call */}
            {ReactDOM.createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4">

                    <div className="bg-[#F8FAFC] rounded-[8px] shadow-2xl w-full max-w-[520px] max-h-[95vh] flex flex-col border border-[#CBD5E1] overflow-hidden">

                        <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#E2E8F0] shrink-0">
                            <h2 className="text-[14px] font-bold text-[#1E293B]">Rental Income</h2>
                            <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] text-[18px]">&times;</button>
                        </div>

                        <div className="p-4 overflow-y-auto">

                            <div className="flex flex-col sm:flex-row gap-4 mb-2">

                                <div className="flex-1 border border-[#CBD5E1] rounded-[6px] p-4 pt-6 bg-white relative">
                                    <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Rental Income (1st Year)</span>
                                    <div className="flex flex-col gap-3">

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3 leading-tight">{labelMapping[frequency]}</span>
                                            <div className="w-[100px] sm:w-[110px] shrink-0">
                                                <InputField value={rentValue} onChange={setRentValue} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3 leading-tight">Potential annual rent:</span>
                                            <div className="w-[100px] sm:w-[110px] shrink-0">
                                                <InputField value={Math.round(potentialAnnualRent).toString()} onChange={handlePotentialRentChange} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3 leading-tight">Annual vacancy rate:</span>
                                            <div className="w-[100px] sm:w-[110px] shrink-0">
                                                <InputField value={vacancyRate} onChange={setVacancyRate} suffix="%" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3 leading-tight">Actual annual rent:</span>
                                            <div className="w-[100px] sm:w-[110px] shrink-0">
                                                <InputField value={Math.round(actualAnnualRent).toString()} onChange={handleActualRentChange} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[13px] text-[#64748B] flex-1 text-left sm:text-right pr-1 sm:pr-3 leading-tight">Gross yield:</span>
                                            <div className="w-[100px] sm:w-[110px] shrink-0">
                                                <InputField value={grossYield.toFixed(2)} onChange={handleYieldChange} suffix="%" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full sm:w-[140px] border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative shrink-0">
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

                        <div className="px-4 py-3 bg-[#F1F5F9] border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-2 rounded-b-[8px] shrink-0">
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">

                                <button onClick={() => setIsAnnualModalOpen(true)} className="px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-medium flex-1 sm:flex-none whitespace-nowrap">
                                    Annual Rent
                                </button>
                                <button className="px-3 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-bold">
                                    ?
                                </button>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={handleOk} className="flex-1 sm:flex-none px-6 py-1.5 border border-[#CBD5E1] bg-[#0052CC] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#003d99] transition-colors shadow-sm">
                                    OK
                                </button>
                                <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-1.5 border border-[#CBD5E1] bg-white rounded-[4px] text-[13px] text-[#1E293B] hover:bg-[#E2E8F0] transition-colors shadow-sm font-medium">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

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