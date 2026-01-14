
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DateRange } from '../types';

interface DateRangePickerProps {
  onApply: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Default to current month and year
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selection, setSelection] = useState<DateRange>({ start: null, end: null });

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
    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: date, end: null });
    } else {
      if (date < selection.start) {
        setSelection({ start: date, end: selection.start });
      } else {
        setSelection({ ...selection, end: date });
      }
    }
  };

  const isSelected = (date: Date) => {
    return (selection.start && date.toDateString() === selection.start.toDateString()) || 
           (selection.end && date.toDateString() === selection.end.toDateString());
  };

  const isInRange = (date: Date) => {
    if (!selection.start || !selection.end) return false;
    return date > selection.start && date < selection.end;
  };

  const renderMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const offset = getStartDayOfMonth(year, month);
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="text-center mb-6">
          <h4 className="text-lg font-medium text-gray-800 lowercase">{months[month]} {year}</h4>
        </div>
        <div className="grid grid-cols-7 text-center gap-y-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <span key={d} className="text-[10px] font-black text-gray-400 mb-2">{d}</span>
          ))}
          {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const currentDayDate = new Date(year, month, day);
            const selected = isSelected(currentDayDate);
            const inRange = isInRange(currentDayDate);
            const isStart = selection.start && currentDayDate.toDateString() === selection.start.toDateString();
            const isEnd = selection.end && currentDayDate.toDateString() === selection.end.toDateString();
            
            return (
              <div 
                key={day} 
                className={`relative h-10 flex items-center justify-center cursor-pointer
                  ${inRange ? 'bg-gray-100' : ''}
                  ${isStart && selection.end ? 'bg-gray-100 rounded-l-full' : ''}
                  ${isEnd ? 'bg-gray-100 rounded-r-full' : ''}
                `}
                onClick={() => handleDateClick(currentDayDate)}
              >
                <span className={`z-10 text-xs font-bold w-8 h-8 flex items-center justify-center transition-all
                  ${selected ? 'bg-[#222] text-white rounded-full' : 'text-gray-900'}
                  ${!selected && !inRange ? 'hover:bg-gray-100 rounded-full' : ''}
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

  const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  const label = useMemo(() => {
    if (!selection.start) return "Seleccionar fechas";
    const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()].substring(0, 3)}.`;
    if (!selection.end) return fmt(selection.start);
    return `${fmt(selection.start)} - ${fmt(selection.end)} ${selection.end.getFullYear()}`;
  }, [selection, months]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-6 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-all duration-200 active:scale-95"
      >
        <Calendar size={16} className="text-blue-600" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{label}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-14 z-50 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 w-[700px] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="flex items-center justify-between absolute top-10 left-10 right-10 z-10 pointer-events-none">
              <button 
                onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 pointer-events-auto transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 pointer-events-auto transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex gap-12">
              {renderMonth(viewDate)}
              {renderMonth(nextMonthDate)}
            </div>

            <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-100">
              <button 
                onClick={() => { setSelection({ start: null, end: null }); onApply({ start: null, end: null }); setIsOpen(false); }}
                className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
              >
                Limpiar
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => { onApply(selection); setIsOpen(false); }}
                  className="px-8 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest active:scale-95"
                >
                  Aplicar Rango
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
