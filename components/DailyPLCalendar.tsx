"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Trade } from "@/components/TradeTable";

interface DailyPLCalendarProps {
  trades: Trade[];
}

export default function DailyPLCalendar({ trades }: DailyPLCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group trades by date
  const dailyData = useMemo(() => {
    const data: Record<string, { pl: number; count: number }> = {};

    trades.forEach((trade) => {
      const dateKey = format(new Date(trade.tradeDate), "yyyy-MM-dd");
      if (!data[dateKey]) {
        data[dateKey] = { pl: 0, count: 0 };
      }
      data[dateKey].pl += trade.profitLoss;
      data[dateKey].count += 1;
    });

    return data;
  }, [trades]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calculate empty cells for start of month alignment
  const startDay = getDay(startOfMonth(currentDate)); // 0 = Sunday, 1 = Monday...

  return (
    <Card className="col-span-4 lg:col-span-3 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Daily Performance
        </CardTitle>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-28 text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground mb-2">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {daysInMonth.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const data = dailyData[dateKey];
            const hasData = !!data;
            const isProfit = hasData && data.pl >= 0;
            // const isLoss = hasData && data.pl < 0; // implied

            let cellClass =
              "aspect-square flex flex-col items-center justify-center rounded-lg border text-xs transition-all p-1 shadow-sm";

            if (!hasData) {
              cellClass +=
                " border-border/40 text-muted-foreground/50 bg-secondary/20";
            } else if (isProfit) {
              cellClass +=
                " border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-bold";
            } else {
              cellClass +=
                " border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-bold";
            }

            return (
              <div
                key={day.toString()}
                className={cellClass}
                title={hasData ? `${data.count} trades` : undefined}
              >
                <span
                  className={`mb-1 text-[10px] ${
                    hasData ? "opacity-90" : "opacity-50"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {hasData && (
                  <span className="truncate w-full text-[10px] sm:text-xs">
                    {data.pl > 0 ? "+" : ""}
                    {data.pl.toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
