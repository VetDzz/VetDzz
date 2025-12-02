import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if navbar is scrolled to determine text color
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'fr' as Language, name: 'Français', short: 'FR', flag: '🇫🇷' },
    { code: 'en' as Language, name: 'English', short: 'EN', flag: '🇺🇸' },
    { code: 'ar' as Language, name: 'العربية', short: 'AR', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full font-medium"
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-vet-light' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
