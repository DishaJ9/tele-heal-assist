import { Link, useLocation } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Activity, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-xl font-bold">{t.title}</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={isActive('/') ? "secondary" : "ghost"}
                className="text-primary-foreground hover:bg-primary-hover"
              >
                {t.dashboard}
              </Button>
            </Link>
            <Link to="/report">
              <Button 
                variant={isActive('/report') ? "secondary" : "ghost"}
                className="text-primary-foreground hover:bg-primary-hover"
              >
                {t.reportCase}
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/admin">
                  <Button 
                    variant={isActive('/admin') ? "secondary" : "ghost"}
                    className="text-primary-foreground hover:bg-primary-hover"
                  >
                    {t.adminDashboard}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOut}
                  className="text-primary-foreground hover:bg-primary-hover"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t.logout}
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  variant={isActive('/login') ? "secondary" : "ghost"}
                  className="text-primary-foreground hover:bg-primary-hover"
                >
                  {t.adminLogin}
                </Button>
              </Link>
            )}
          </nav>
          
          <LanguageToggle />
        </div>
        
        {/* Mobile navigation */}
        <nav className="md:hidden flex flex-wrap gap-2 mt-4">
          <Link to="/">
            <Button 
              variant={isActive('/') ? "secondary" : "ghost"}
              size="sm"
              className="text-primary-foreground hover:bg-primary-hover"
            >
              {t.dashboard}
            </Button>
          </Link>
          <Link to="/report">
            <Button 
              variant={isActive('/report') ? "secondary" : "ghost"}
              size="sm"
              className="text-primary-foreground hover:bg-primary-hover"
            >
              {t.reportCase}
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/admin">
                <Button 
                  variant={isActive('/admin') ? "secondary" : "ghost"}
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-hover"
                >
                  {t.adminDashboard}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={signOut}
                className="text-primary-foreground hover:bg-primary-hover"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t.logout}
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button 
                variant={isActive('/login') ? "secondary" : "ghost"}
                size="sm"
                className="text-primary-foreground hover:bg-primary-hover"
              >
                {t.adminLogin}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};