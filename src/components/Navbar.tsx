
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '@/components/LanguageSelector';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <motion.nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full backdrop-blur-0", isScrolled ? "bg-white shadow-sm" : "bg-vet-primary")}
      style={{ backgroundColor: isScrolled ? '#ffffff' : '#1E3A8A' }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/images/Logo.jpeg" 
                alt="VetDz Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className={cn("text-2xl font-bold", isScrolled ? "text-vet-primary" : "text-white")}>
                VetDz
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu className={cn(isScrolled ? "" : "text-white")}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-100 bg-transparent hover:bg-vet-dark")}>
                      {t('nav.home')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <button
                    onClick={handleFindvet}
                    className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-100 bg-transparent hover:bg-vet-dark")}
                  >
                    {(user?.type === 'vet' || user?.type === 'vet') ? t('nav.findClient') : t('nav.findLab')}
                  </button>
                </NavigationMenuItem>

                {/* My Results button for all users */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/results"
                      className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-100 bg-transparent hover:bg-vet-dark")}
                    >
                      {t('nav.results')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {(user?.type === 'vet' || user?.type === 'vet') && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/vet-dashboard?tab=requests"
                        className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-100 bg-transparent hover:bg-vet-dark")}
                      >
                        {t('nav.PADRequests')}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                <NavigationMenuItem>
                  <NotificationDropdown />
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <LanguageSelector />
                </NavigationMenuItem>

                {!isAuthenticated && (
                  <NavigationMenuItem>
                    <button
                      onClick={handleLogin}
                      className={cn("px-4 py-2 rounded-md transition-colors", isScrolled ? "bg-vet-primary text-white hover:bg-vet-accent" : "bg-white text-vet-dark hover:bg-gray-100")}
                    >
                      {t('nav.login')}
                    </button>
                  </NavigationMenuItem>
                )}

                {isAuthenticated && (
                  <NavigationMenuItem>
                    <button
                      onClick={handleLogin}
                      className="gap-2 hover:bg-vet-light bg-white text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={cn(
                "focus:outline-none p-2 rounded-md transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center",
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  : "text-white hover:bg-vet-dark active:bg-vet-accent"
              )}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Reduced height and simplified */}
      <div className={cn("md:hidden transition-all duration-300 overflow-hidden w-full", isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0")}>
        <div className="px-3 pt-2 pb-3 space-y-1 shadow-sm overflow-y-auto max-h-80 bg-white">
          <Link to="/" className="block px-3 py-3 rounded-md text-sm min-h-[44px] flex items-center touch-manipulation text-gray-700 hover:bg-gray-50 active:bg-gray-100" onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            {t('nav.home')}
          </Link>

          <button
            onClick={handleFindvet}
            className="block px-3 py-3 rounded-md text-sm w-full text-left min-h-[44px] flex items-center touch-manipulation text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          >
            {t('nav.findLab')}
          </button>

          <Link to="/results" className="block px-3 py-3 rounded-md text-sm min-h-[44px] flex items-center touch-manipulation text-gray-700 hover:bg-gray-50 active:bg-gray-100" onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            {t('nav.results')}
          </Link>

          {(user?.type === 'vet' || user?.type === 'vet') && (
            <Link to="/vet-dashboard?tab=requests" className="block px-3 py-3 rounded-md text-sm min-h-[44px] flex items-center touch-manipulation text-gray-700 hover:bg-gray-50 active:bg-gray-100" onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}>
              {t('nav.PADRequests')}
            </Link>
          )}

          <div className="px-3 py-1.5">
            <LanguageSelector />
          </div>

          {!isAuthenticated && (
            <button
              onClick={handleLogin}
              className="block w-full text-left px-3 py-3 rounded-md text-sm min-h-[44px] flex items-center touch-manipulation text-vet-dark bg-vet-light hover:bg-vet-primary hover:text-white active:bg-vet-accent"
            >
              {t('nav.login')}
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogin}
              className="block w-full text-left px-3 py-3 rounded-md text-sm min-h-[44px] flex items-center touch-manipulation whitespace-nowrap bg-white text-vet-primary border border-vet-primary hover:bg-vet-light active:bg-vet-accent"
            >
              {t('nav.logout')}
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
