"use client";

import { type VisitorLog } from '@/lib/db';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';

export default function VisitorChart({ logs }: { logs: VisitorLog[] }) {
  if (!logs.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data for the selected period.
      </div>
    );
  }

  // Group logs by day
  const dateRange = {
    start: startOfDay(new Date(Math.min(...logs.map(l => new Date(l.checkInTime).getTime())))),
    end: startOfDay(new Date(Math.max(...logs.map(l => new Date(l.checkInTime).getTime()))))
  };

  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  
  const chartData = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = logs.filter(l => format(new Date(l.checkInTime), 'yyyy-MM-dd') === dayStr).length;
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
