
"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';

export default function VisitorChart({ logs }: { logs: any[] }) {
  if (!logs.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data for the selected filters.
      </div>
    );
  }

  // Get date range from logs or default to last 7 days
  const logDates = logs.map(l => l.checkInDateTime?.toDate().getTime()).filter(Boolean);
  const minDate = logDates.length ? new Date(Math.min(...logDates)) : subDays(new Date(), 7);
  const maxDate = logDates.length ? new Date(Math.max(...logDates)) : new Date();

  const dateRange = {
    start: startOfDay(minDate),
    end: startOfDay(maxDate)
  };

  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  
  const chartData = days.map(day => {
    const count = logs.filter(l => l.checkInDateTime && isSameDay(l.checkInDateTime.toDate(), day)).length;
    return {
      date: format(day, 'MMM dd'),
      count: count,
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ChartContainer
        config={{
          count: {
            label: "Visitors",
            color: "hsl(var(--primary))",
          },
        }}
      >
        <LineChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            minTickGap={32}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
