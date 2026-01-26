
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface SingleDatePickerProps {
    value: string | undefined | null;
    onChange: (date: string) => void;
    label?: string;
}

const SingleDatePicker: React.FC<SingleDatePickerProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to parse 'YYYY-MM-DD' as local date (midnight)
    const parseLocalYMD = (ymd: string) => {
        if (!ymd) return new Date();
        const [y, m, d] = ymd.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    // Helper to format Date as 'YYYY-MM-DD' local
    const formatLocalYMD = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Initialize
    const initialDate = value ? parseLocalYMD(value) : new Date();
    const validDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

    const [viewDate, setViewDate] = useState(new Date(validDate.getFullYear(), validDate.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? validDate : null);

    useEffect(() => {
        if (value) {
            const d = parseLocalYMD(value);
            if (!isNaN(d.getTime())) {
                setSelectedDate(d);
                setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
            } else {
                setSelectedDate(null);
            }
        } else {
            setSelectedDate(null);
        }
    }, [value]);

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getStartDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        // Convertir de Domingo=0..Sabado=6 a Lunes=0..Domingo=6
        return day === 0 ? 6 : day - 1;
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const renderMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysCount = getDaysInMonth(year, month);
        const offset = getStartDayOfMonth(year, month);
        const days = Array.from({ length: daysCount }, (_, i) => i + 1);

        return (
            <div className="w-full">
                <div className="text-center mb-6 flex justify-between items-center px-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h4 className="text-lg font-medium text-gray-800 lowercase">{months[month]} {year}</h4>
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="grid grid-cols-7 text-center gap-y-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                        <span key={d} className="text-[10px] font-black text-gray-400 mb-2">{d}</span>
                    ))}
                    {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
                    {days.map(day => {
                        const currentDayDate = new Date(year, month, day);
                        // Comparison by local YYYY-MM-DD
                        const isSelected = selectedDate &&
                            currentDayDate.getFullYear() === selectedDate.getFullYear() &&
                            currentDayDate.getMonth() === selectedDate.getMonth() &&
                            currentDayDate.getDate() === selectedDate.getDate();

                        return (
                            <div
                                key={day}
                                className="relative h-10 flex items-center justify-center cursor-pointer"
                                onClick={() => handleDateClick(currentDayDate)}
                            >
                                <span className={`z-10 text-xs font-bold w-8 h-8 flex items-center justify-center transition-all rounded-full
                  ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-700 hover:bg-gray-100'}
                `}>
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const displayText = useMemo(() => {
        if (!selectedDate) return 'dd/mm/aaaa';
        return selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }, [selectedDate]);

    return (
        <div className="relative mb-4">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none flex justify-between items-center hover:bg-gray-50 transition-all"
            >
                <span>{displayText}</span>
                <Calendar size={18} className="text-gray-400" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 mt-2 z-50 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 w-[320px] animate-in fade-in zoom-in-95 duration-200">

                        {renderMonth(viewDate)}

                        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                            <button
                                onClick={() => { setSelectedDate(null); onChange(''); setIsOpen(false); }}
                                className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
                            >
                                Limpiar
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedDate) onChange(formatLocalYMD(selectedDate));
                                        else onChange('');
                                        setIsOpen(false);
                                    }}
                                    className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SingleDatePicker;
