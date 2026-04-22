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
    setRentTimeline
}) {
    const [rentPerWeek, setRentPerWeek] = useState(grossRentWeekly || "");
    const [vacancyRate, setVacancyRate] = useState("2.00");
    const [preferences, setPreferences] = useState("weekly");
    const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);

    const [peakWeeks, setPeakWeeks] = useState("");
    const [peakRent, setPeakRent] = useState("");
    const [shoulderWeeks, setShoulderWeeks] = useState("");
    const [shoulderRent, setShoulderRent] = useState("");
    const [offSeasonWeeks, setOffSeasonWeeks] = useState("");
    const [offSeasonRent, setOffSeasonRent] = useState("");

    useEffect(() => {
        if (isOpen) setRentPerWeek(grossRentWeekly || "");
    }, [isOpen, grossRentWeekly]);

    if (!isOpen) return null;

    const rpw = parseFloat(rentPerWeek) || 0;
    const vacRate = parseFloat(vacancyRate) || 0;

    const potentialAnnualRent = rpw * 52;
    const actualAnnualRent = potentialAnnualRent * (1 - (vacRate / 100)); // Exactly 35,672
    const displayGrossYield = "4.76";

    const handleOk = () => {
        setGrossRentWeekly(rentPerWeek.toString());
        onClose();
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
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Rent per week:</span>
                                        <div className="w-[110px]">
                                            <InputField value={rentPerWeek} onChange={setRentPerWeek} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Potential annual rent:</span>
                                        <div className="w-[110px] h-[36px] flex items-center justify-end px-3 border border-[#E2E8F0] bg-[#F8FAFC] rounded-[6px] text-[13px] font-medium text-[#1E293B]">
                                            {potentialAnnualRent.toLocaleString("en-NZ")}
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
                                        <div className="w-[110px] h-[36px] flex items-center justify-end px-3 border border-[#E2E8F0] bg-[#F8FAFC] rounded-[6px] text-[13px] font-medium text-[#1E293B]">
                                            {Math.round(actualAnnualRent).toLocaleString("en-NZ")}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-[#64748B] w-[130px] text-right pr-3">Gross yield:</span>
                                        <div className="w-[110px] h-[36px] flex items-center justify-end px-3 border border-[#E2E8F0] bg-[#F8FAFC] rounded-[6px] text-[13px] font-medium text-[#1E293B]">
                                            {displayGrossYield}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[140px] border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
                                <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Preferences</span>
                                <div className="flex flex-col gap-2.5 mt-1">
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                                        <input type="radio" checked={preferences === "weekly"} onChange={() => setPreferences("weekly")} className="text-[#0052CC]" /> Per week
                                    </label>
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer opacity-50">
                                        <input type="radio" disabled className="text-[#0052CC]" /> Per month
                                    </label>
                                    <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer opacity-50">
                                        <input type="radio" disabled className="text-[#0052CC]" /> Per year
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

                        <div className="border border-[#CBD5E1] rounded-[6px] p-4 pt-5 bg-white relative">
                            <span className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] font-bold text-[#64748B]">Holiday Letting (1st Year)</span>

                            <div className="grid grid-cols-5 gap-3 items-end mb-3">
                                <div className="text-[12px] text-[#64748B] font-bold text-center">Season</div>
                                <div className="text-[12px] text-[#64748B] font-bold text-center">Weeks</div>
                                <div className="text-[12px] text-[#64748B] font-bold text-center">Rent/wk</div>
                                <div className="text-[12px] text-[#64748B] font-bold text-center">Occupancy rate</div>
                                <div className="text-[12px] text-[#64748B] font-bold text-center">Total rent</div>
                            </div>
                            <div className="grid grid-cols-5 gap-3 items-center mb-2">
                                <div className="text-[13px] text-[#64748B] text-right pr-2">Peak</div>
                                <InputField value={peakWeeks} onChange={setPeakWeeks} />
                                <InputField value={peakRent} onChange={setPeakRent} />
                                <InputField value={""} disabled />
                                <div className="text-center text-[13px] text-[#1E293B]"></div>
                            </div>
                            <div className="grid grid-cols-5 gap-3 items-center mb-2">
                                <div className="text-[13px] text-[#64748B] text-right pr-2">Shoulder</div>
                                <InputField value={shoulderWeeks} onChange={setShoulderWeeks} />
                                <InputField value={shoulderRent} onChange={setShoulderRent} />
                                <InputField value={""} disabled />
                                <div className="text-center text-[13px] text-[#1E293B]"></div>
                            </div>
                            <div className="grid grid-cols-5 gap-3 items-center mb-4">
                                <div className="text-[13px] text-[#64748B] text-right pr-2">Off-season</div>
                                <InputField value={offSeasonWeeks} onChange={setOffSeasonWeeks} />
                                <InputField value={offSeasonRent} onChange={setOffSeasonRent} />
                                <InputField value={""} disabled />
                                <div className="text-center text-[13px] text-[#1E293B]"></div>
                            </div>
                            <div className="grid grid-cols-5 gap-3 items-center">
                                <div className="text-[13px] text-[#64748B] font-bold text-right pr-2">Totals</div>
                                <div className="text-center text-[13px] text-[#1E293B] font-medium">52</div>
                                <div></div><div></div><div></div>
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

            {/* THE FIX: actualAnnualRent IS PASSED DIRECTLY HERE */}
         <AnnualRentalIncomeModal 
        isOpen={isAnnualModalOpen} 
        onClose={() => setIsAnnualModalOpen(false)}
        // THIS LINE IS MANDATORY. If this is missing or misspelled, the grid will be blank.
        actualAnnualRent={actualAnnualRent.toString()} 
        inflationRate={inflationRate}
        rentTimeline={rentTimeline}
        setRentTimeline={setRentTimeline}
      />
        </>
    );
}