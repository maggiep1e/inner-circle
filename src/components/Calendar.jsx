import { useState } from "react";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function SimpleCalendar({
  onSelectDate,
  selectedDates = [],
  entries = [],
}) {

  const today = new Date();
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const startDay = getStartDay(current.year, current.month);

  const monthName = new Date(
    current.year,
    current.month
  ).toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    setCurrent((prev) => {
      const month = prev.month - 1;
      if (month < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month };
    });
  };

  const nextMonth = () => {
    setCurrent((prev) => {
      const month = prev.month + 1;
      if (month > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month };
    });
  };

  const isSameDate = (d1, d2) =>
    d1.toDateString() === d2.toDateString();

  const isDone = (date) =>
  entries?.some(
    (e) => new Date(e.for_date).toDateString() === date.toDateString()
  );

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl">

      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth}>←</button>
        <h2 className="font-bold">
          {monthName} {current.year}
        </h2>
        <button onClick={nextMonth}>→</button>
      </div>


      <div className="grid grid-cols-7 text-xs text-center mb-2 text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
  
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(
            current.year,
            current.month,
            i + 1
          );

          const isToday = isSameDate(date, today);
          const isSelected = selectedDates.some((d) =>
            isSameDate(new Date(d), date)
          );

          return (
            <button
              key={i}
              onClick={() => onSelectDate?.(date)}
              className={`p-2 rounded text-sm transition
                ${isDone(date) ? "bg-green-500 text-white" : ""}
                ${isSelected ? "ring-2 ring-blue-500" : ""}
                ${
                  !isSelected &&
                  "hover:bg-gray-200 dark:hover:bg-zinc-700"
                }
                ${
                  isToday &&
                  "border border-blue-500"
                }
              `}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}