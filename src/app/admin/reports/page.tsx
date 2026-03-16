"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Printer, 
  CalendarIcon, 
  Filter, 
  Search,
  Loader2,
  BarChart3,
  Users
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { COLLEGES } from '@/lib/db';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  const db = useFirestore();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [college, setCollege] = useState('All');
  const [visitorType, setVisitorType] = useState('All');

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'visit_logs'), orderBy('checkInDateTime', 'desc'));
  }, [db]);

  const { data: allLogs, isLoading } = useCollection(logsQuery);

  const filteredLogs = (allLogs || []).filter(log => {
    const logDate = log.checkInDateTime?.toDate() || new Date();
    const isInDateRange = (!dateRange.from || logDate >= startOfDay(dateRange.from)) && 
                         (!dateRange.to || logDate <= endOfDay(dateRange.to));
    const matchesCollege = college === 'All' || log.visitorCollegeOrOffice === college;
    const matchesType = visitorType === 'All' || 
                       (visitorType === 'Employee' && log.visitorIsEmployee) ||
                       (visitorType === 'Student' && !log.visitorIsEmployee);

    return isInDateRange && matchesCollege && matchesType;
  });

  const handlePrint = () => {
    window.print();
  };

  const stats = {
    total: filteredLogs.length,
    students: filteredLogs.filter(l => !l.visitorIsEmployee).length,
    employees: filteredLogs.filter(l => l.visitorIsEmployee).length,
    uniqueUsers: new Set(filteredLogs.map(l => l.userId)).size
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-primary">Library Reports</h1>
          <p className="text-muted-foreground">Generate and export visitor logistics and activity summaries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
          </div>

          <div className="space-y-2">
            <Label>College / Office</Label>
            <Select value={college} onValueChange={setCollege}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Affiliations</SelectItem>
                {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visitor Category</Label>
            <Select value={visitorType} onValueChange={setVisitorType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Visitors</SelectItem>
                <SelectItem value="Student">Students Only</SelectItem>
                <SelectItem value="Employee">Employees Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Total Visits</p>
                <h3 className="text-2xl font-black text-primary">{stats.total}</h3>
              </div>
              <FileText className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Unique Users</p>
                <h3 className="text-2xl font-black text-primary">{stats.uniqueUsers}</h3>
              </div>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Students</p>
                <h3 className="text-2xl font-black text-primary">{stats.students}</h3>
              </div>
              <BarChart3 className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Employees</p>
                <h3 className="text-2xl font-black text-primary">{stats.employees}</h3>
              </div>
              <BarChart3 className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Logistics Detail</CardTitle>
            <CardDescription>Comprehensive list of activity records for the selected filters.</CardDescription>
          </div>
          <Badge className="no-print">
            {filteredLogs.length} Records Found
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto border rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr className="border-b">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Visitor Name</th>
                  <th className="px-6 py-4">Affiliation</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                      No matching records found for this criteria.
                    </td>
                  </tr>
                ) : filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {log.checkInDateTime ? format(log.checkInDateTime.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {log.visitorName}
                    </td>
                    <td className="px-6 py-4">
                      {log.visitorCollegeOrOffice}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {log.purposeName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={log.visitorIsEmployee ? "outline" : "secondary"}>
                        {log.visitorIsEmployee ? 'Employee' : 'Student'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-[10px] text-muted-foreground mt-8 hidden print:block">
        Generated by NEU Library Flow System on {format(new Date(), 'PPPP p')}
      </div>
    </div>
  );
}