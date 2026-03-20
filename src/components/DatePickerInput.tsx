"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";

interface DatePickerInputProps {
  value: string; // "YYYY-MM-DD" format
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder,
  required,
  className = "",
  label,
}: DatePickerInputProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() =>
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Sync currentMonth when value changes externally
  useEffect(() => {
    if (value) setCurrentMonth(new Date(value));
  }, [value]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      onChange(`${yyyy}-${mm}-${dd}`);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  }, [handleDateSelect]);

  const handleClear = useCallback(() => {
    onChange("");
    setIsOpen(false);
  }, [onChange]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = [
    t("task.days.sun"),
    t("task.days.mon"),
    t("task.days.tue"),
    t("task.days.wed"),
    t("task.days.thu"),
    t("task.days.fri"),
    t("task.days.sat"),
  ];

  const displayValue = selectedDate
    ? format(selectedDate, "yyyy. MM. dd", { locale: ko })
    : "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border border-border rounded-xl text-left flex items-center justify-between transition-all
          ${isOpen ? "ring-2 ring-primary border-primary" : "hover:border-primary-dark"}
          ${!displayValue ? "text-text-muted" : "text-text"}
        `}
      >
        <span className="text-sm truncate">
          {displayValue || placeholder || t("datepicker.selectDate")}
        </span>
        <FiCalendar className="text-text-muted shrink-0 ml-1" size={14} />
      </button>

      {/* Calendar Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — mobile: dim overlay, desktop: transparent click-catcher */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-modal bg-black/20 sm:bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            {/* Calendar card
                mobile: fixed center overlay
                desktop (sm+): absolute dropdown below input */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="
                fixed left-4 right-4 top-1/2 -translate-y-1/2
                sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:bottom-full sm:translate-y-0 sm:mb-2
                z-modal w-auto sm:w-72
                bg-background-surface rounded-2xl border-2 border-border shadow-xl overflow-hidden
              "
            >
              {/* Month Header */}
              <div className="flex items-center justify-between px-4 py-2.5 sm:py-2 bg-primary/5">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 sm:p-1 rounded-lg hover:bg-primary/10 transition-colors text-text"
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-text">
                  {format(currentMonth, "yyyy년 M월", { locale: ko })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 sm:p-1 rounded-lg hover:bg-primary/10 transition-colors text-text"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 px-3 sm:px-2 pt-2 sm:pt-1.5">
                {weekDays.map((wd, i) => (
                  <div
                    key={i}
                    className={`text-center text-xs sm:text-[11px] font-semibold py-1 sm:py-0.5 ${
                      i === 0 ? "text-accent-dark" : i === 6 ? "text-primary-dark" : "text-text-muted"
                    }`}
                  >
                    {wd}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 px-3 sm:px-2 pb-2 sm:pb-1.5">
                {days.map((d, i) => {
                  const inMonth = isSameMonth(d, currentMonth);
                  const selected = selectedDate && isSameDay(d, selectedDate);
                  const today = isToday(d);
                  const dayOfWeek = d.getDay();

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDateSelect(d)}
                      className={`relative h-10 sm:h-8 flex items-center justify-center rounded-lg text-sm sm:text-xs transition-all
                        ${!inMonth ? "text-text-muted/30" : ""}
                        ${selected
                          ? "bg-primary text-white font-bold"
                          : today && inMonth
                          ? "bg-accent/15 text-accent-dark font-semibold"
                          : inMonth
                          ? dayOfWeek === 0
                            ? "text-accent-dark hover:bg-primary/10"
                            : dayOfWeek === 6
                            ? "text-primary-dark hover:bg-primary/10"
                            : "text-text hover:bg-primary/10"
                          : "hover:bg-track/50"
                        }
                      `}
                    >
                      {d.getDate()}
                      {today && inMonth && !selected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 sm:py-2 border-t border-border/50 bg-background">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-medium text-accent-dark hover:text-accent transition-colors px-2 py-1"
                >
                  {t("datepicker.clear")}
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="text-xs font-medium bg-primary/15 text-primary-dark hover:bg-primary/25 transition-colors px-3 py-1 rounded-lg"
                >
                  {t("datepicker.today")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
