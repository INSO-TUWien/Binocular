import { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../../../../components/icon';

interface WeekPickerProps {
  onChange?: (weekStart: Date) => void;
  initialWeek?: Date;
  onBack: () => void;
}

interface Week {
  start: Date;
  end: Date;
}

export default function WeekPicker({ onChange, onBack, initialWeek }: WeekPickerProps) {
  const [selectedWeek, setSelectedWeek] = useState<Date>(initialWeek || getCurrentWeek());
  const [currentMonth, setCurrentMonth] = useState<Date>(initialWeek || new Date());
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Sync with initialWeek when it changes from parent
  useEffect(() => {
    if (initialWeek) {
      setSelectedWeek(initialWeek);
      setCurrentMonth(initialWeek);
    }
  }, [initialWeek]);

  function getCurrentWeek(): Date {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    // If Sunday, go back 6 days, else go to Monday

    startOfWeek.setDate(now.getDate() + diff);

    return startOfWeek;
  }

  function getWeeksInMonth(date: Date): Week[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Start from the beginning of the previous month
    const startDate = new Date(year, month - 1, 1);
    const currentWeekStart = new Date(startDate);
    const day = startDate.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
    currentWeekStart.setDate(startDate.getDate() + diff);

    // End at the end of the next month
    const endDate = new Date(year, month + 2, 0);

    const weeks: Week[] = [];

    while (currentWeekStart <= endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);

      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(weekEnd),
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  }

  function formatWeek(week: Week): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = week.start.toLocaleDateString('en-US', options);
    const end = week.end.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  }

  function formatWeekShort(weekStart: Date): string {
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
  }

  function isSameWeek(week1: Date, week2: Date): boolean {
    return week1.getTime() === week2.getTime();
  }

  function previousMonth(): void {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 3));
  }

  function nextMonth(): void {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3));
  }

  function previousWeek(): void {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() - 7);
    setSelectedWeek(newWeek);
    if (onChange) onChange(newWeek);
  }

  function nextWeek(): void {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() + 7);
    setSelectedWeek(newWeek);
    if (onChange) onChange(newWeek);
  }

  function selectWeek(weekStart: Date): void {
    setSelectedWeek(weekStart);
    setIsPopupOpen(false);
    if (onChange) onChange(weekStart);
  }

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    }

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPopupOpen]);

  const weeks: Week[] = getWeeksInMonth(currentMonth);
  const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  const monthRangeLabel = `${prevMonthDate.toLocaleDateString('en-US', { month: 'short' })} - ${nextMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  return (
    <div className="mb-2 flex items-center gap-2">
      {onBack && (
        <button onClick={onBack} className="p-1 hover:bg-base-200 rounded transition-colors" aria-label="Back to activity timeline">
          <Icon name="chevron_back" size="w-5 h-5" />
        </button>
      )}

      <div className="bg-base-100 rounded shadow p-1 flex-1 relative">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={previousWeek}
            className="p-1 hover:bg-base-200 rounded transition-colors flex-shrink-0"
            aria-label="Previous week">
            <Icon name="chevron_left" size="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPopupOpen(!isPopupOpen)}
            className="flex-1 text-center hover:bg-base-200 rounded px-2 py-1 transition-colors relative">
            <div className="text-xs font-medium text-base-content flex items-center justify-center gap-1">
              <Icon name="calendar" size="w-4 h-4" />
              <span>{formatWeekShort(selectedWeek)}</span>
            </div>
          </button>

          <button onClick={nextWeek} className="p-1 hover:bg-base-200 rounded transition-colors flex-shrink-0" aria-label="Next week">
            <Icon name="chevron_right" size="w-4 h-4" />
          </button>
        </div>
        {/* Popup Calendar */}
        {isPopupOpen && (
          <div className="absolute z-50 mt-1 left-0 w-full max-w-sm" ref={popupRef}>
            <div className="bg-base-100 rounded-lg shadow-xl border border-base-300 p-4 max-h-80 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-base-200 rounded-lg transition-colors"
                  aria-label="Previous 3 months">
                  <Icon name="chevron_left" size="w-5 h-5" />
                </button>

                <h3 className="text-lg font-semibold text-base-content">{monthRangeLabel}</h3>

                <button onClick={nextMonth} className="p-2 hover:bg-base-200 rounded-lg transition-colors" aria-label="Next 3 months">
                  <Icon name="chevron_right" size="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-h-96 overflow-y-auto">
                {weeks.map((week: Week, index: number) => {
                  return (
                    <button
                      key={index}
                      onClick={() => selectWeek(week.start)}
                      className={`px-2 py-1.5 rounded text-center transition-all text-xs ${
                        isSameWeek(week.start, selectedWeek)
                          ? 'bg-primary text-primary-content shadow-md'
                          : 'bg-base-200 text-base-content hover:bg-base-300'
                      }`}>
                      <div className="font-medium leading-tight">{formatWeek(week)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
