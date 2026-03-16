
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Compass, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsOverview({ logs }: { logs: any[] }) {
  const totalVisitors = logs.length;
  
  // Find peak purpose
  const purposeCounts: Record<string, number> = {};
  logs.forEach(log => {
    const purpose = log.purposeName || 'N/A';
    purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
  });
  const peakPurpose = Object.entries(purposeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Find peak hour
  const hourCounts: Record<number, number> = {};
  logs.forEach(log => {
    if (log.checkInDateTime) {
      const hour = log.checkInDateTime.toDate().getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const peakTimeLabel = peakHour !== undefined ? `${peakHour}:00 - ${+peakHour + 1}:00` : 'N/A';

  const stats = [
    { title: 'Total Visits', value: totalVisitors, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Peak Purpose', value: peakPurpose, icon: Compass, color: 'text-accent-foreground', bg: 'bg-accent/20', capitalize: true },
    { title: 'Peak Hour', value: peakTimeLabel, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Unique Users', value: new Set(logs.map(l => l.userId)).size, icon: TrendingUp, color: 'text-accent-foreground', bg: 'bg-accent/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className={cn("text-2xl font-black mt-1 text-primary", stat.capitalize && "capitalize")}>{stat.value}</h3>
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
