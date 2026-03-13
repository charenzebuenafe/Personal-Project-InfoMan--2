"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db, type VisitorLog } from '@/lib/db';
import StatsOverview from '@/components/admin/stats-overview';
import VisitorChart from '@/components/admin/visitor-chart';
import AIInsights from '@/components/admin/ai-insights';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  useEffect(() => {
    setLogs(db.getLogs(dateRange.from, dateRange.to));
  }, [dateRange]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor NEU Library activity and trends.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={handlePrint} className="gap-2 bg-accent hover:bg-accent/90">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <StatsOverview logs={logs} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitor Inflow</CardTitle>
            <CardDescription>Daily visitor volume for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorChart logs={logs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Trend Analysis</CardTitle>
            <CardDescription>Generated insights based on library data</CardDescription>
          </CardHeader>
          <CardContent>
            <AIInsights logs={logs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>The most recent check-ins recorded in the terminal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Visitor Name</th>
                  <th className="px-6 py-3">College/Office</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.slice().reverse().slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 font-medium">{log.visitorName}</td>
                    <td className="px-6 py-4">{log.collegeOrOffice}</td>
                    <td className="px-6 py-4 capitalize">{log.purposeOfVisit}</td>
                    <td className="px-6 py-4">{format(new Date(log.checkInTime), 'MMM dd, p')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
