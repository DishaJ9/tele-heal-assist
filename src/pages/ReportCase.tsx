import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOutbreakDetection } from '@/hooks/useOutbreakDetection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const createReportSchema = (t: any) => z.object({
  village: z.string().min(1, { message: t.required }),
  mandal: z.string().min(1, { message: t.required }),
  district: z.string().min(1, { message: t.required }),
  ageGroup: z.enum(['0-5', '6-18', '19-45', '46-60', '60+'], {
    required_error: t.required,
  }),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: t.required,
  }),
  symptoms: z.array(z.string()).min(1, { message: t.required }),
  notes: z.string().optional(),
  reporterName: z.string().min(1, { message: t.required }),
  phoneNumber: z
    .string()
    .min(1, { message: t.required })
    .regex(/^\d{10}$/, { message: t.invalidPhone }),
});

type ReportFormData = {
  village: string;
  mandal: string;
  district: string;
  ageGroup: '0-5' | '6-18' | '19-45' | '46-60' | '60+';
  gender: 'male' | 'female' | 'other';
  symptoms: string[];
  notes?: string;
  reporterName: string;
  phoneNumber: string;
};

const symptomsList = ['fever', 'cough', 'diarrhea', 'rash', 'vomiting', 'breathlessness'];
const ageGroups = ['0-5', '6-18', '19-45', '46-60', '60+'];
const genders = ['male', 'female', 'other'];

export const ReportCase = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMandal, setSelectedMandal] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const { alerts } = useOutbreakDetection(selectedMandal);
  
  const reportSchema = createReportSchema(t);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const watchedMandal = watch('mandal');

  // Update selectedMandal when form mandal changes
  React.useEffect(() => {
    if (watchedMandal) {
      setSelectedMandal(watchedMandal);
    }
  }, [watchedMandal]);

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    const newSymptoms = checked
      ? [...selectedSymptoms, symptom]
      : selectedSymptoms.filter(s => s !== symptom);
    
    setSelectedSymptoms(newSymptoms);
    setValue('symptoms', newSymptoms);
  };

  const onSubmit = async (data: ReportFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('case_reports')
        .insert([{
          village: data.village,
          mandal: data.mandal,
          district: data.district,
          age_group: data.ageGroup,
          gender: data.gender,
          symptoms: data.symptoms,
          notes: data.notes || '',
          reporter_name: data.reporterName,
          phone_number: data.phoneNumber,
        }]);

      if (error) throw error;

      toast({
        title: t.success,
        description: t.reportSubmitted,
      });

      // Reset form
      reset();
      setSelectedSymptoms([]);
      setSelectedMandal('');
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            {t.reportNewCase}
          </h1>
          <p className="text-muted-foreground">Please fill out all required fields to report a new case.</p>
        </div>

        {/* Outbreak Alert */}
        {alerts.length > 0 && (
          <Alert className="mb-6 border-alert bg-alert/10">
            <AlertTriangle className="h-4 w-4 text-alert" />
            <AlertDescription className="text-alert-foreground">
              {t.outbreakWarning}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t.reportNewCase}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village">{t.village} *</Label>
                  <Input
                    id="village"
                    {...register('village')}
                    placeholder={t.village}
                  />
                  {errors.village && (
                    <p className="text-sm text-destructive">{errors.village.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mandal">{t.mandal} *</Label>
                  <Input
                    id="mandal"
                    {...register('mandal')}
                    placeholder={t.mandal}
                  />
                  {errors.mandal && (
                    <p className="text-sm text-destructive">{errors.mandal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t.district} *</Label>
                  <Input
                    id="district"
                    {...register('district')}
                    placeholder={t.district}
                  />
                  {errors.district && (
                    <p className="text-sm text-destructive">{errors.district.message}</p>
                  )}
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.ageGroup} *</Label>
                  <Select onValueChange={(value) => setValue('ageGroup', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.ageGroup} />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map((age) => (
                        <SelectItem key={age} value={age}>
                          {(t as any)[`ageGroup${age.replace('-', 'to').replace('+', 'plus')}`] || age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ageGroup && (
                    <p className="text-sm text-destructive">{errors.ageGroup.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t.gender} *</Label>
                  <Select onValueChange={(value) => setValue('gender', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.gender} />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {(t as any)[gender]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-3">
                <Label>{t.symptoms} *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {symptomsList.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => 
                          handleSymptomChange(symptom, checked as boolean)
                        }
                      />
                      <Label htmlFor={symptom} className="text-sm font-normal">
                        {(t as any)[symptom]}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.symptoms && (
                  <p className="text-sm text-destructive">{errors.symptoms.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder={t.notes}
                  rows={3}
                />
              </div>

              {/* Reporter Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporterName">{t.reporterName} *</Label>
                  <Input
                    id="reporterName"
                    {...register('reporterName')}
                    placeholder={t.reporterName}
                  />
                  {errors.reporterName && (
                    <p className="text-sm text-destructive">{errors.reporterName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t.phoneNumber} *</Label>
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.loading}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t.submitReport}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};