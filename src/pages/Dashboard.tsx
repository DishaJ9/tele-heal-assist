import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOutbreakDetection } from '@/hooks/useOutbreakDetection';
import { SymptomChart } from '@/components/SymptomChart';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  todayCases: number;
  totalCases: number;
}

export const Dashboard = () => {
  const { t } = useLanguage();
  const { alerts, loading: alertsLoading } = useOutbreakDetection();
  const [stats, setStats] = useState<DashboardStats>({ todayCases: 0, totalCases: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get today's cases
        const { count: todayCount } = await supabase
          .from('case_reports')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Get total cases
        const { count: totalCount } = await supabase
          .from('case_reports')
          .select('*', { count: 'exact', head: true });

        setStats({
          todayCases: todayCount || 0,
          totalCases: totalCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || alertsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">{t.loading}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.dashboard}</h1>
          <p className="text-muted-foreground">
            {t.title} - {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Alert Banner */}
        {alerts.length > 0 && (
          <Alert className="mb-6 border-alert bg-alert/10">
            <AlertTriangle className="h-4 w-4 text-alert" />
            <AlertDescription className="text-alert-foreground">
              <strong>{t.outbreakAlert}:</strong> {alerts.length} outbreak{alerts.length > 1 ? 's' : ''} detected in different areas.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.todayCases}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.todayCases}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCases} total {t.cases}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.recentAlerts}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${alerts.length > 0 ? 'text-alert' : 'text-primary'}`}>
                {alerts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {alerts.length === 0 ? t.noAlerts : `${alerts.length} active alerts`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.todayCases > 0 ? '+' : ''}{stats.todayCases}
              </div>
              <p className="text-xs text-muted-foreground">Cases today</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-alert">{t.recentAlerts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-alert/20 rounded-lg bg-alert/5"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-alert">
                        {alert.mandal} - {(t as any)[alert.symptom] || alert.symptom}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {alert.count} {t.cases} (threshold: {alert.threshold})
                      </div>
                    </div>
                    <Badge variant="destructive">{t.outbreakDetected}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Symptom Trends Chart */}
        <SymptomChart />
      </div>
    </div>
  );
};