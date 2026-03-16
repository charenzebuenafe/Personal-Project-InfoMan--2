"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import StatsOverview from '@/components/admin/stats-overview';
import VisitorChart from '@/components/admin/visitor-chart';
import AIInsights from '@/components/admin/ai-insights';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, Filter, Loader2 } from 'lucide-react';
import { format, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const COLLEGES = [
  'All Colleges',
  'College of Arts and Sciences',
  'College of Engineering',
  'College of Computer Studies',
  'College of Business Administration',
  'College of Education',
  'College of Nursing',
  'College of Criminology',
  'College of Music',
  'Graduate School',
  'University Office',
  'Other'
];

const PURPOSES = [
  'All Purposes',
  'reading books',
  'research in thesis',
  'use of computer',
  'doing assignments'
];

export default function AdminDashboard() {
  const db = useFirestore();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subWeeks(new Date(), 1),
    to: new Date()
  });
  const [filterCollege, setFilterCollege] = useState('All Colleges');
  const [filterPurpose, setFilterPurpose] = useState('All Purposes');
  const [filterEmployee, setFilterEmployee] = useState('All Visitors');

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'visit_logs'), orderBy('checkInDateTime', 'desc'));
  }, [db]);

  const { data: allLogs, isLoading } = useCollection(logsQuery);

  const filteredLogs = (allLogs || []).filter(log => {
    const logDate = log.checkInDateTime?.toDate() || new Date();
    const isInDateRange = (!dateRange.from || logDate >= dateRange.from) && (!dateRange.to || logDate <= dateRange.to);
    const matchesCollege = filterCollege === 'All Colleges' || log.visitorCollegeOrOffice === filterCollege;
    const matchesPurpose = filterPurpose === 'All Purposes' || log.purposeName === filterPurpose;
    const matchesEmployee = filterEmployee === 'All Visitors' || 
      (filterEmployee === 'Employees Only' && log.visitorIsEmployee) ||
      (filterEmployee === 'Students Only' && !log.visitorIsEmployee);

    return isInDateRange && matchesCollege && matchesPurpose && matchesEmployee;
  });

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
        
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
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
          
          <Button onClick={handlePrint} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>College / Office</Label>
            <Select value={filterCollege} onValueChange={setFilterCollege}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visit Purpose</Label>
            <Select value={filterPurpose} onValueChange={setFilterPurpose}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURPOSES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visitor Type</Label>
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Visitors">All Visitors</SelectItem>
                <SelectItem value="Students Only">Students Only</SelectItem>
                <SelectItem value="Employees Only">Employees Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <StatsOverview logs={filteredLogs} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitor Inflow</CardTitle>
            <CardDescription>Daily visitor volume for the selected filters</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorChart logs={filteredLogs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Trend Analysis</CardTitle>
            <CardDescription>Generated insights based on filtered data</CardDescription>
          </CardHeader>
          <CardContent>
            <AIInsights logs={filteredLogs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Filtered check-ins matching your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-3">Visitor Name</th>
                  <th className="px-6 py-3">College/Office</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                ) : filteredLogs.slice(0, 20).map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 font-medium">{log.visitorName}</td>
                    <td className="px-6 py-4">{log.visitorCollegeOrOffice}</td>
                    <td className="px-6 py-4 capitalize">{log.purposeName}</td>
                    <td className="px-6 py-4">
                      {log.visitorIsEmployee ? (
                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded-full font-bold">Employee</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-bold">Student</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{log.checkInDateTime ? format(log.checkInDateTime.toDate(), 'MMM dd, p') : 'N/A'}</td>
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