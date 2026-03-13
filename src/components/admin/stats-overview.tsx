import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type VisitorLog } from '@/lib/db';
import { Users, Clock, Compass, TrendingUp } from 'lucide-react';

export default function StatsOverview({ logs }: { logs: VisitorLog[] }) {
  const totalVisitors = logs.length;
  
  // Find peak purpose
  const purposeCounts: Record<string, number> = {};
  logs.forEach(log => {
    purposeCounts[log.purposeOfVisit] = (purposeCounts[log.purposeOfVisit] || 0) + 1;
  });
  const peakPurpose = Object.entries(purposeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Find peak hour
  const hourCounts: Record<number, number> = {};
  logs.forEach(log => {
    const hour = new Date(log.checkInTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const peakTimeLabel = peakHour !== undefined ? `${peakHour}:00 - ${+peakHour + 1}:00` : 'N/A';

  const stats = [
    { title: 'Total Visits', value: totalVisitors, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Peak Purpose', value: peakPurpose, icon: Compass, color: 'text-cyan-500', bg: 'bg-cyan-50', capitalize: true },
    { title: 'Peak Hour', value: peakTimeLabel, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Unique Users', value: new Set(logs.map(l => l.visitorId)).size, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className={cn("text-2xl font-bold mt-1", stat.capitalize && "capitalize")}>{stat.value}</h3>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
