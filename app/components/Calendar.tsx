"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/lib/ThemeContext";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const lightColors = {
  card: "#ffffff",
  text: "#374151",
  textSec: "#6b7280",
  textMuted: "#9ca3af",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar({ deadlineDates }: { deadlineDates: string[] }) {
  const [mounted, setMounted] = useState(false);
  const { isDark, colors } = useTheme();
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const deadlineSet = new Set(deadlineDates);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const c = mounted ? colors : lightColors;
  const dark = mounted && isDark;

  return (
    <div style={{ background: c.card, borderRadius: 10, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", width: 280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: c.textSec, padding: "4px 8px" }}>‹</button>
        <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{year}年{month + 1}月</div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: c.textSec, padding: "4px 8px" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: 4 }}>
        {WEEKDAYS.map(w => (
          <div key={w} style={{ fontSize: 12, color: c.textMuted, padding: "4px 0" }}>{w}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const ds = dateStr(day);
          const hasDeadline = deadlineSet.has(ds);
          const isToday = ds === todayStr;
          return (
            <div key={i} style={{
              padding: "6px 0", fontSize: 13, borderRadius: 6,
              background: hasDeadline ? (dark ? "#422006" : "#fef3c7") : "transparent",
              color: isToday ? "#2563eb" : hasDeadline ? (dark ? "#fbbf24" : "#92400e") : c.text,
              fontWeight: isToday ? 700 : hasDeadline ? 600 : 400,
              outline: isToday ? "2px solid #2563eb" : "none",
              outlineOffset: -2,
            }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}