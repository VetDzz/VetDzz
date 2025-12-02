
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type PageLayoutProps = {
  children: React.ReactNode;
  showFooter?: boolean;
};

const PageLayout = ({ children, showFooter = true }: PageLayoutProps) => {
  const location = useLocation();

  // Effect to scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <Navbar />
      <main>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
