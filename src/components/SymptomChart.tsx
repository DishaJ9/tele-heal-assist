import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SymptomData {
  date: string;
  fever: number;
  cough: number;
  diarrhea: number;
  rash: number;
  vomiting: number;
  breathlessness: number;
}

export const SymptomChart = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<SymptomData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymptomData = async () => {
      try {
        // Get last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: cases, error } = await supabase
          .from('case_reports')
          .select('symptoms, created_at')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at');

        if (error) throw error;

        // Group by date and count symptoms
        const groupedData: { [key: string]: SymptomData } = {};
        
        // Initialize last 7 days with zero counts
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          groupedData[dateStr] = {
            date: dateStr,
            fever: 0,
            cough: 0,
            diarrhea: 0,
            rash: 0,
            vomiting: 0,
            breathlessness: 0,
          };
        }

        // Count symptoms by date
        cases?.forEach(case_report => {
          const date = new Date(case_report.created_at).toISOString().split('T')[0];
          if (groupedData[date]) {
            case_report.symptoms.forEach((symptom: string) => {
              if (symptom in groupedData[date]) {
                (groupedData[date] as any)[symptom]++;
              }
            });
          }
        });

        setData(Object.values(groupedData));
      } catch (error) {
        console.error('Error fetching symptom data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSymptomData();
  }, []);

  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: t.fever,
        data: data.map(d => d.fever),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
      {
        label: t.cough,
        data: data.map(d => d.cough),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: t.diarrhea,
        data: data.map(d => d.diarrhea),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
      {
        label: t.rash,
        data: data.map(d => d.rash),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
      },
      {
        label: t.vomiting,
        data: data.map(d => d.vomiting),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.1,
      },
      {
        label: t.breathlessness,
        data: data.map(d => d.breathlessness),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Cases',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.symptomTrends}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">{t.loading}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.symptomTrends}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};