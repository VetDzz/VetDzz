
import { useState } from 'react';
import { Menu, X } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '@/components/LanguageSelector';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleFindvet = () => {
    if (isAuthenticated) {
      if (user?.type === 'vet' || user?.type === 'vet') {
        navigate('/vet-dashboard?tab=clients'); // Go to client search tab
      } else {
        navigate('/find-laboratory');
      }
    } else {
      navigate('/auth');
    }
    setIsMenuOpen(false);
  };

  const handleLogin = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      navigate('/auth');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full py-6 px-4 bg-transparent absolute top-0 left-0 right-0 z-50">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 ml-2">
          <img 
            src="/images/Logo.jpeg" 
            alt="VetDz Logo" 
            className="h-8 w-8 rounded-full object-cover"
          />
          <Link to="/" className="text-white text-xl font-semibold">
            VetDz
          </Link>
        </div>
        
        {/* Centered Navigation */}
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="text-white/80 hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              {t('nav.home')}
            </Link>
            <button
              onClick={handleFindvet}
              className="text-white/80 hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              {user?.type === 'vet' ? t('nav.findClient') : t('nav.findLab')}
            </button>
            <Link
              to="/results"
              className="text-white/80 hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              {t('nav.results')}
            </Link>
            {user?.type === 'vet' && (
              <Link
                to="/vet-dashboard?tab=requests"
                className="text-white/80 hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                {t('nav.PADRequests')}
              </Link>
            )}
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <NotificationDropdown />
            <LanguageSelector />
          </div>
          {!isAuthenticated ? (
            <Link to="/auth" className="hidden md:block">
              <Button variant="ghost" className="px-6 py-2 rounded-full font-medium text-white hover:bg-white/10 hover:text-white">
                {t('nav.login')}
              </Button>
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden md:block px-6 py-2 bg-white text-red-600 hover:bg-red-50 rounded-full font-medium shadow-sm transition-colors"
            >
              {t('nav.logout')}
            </button>
          )}
          <button
            onClick={toggleMenu}
            className="md:hidden focus:outline-none p-2 text-white"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-white border-t border-border">
          <nav className="flex flex-col gap-4 p-6">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#888888] hover:text-foreground text-lg py-2"
            >
              {t('nav.home')}
            </Link>
            <button
              onClick={handleFindvet}
              className="text-[#888888] hover:text-foreground text-lg py-2 text-left"
            >
              {t('nav.findLab')}
            </button>
            <Link
              to="/results"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#888888] hover:text-foreground text-lg py-2"
            >
              {t('nav.results')}
            </Link>
            {user?.type === 'vet' && (
              <Link
                to="/vet-dashboard?tab=requests"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#888888] hover:text-foreground text-lg py-2"
              >
                {t('nav.PADRequests')}
              </Link>
            )}
            {!isAuthenticated ? (
              <Link to="/auth" className="w-full mt-4" onClick={() => setIsMenuOpen(false)}>
                <Button variant="secondary" className="w-full px-6 py-2 rounded-full font-medium shadow-sm">
                  {t('nav.login')}
                </Button>
              </Link>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full mt-4 px-6 py-2 bg-white text-red-600 hover:bg-red-50 rounded-full font-medium shadow-sm transition-colors"
              >
                {t('nav.logout')}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
