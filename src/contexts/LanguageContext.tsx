import React, { createContext, useContext, useState, ReactNode } from 'react';

// Translation type
export type Language = 'en' | 'te';

// Translation interface
interface Translations {
  // Header
  title: string;
  switchToTelugu: string;
  switchToEnglish: string;
  
  // Navigation
  dashboard: string;
  reportCase: string;
  adminLogin: string;
  logout: string;
  
  // Dashboard
  todayCases: string;
  recentAlerts: string;
  symptomTrends: string;
  noAlerts: string;
  outbreakAlert: string;
  cases: string;
  
  // Report Form
  reportNewCase: string;
  village: string;
  mandal: string;
  district: string;
  ageGroup: string;
  gender: string;
  symptoms: string;
  notes: string;
  reporterName: string;
  phoneNumber: string;
  submitReport: string;
  reportSubmitted: string;
  
  // Age Groups
  ageGroup0to5: string;
  ageGroup6to18: string;
  ageGroup19to45: string;
  ageGroup46to60: string;
  ageGroup60plus: string;
  
  // Gender
  male: string;
  female: string;
  other: string;
  
  // Symptoms
  fever: string;
  cough: string;
  diarrhea: string;
  rash: string;
  vomiting: string;
  breathlessness: string;
  
  // Admin
  adminDashboard: string;
  allReports: string;
  downloadCSV: string;
  filterByMandal: string;
  filterBySymptom: string;
  outbreakDetected: string;
  normal: string;
  
  // Form validation
  required: string;
  invalidPhone: string;
  
  // Alerts
  outbreakWarning: string;
  noOutbreakInArea: string;
  
  // Login
  login: string;
  email: string;
  password: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
}

// English translations
const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: 'Disease Outbreak Reporting',
    switchToTelugu: 'తెలుగు',
    switchToEnglish: 'English',
    
    // Navigation
    dashboard: 'Dashboard',
    reportCase: 'Report Case',
    adminLogin: 'Admin Login',
    logout: 'Logout',
    
    // Dashboard
    todayCases: "Today's Cases",
    recentAlerts: 'Recent Alerts',
    symptomTrends: 'Symptom Trends (7 days)',
    noAlerts: 'No alerts today',
    outbreakAlert: 'OUTBREAK ALERT',
    cases: 'cases',
    
    // Report Form
    reportNewCase: 'Report New Case',
    village: 'Village',
    mandal: 'Mandal',
    district: 'District',
    ageGroup: 'Age Group',
    gender: 'Gender',
    symptoms: 'Symptoms',
    notes: 'Additional Notes',
    reporterName: 'Reporter Name',
    phoneNumber: 'Phone Number',
    submitReport: 'Submit Report',
    reportSubmitted: 'Report submitted successfully!',
    
    // Age Groups
    ageGroup0to5: '0-5 years',
    ageGroup6to18: '6-18 years',
    ageGroup19to45: '19-45 years',
    ageGroup46to60: '46-60 years',
    ageGroup60plus: '60+ years',
    
    // Gender
    male: 'Male',
    female: 'Female',
    other: 'Other',
    
    // Symptoms
    fever: 'Fever',
    cough: 'Cough',
    diarrhea: 'Diarrhea',
    rash: 'Rash',
    vomiting: 'Vomiting',
    breathlessness: 'Breathlessness',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    allReports: 'All Reports',
    downloadCSV: 'Download CSV',
    filterByMandal: 'Filter by Mandal',
    filterBySymptom: 'Filter by Symptom',
    outbreakDetected: 'OUTBREAK',
    normal: 'Normal',
    
    // Form validation
    required: 'This field is required',
    invalidPhone: 'Please enter a valid 10-digit phone number',
    
    // Alerts
    outbreakWarning: 'WARNING: There is an active outbreak alert in your selected Mandal!',
    noOutbreakInArea: 'No active outbreak alerts in your area.',
    
    // Login
    login: 'Login',
    email: 'Email',
    password: 'Password',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  te: {
    // Header
    title: 'వ్యాధి వ్యాప్తి నివేదన',
    switchToTelugu: 'తెలుగు',
    switchToEnglish: 'English',
    
    // Navigation
    dashboard: 'డాష్‌బోర్డ్',
    reportCase: 'కేసు నివేదించండి',
    adminLogin: 'అడ్మిన్ లాగిన్',
    logout: 'లాగ్ అవుట్',
    
    // Dashboard
    todayCases: 'నేటి కేసులు',
    recentAlerts: 'ఇటీవలి హెచ్చరికలు',
    symptomTrends: 'లక్షణాల ధోరణులు (7 రోజులు)',
    noAlerts: 'నేడు హెచ్చరికలు లేవు',
    outbreakAlert: 'వ్యాప్తి హెచ్చరిక',
    cases: 'కేసులు',
    
    // Report Form
    reportNewCase: 'కొత్త కేసు నివేదించండి',
    village: 'గ్రామం',
    mandal: 'మండలం',
    district: 'జిల్లా',
    ageGroup: 'వయస్సు వర్గం',
    gender: 'లింగం',
    symptoms: 'లక్షణాలు',
    notes: 'అదనపు వివరాలు',
    reporterName: 'సమర్పించిన వారు',
    phoneNumber: 'మొబైల్ నంబర్',
    submitReport: 'నివేదిక సమర్పించండి',
    reportSubmitted: 'నివేదిక విజయవంతంగా సమర్పించబడింది!',
    
    // Age Groups
    ageGroup0to5: '0-5 సంవత్సరాలు',
    ageGroup6to18: '6-18 సంవత్సరాలు',
    ageGroup19to45: '19-45 సంవత్సరాలు',
    ageGroup46to60: '46-60 సంవత్సరాలు',
    ageGroup60plus: '60+ సంవత్సరాలు',
    
    // Gender
    male: 'పురుషుడు',
    female: 'మహిళ',
    other: 'ఇతరులు',
    
    // Symptoms
    fever: 'జ్వరం',
    cough: 'దగిమి',
    diarrhea: 'విరేచనాలు',
    rash: 'దద్దుర్లు',
    vomiting: 'వాంతులు',
    breathlessness: 'శ్వాసకోశ ఇబ్బంది',
    
    // Admin
    adminDashboard: 'అడ్మిన్ డాష్‌బోర్డ్',
    allReports: 'అన్ని నివేదికలు',
    downloadCSV: 'CSV డౌన్‌లోడ్',
    filterByMandal: 'మండలం ద్వారా ఫిల్టర్',
    filterBySymptom: 'లక్షణాల ద్వారా ఫిల్టర్',
    outbreakDetected: 'వ్యాప్తి',
    normal: 'సాధారణ',
    
    // Form validation
    required: 'ఈ ఫీల్డ్ అవసరం',
    invalidPhone: 'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి',
    
    // Alerts
    outbreakWarning: 'హెచ్చరిక: మీ ఎంచుకున్న మండలంలో చురుకైన వ్యాప్తి హెచ్చరిక ఉంది!',
    noOutbreakInArea: 'మీ ప్రాంతంలో చురుకైన వ్యాప్తి హెచ్చరికలు లేవు.',
    
    // Login
    login: 'లాగిన్',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    
    // Common
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం',
    success: 'యజయం',
  },
};

// Context interface
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  const value = {
    language,
    toggleLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};