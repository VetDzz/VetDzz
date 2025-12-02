
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FireCatProject from "./pages/FireCatProject";
import SportRetailProject from "./pages/SportRetailProject";
import WorkwearProject from "./pages/WorkwearProject";
import HockeyProject from "./pages/HockeyProject";
import PetProject from "./pages/PetProject";
import TechDetails from "./pages/TechDetails";
import DevelopmentProcess from "./pages/DevelopmentProcess";
import About from "./pages/About";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Blog from "./pages/Blog";
import BlogPostDetail from "./pages/BlogPostDetail";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import LaboratoryDashboardPage from "./pages/LaboratoryDashboardPage";
import BloodTestsService from "./pages/BloodTestsService";
import UrineTestsService from "./pages/UrineTestsService";
import HomeCollectionService from "./pages/HomeCollectionService";
import RapidResultsService from "./pages/RapidResultsService";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import ResultsPage from "./pages/ResultsPage";
import FindLaboratoryPage from "./pages/FindLaboratoryPage";
import UserRemovalNotice from "./components/UserRemovalNotice";
import BannedPage from "./pages/BannedPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LaboratoryRegistration from "./components/LaboratoryRegistration";
import CliniqueRegistration from "./components/CliniqueRegistration";
import LaboratoryHomePage from "./pages/LaboratoryHomePage";
import DatabaseStatus from "./pages/DatabaseStatus";
import CliniqueHome from "./components/CliniqueHome";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import AdminPage from "./pages/AdminPage";
import OAuthCompleteSignup from "./pages/OAuthCompleteSignup";

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes before considering it stale
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 2 times with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch data when window regains focus (for real-time updates)
        refetchOnWindowFocus: true,
        // Background refetch interval for critical data (every 2 minutes)
        refetchInterval: 2 * 60 * 1000,
        // Don't refetch on reconnect to reduce server load
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 2000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/oauth-complete" element={<OAuthCompleteSignup />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/account-removed" element={<UserRemovalNotice />} />
                  <Route path="/banned" element={<BannedPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/find-laboratory" element={
                    <ProtectedRoute>
                      <FindLaboratoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/client-dashboard" element={
                    <ProtectedRoute>
                      <ClientDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/laboratory-dashboard" element={
                    <ProtectedRoute>
                      <LaboratoryDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vet-dashboard" element={
                    <ProtectedRoute>
                      <LaboratoryDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/laboratory-registration" element={
                    <ProtectedRoute>
                      <LaboratoryRegistration />
                    </ProtectedRoute>
                  } />
                  <Route path="/vet-registration" element={
                    <ProtectedRoute>
                      <LaboratoryRegistration />
                    </ProtectedRoute>
                  } />
                  <Route path="/clinique-registration" element={
                    <ProtectedRoute>
                      <CliniqueRegistration />
                    </ProtectedRoute>
                  } />
                  <Route path="/laboratory-home" element={
                    <ProtectedRoute>
                      <LaboratoryHomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vet-home" element={
                    <ProtectedRoute>
                      <LaboratoryHomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/clinique-home" element={
                    <ProtectedRoute>
                      <CliniqueHome />
                    </ProtectedRoute>
                  } />
                  <Route path="/services/blood-tests" element={<BloodTestsService />} />
                  <Route path="/services/urine-tests" element={<UrineTestsService />} />
                  <Route path="/services/home-collection" element={<HomeCollectionService />} />
                  <Route path="/services/rapid-results" element={<RapidResultsService />} />
                  <Route path="/projects/firecat" element={<FireCatProject />} />
                  <Route path="/projects/sport-retail" element={<SportRetailProject />} />
                  <Route path="/projects/workwear" element={<WorkwearProject />} />
                  <Route path="/projects/hockey" element={<HockeyProject />} />
                  <Route path="/projects/pet-tracker" element={<PetProject />} />
                  <Route path="/tech-details" element={<TechDetails />} />
                  <Route path="/development-process" element={<DevelopmentProcess />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPostDetail />} />
                  <Route path="/database-status" element={<DatabaseStatus />} />
                  <Route path="/admin" element={<AdminPage />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
