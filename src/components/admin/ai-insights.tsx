"use client";

import { useState, useEffect } from 'react';
import { adminVisitorTrendAnalysis, type AdminVisitorTrendAnalysisOutput } from '@/ai/flows/admin-visitor-trend-analysis';
import { type VisitorLog } from '@/lib/db';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AIInsights({ logs }: { logs: VisitorLog[] }) {
  const [insights, setInsights] = useState<AdminVisitorTrendAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      if (logs.length === 0) return;
      
      setLoading(true);
      setError(false);
      try {
        const result = await adminVisitorTrendAnalysis({
          visitorLogs: logs.map(l => ({
            checkInTime: l.checkInTime,
            purposeOfVisit: l.purposeOfVisit,
            collegeOrOffice: l.collegeOrOffice
          }))
        });
        setInsights(result);
      } catch (err) {
        console.error("AI Analysis error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Insufficient data for AI analysis.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Could not generate AI insights.</span>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Summary</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insights.overallSummary}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>Peak Times</span>
        </div>
        <ul className="text-sm space-y-1">
          {insights.peakVisitorTimes.map((time, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              {time}
            </li>
          ))}
        </ul>
      </div>

      {insights.unusualActivities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Anomalies</span>
          </div>
          <ul className="text-sm space-y-1">
            {insights.unusualActivities.map((activity, idx) => (
              <li key={idx} className="text-amber-700">
                • {activity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
