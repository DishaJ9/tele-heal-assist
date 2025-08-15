import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useOutbreakDetection } from '@/hooks/useOutbreakDetection';
import { supabase } from '@/integrations/supabase/client';
import { Download, Filter, Shield } from 'lucide-react';

interface CaseReport {
  id: string;
  village: string;
  mandal: string;
  district: string;
  age_group: string;
  gender: string;
  symptoms: string[];
  notes: string;
  reporter_name: string;
  phone_number: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { alerts } = useOutbreakDetection();
  
  const [cases, setCases] = useState<CaseReport[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [mandalFilter, setMandalFilter] = useState<string>('');
  const [symptomFilter, setSymptomFilter] = useState<string>('');
  const [mandals, setMandals] = useState<string[]>([]);
  const [symptoms] = useState(['fever', 'cough', 'diarrhea', 'rash', 'vomiting', 'breathlessness']);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('case_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setCases(data || []);
        
        // Extract unique mandals
        const uniqueMandals = [...new Set(data?.map(c => c.mandal) || [])];
        setMandals(uniqueMandals);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCases();
    }
  }, [user]);

  // Filter cases based on selected filters
  useEffect(() => {
    let filtered = cases;

    if (mandalFilter) {
      filtered = filtered.filter(c => c.mandal.toLowerCase().includes(mandalFilter.toLowerCase()));
    }

    if (symptomFilter) {
      filtered = filtered.filter(c => c.symptoms.includes(symptomFilter));
    }

    setFilteredCases(filtered);
  }, [cases, mandalFilter, symptomFilter]);

  const downloadCSV = () => {
    const headers = [
      'Date', 'Village', 'Mandal', 'District', 'Age Group', 'Gender', 
      'Symptoms', 'Notes', 'Reporter Name', 'Phone Number', 'Status'
    ];
    
    const csvData = filteredCases.map(case_report => {
      const isOutbreak = alerts.some(alert => 
        alert.mandal.toLowerCase() === case_report.mandal.toLowerCase() &&
        case_report.symptoms.includes(alert.symptom)
      );
      
      return [
        new Date(case_report.created_at).toLocaleDateString(),
        case_report.village,
        case_report.mandal,
        case_report.district,
        case_report.age_group,
        case_report.gender,
        case_report.symptoms.join('; '),
        case_report.notes,
        case_report.reporter_name,
        case_report.phone_number,
        isOutbreak ? 'OUTBREAK' : 'Normal'
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `outbreak_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOutbreakCase = (case_report: CaseReport) => {
    return alerts.some(alert => 
      alert.mandal.toLowerCase() === case_report.mandal.toLowerCase() &&
      case_report.symptoms.includes(alert.symptom)
    );
  };

  if (authLoading || loading) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            {t.adminDashboard}
          </h1>
          <p className="text-muted-foreground">
            {t.allReports} - {filteredCases.length} records
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.filterByMandal}</label>
                <Select value={mandalFilter} onValueChange={setMandalFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Mandals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Mandals</SelectItem>
                    {mandals.map(mandal => (
                      <SelectItem key={mandal} value={mandal}>{mandal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.filterBySymptom}</label>
                <Select value={symptomFilter} onValueChange={setSymptomFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Symptoms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Symptoms</SelectItem>
                    {symptoms.map(symptom => (
                      <SelectItem key={symptom} value={symptom}>
                        {(t as any)[symptom]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={downloadCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t.downloadCSV}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t.allReports}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Demographics</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((case_report) => (
                    <TableRow 
                      key={case_report.id}
                      className={isOutbreakCase(case_report) ? 'bg-alert/5 border-alert/20' : ''}
                    >
                      <TableCell className="font-mono text-sm">
                        {new Date(case_report.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{case_report.village}</div>
                          <div className="text-sm text-muted-foreground">
                            {case_report.mandal}, {case_report.district}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{case_report.age_group} years</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {(t as any)[case_report.gender]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {case_report.symptoms.map((symptom, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {(t as any)[symptom] || symptom}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{case_report.reporter_name}</div>
                          <div className="text-xs text-muted-foreground">{case_report.phone_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOutbreakCase(case_report) ? (
                          <Badge variant="destructive">{t.outbreakDetected}</Badge>
                        ) : (
                          <Badge variant="secondary">{t.normal}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No reports found matching the current filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};