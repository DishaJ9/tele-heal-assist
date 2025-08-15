import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Label 
        htmlFor="language-toggle" 
        className={`text-sm font-medium transition-colors ${
          language === 'en' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        English
      </Label>
      <Switch
        id="language-toggle"
        checked={language === 'te'}
        onCheckedChange={toggleLanguage}
        aria-label="Toggle language"
      />
      <Label 
        htmlFor="language-toggle"
        className={`text-sm font-medium transition-colors ${
          language === 'te' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        తెలుగు
      </Label>
    </div>
  );
};