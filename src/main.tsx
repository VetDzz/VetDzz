import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'

// Handle OAuth callback tokens BEFORE React renders
// This is needed because HashRouter conflicts with Supabase OAuth hash fragments
const handleOAuthRedirect = () => {
  const hash = window.location.hash;
  
  // Check if this is an OAuth callback with tokens
  // OAuth tokens come as: #access_token=...&token_type=...
  // But with HashRouter, we might get: #/auth/callback#access_token=...
  if (hash.includes('access_token=') && hash.includes('token_type=')) {
    // Extract the OAuth part from the hash
    const oauthPart = hash.includes('#/') 
      ? hash.split('#').slice(-1)[0] // Get the last hash fragment
      : hash.substring(1); // Remove leading #
    
    // Store tokens temporarily for Supabase to pick up
    // Supabase client will automatically detect and process these
    if (oauthPart.includes('access_token=')) {
      // Reconstruct the URL with just the OAuth hash for Supabase to process
      const cleanUrl = window.location.origin + window.location.pathname + '#' + oauthPart;
      window.history.replaceState(null, '', cleanUrl);
      
      // After a short delay, redirect to the callback page
      setTimeout(() => {
        window.location.href = window.location.origin + '/#/auth/callback';
      }, 100);
      return true;
    }
  }
  return false;
};

// Only render if not handling OAuth redirect
if (!handleOAuthRedirect()) {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
} else {
  // Show loading while handling OAuth
  document.getElementById("root")!.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb;">
      <div style="text-align: center;">
        <div style="width: 48px; height: 48px; border: 2px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <h2 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 8px;">Connexion en cours...</h2>
        <p style="color: #6b7280;">Veuillez patienter</p>
      </div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;
}
