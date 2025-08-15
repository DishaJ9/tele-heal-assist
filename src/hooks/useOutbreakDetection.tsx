import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OutbreakAlert {
  mandal: string;
  symptom: string;
  count: number;
  threshold: number;
  date: string;
}

export const useOutbreakDetection = (mandal?: string) => {
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const checkOutbreaks = async () => {
    setLoading(true);
    try {
      // Get the last 7 days of data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: cases, error } = await supabase
        .from('case_reports')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Group cases by mandal and symptom
      const grouped = cases?.reduce((acc, case_report) => {
        case_report.symptoms.forEach((symptom: string) => {
          const key = `${case_report.mandal}-${symptom}`;
          if (!acc[key]) {
            acc[key] = {
              mandal: case_report.mandal,
              symptom,
              dailyCounts: {},
            };
          }
          
          const date = new Date(case_report.created_at).toDateString();
          acc[key].dailyCounts[date] = (acc[key].dailyCounts[date] || 0) + 1;
        });
        return acc;
      }, {} as any) || {};

      // Calculate outbreak alerts
      const today = new Date().toDateString();
      const outbreakAlerts: OutbreakAlert[] = [];

      Object.values(grouped).forEach((group: any) => {
        const counts = Object.values(group.dailyCounts) as number[];
        if (counts.length >= 3) { // Need at least 3 days of data
          const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
          const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
          const stdDev = Math.sqrt(variance);
          
          const todayCount = group.dailyCounts[today] || 0;
          const threshold = mean + (2 * stdDev);
          
          if (todayCount > threshold && todayCount > 0) {
            outbreakAlerts.push({
              mandal: group.mandal,
              symptom: group.symptom,
              count: todayCount,
              threshold: Math.round(threshold * 100) / 100,
              date: today,
            });
          }
        }
      });

      // Filter by mandal if specified
      const filteredAlerts = mandal 
        ? outbreakAlerts.filter(alert => alert.mandal.toLowerCase() === mandal.toLowerCase())
        : outbreakAlerts;

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error checking outbreaks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOutbreaks();
  }, [mandal]);

  return { alerts, loading, checkOutbreaks };
};