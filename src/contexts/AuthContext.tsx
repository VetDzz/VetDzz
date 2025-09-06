import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser, createClientProfile, createLaboratoryProfile, createNotification, subscribeToUserChanges, checkUserExists } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/utils/urlConfig';

export type UserType = 'client' | 'laboratory' | 'clinique';

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  isAuthenticated: boolean;
  supabaseUser?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<{ success: boolean; userType?: UserType }>;
  logout: () => Promise<void>;
  register: (userData: any, userType: UserType) => Promise<boolean>;
  requireAuth: () => boolean;
  checkBanStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Helper function to create user profile
  const createUserProfile = async (userId: string, userData: any, userType: UserType) => {
    try {

      if (userType === 'client') {
        const fullName = `${userData.firstName} ${userData.lastName}`;

        // Insert or update client profile (handle duplicates)
        const { data: profileData, error: profileError } = await supabase
          .from('client_profiles')
          .upsert([{
            user_id: userId,
            full_name: fullName,
            email: userData.email,
            phone: userData.phone || '',
            date_of_birth: userData.dateOfBirth || null,
            address: userData.address || '',
            emergency_contact_name: userData.emergencyContact || '',
            is_verified: true
          }], {
            onConflict: 'user_id'
          })
          .select();

        if (profileError) {

          alert(`❌ Profile creation failed: ${profileError.message}`);
        } else {

          // No success alert for client
        }
      } else if (userType === 'laboratory') {

        // Build payload only with defined fields to avoid overwriting existing data with null/empty
        const labPayload: any = { user_id: userId, is_verified: true };
        if (userData.labName) { labPayload.laboratory_name = userData.labName; labPayload.lab_name = userData.labName; }
        if (userData.email) labPayload.email = userData.email;
        if (userData.phone) labPayload.phone = userData.phone;
        if (userData.address) labPayload.address = userData.address;

        if (typeof userData.latitude === 'number') labPayload.latitude = userData.latitude;
        if (typeof userData.longitude === 'number') labPayload.longitude = userData.longitude;
        if (userData.openingHours) labPayload.opening_hours = userData.openingHours;
        if (Array.isArray(userData.openingDays)) labPayload.opening_days = userData.openingDays;
        if (typeof userData.description === 'string') labPayload.description = userData.description;

        // Insert or update laboratory profile (handle duplicates) without null clobbering
        const { data: profileData, error: profileError } = await supabase
          .from('laboratory_profiles')
          .upsert([labPayload], {
            onConflict: 'user_id'
          })
          .select();

        if (profileError) {

          alert(`❌ Laboratory profile creation failed: ${profileError.message}`);
        } else {

          // No success alert for laboratory
        }
      } else if (userType === 'clinique') {

        // Build payload only with defined fields to avoid overwriting existing data with null/empty
        const cliniquePayload: any = { user_id: userId, is_verified: true };
        if (userData.labName) { cliniquePayload.laboratory_name = userData.labName; cliniquePayload.lab_name = userData.labName; }
        if (userData.email) cliniquePayload.email = userData.email;
        if (userData.phone) cliniquePayload.phone = userData.phone;
        if (userData.address) cliniquePayload.address = userData.address;

        if (typeof userData.latitude === 'number') cliniquePayload.latitude = userData.latitude;
        if (typeof userData.longitude === 'number') cliniquePayload.longitude = userData.longitude;
        if (userData.openingHours) cliniquePayload.opening_hours = userData.openingHours;
        if (Array.isArray(userData.openingDays)) cliniquePayload.opening_days = userData.openingDays;
        if (typeof userData.description === 'string') cliniquePayload.description = userData.description;

        // Insert or update clinique profile (handle duplicates) without null clobbering
        const { data: profileData, error: profileError } = await supabase
          .from('clinique_profiles')
          .upsert([cliniquePayload], {
            onConflict: 'user_id'
          })
          .select();

        if (profileError) {

          alert(`❌ Clinique profile creation failed: ${profileError.message}`);
        } else {

          // No success alert for clinique
        }
      }
    } catch (profileError) {

    }
  };

  const login = async (email: string, password: string, userType: UserType): Promise<{ success: boolean; userType?: UserType }> => {
    try {

      const startTime = Date.now();

      const { data, error } = await signIn(email, password);

      if (error) {

        return { success: false };
      }

      if (data.user) {

        // Check if user is banned IMMEDIATELY
        try {
          const { data: banInfo, error: banError } = await supabase.rpc('get_ban_info', {
            check_user_id: data.user.id
          });

          if (!banError && banInfo?.banned) {

            // Store ban info and redirect to banned page
            localStorage.setItem('banInfo', JSON.stringify(banInfo));

            // Sign out the user immediately
            await signOut();

            // Redirect to banned page
            window.location.href = '/banned';

            return { success: false };
          }
        } catch (banCheckError) {

          // Continue with login if ban check fails
        }

        // Check if this is an admin (prefer role from profiles; fallback to specific email)
        let isAdmin = false;
        try {
          const { data: profileRow, error: profileErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          if (!profileErr && profileRow?.role === 'admin') {
            isAdmin = true;
          }
        } catch (e) {

        }

        if (!isAdmin && data.user.email === 'glowyboy01@gmail.com') {
          isAdmin = true;
        }

        if (isAdmin) {

          // Bypass email verification for admin to reduce friction
          if (!data.user.email_confirmed_at) {

          }

          const adminUserData: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: 'Admin',
            type: 'admin' as any,
            isAuthenticated: true,
            supabaseUser: data.user
          };

          setUser(adminUserData);
          localStorage.setItem('user', JSON.stringify(adminUserData));

          // Redirect to admin panel
          setTimeout(() => {
            window.location.href = '/admin';
          }, 100);

          return { success: true, userType: 'admin' as any };
        }

        const actualUserType = data.user.user_metadata?.user_type || userType;
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.first_name || data.user.user_metadata?.lab_name || 'User',
          type: actualUserType,
          isAuthenticated: true,
          supabaseUser: data.user
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true, userType: actualUserType };
      }

      return { success: false };
    } catch (error) {

      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {

    }
  };

  const register = async (userData: any, userType: UserType): Promise<boolean> => {
    try {
      const { data, error } = await signUp(userData.email, userData.password, userType, userData);

      if (error) {

        return false;
      }

      if (data.user) {

        // Create profile immediately (no waiting)

        await createUserProfile(data.user.id, userData, userType);

        // Create user object
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: userType === 'client' ? `${userData.firstName} ${userData.lastName}` : userData.labName,
          type: userType,
          isAuthenticated: true,
          supabaseUser: data.user
        };

        // Don't set user as authenticated until email is verified
        // Store pending user data for after verification
        if (!data.session) {
          // User needs to verify email
          localStorage.setItem('pendingUserData', JSON.stringify({
            userData,
            userType,
            userId: data.user.id
          }));

        } else {
          // User is immediately authenticated (email verification disabled)
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
        }

        return true;
      }

      return false;
    } catch (error) {

      return false;
    }
  };

  const requireAuth = (): boolean => {
    return user?.isAuthenticated || false;
  };

  // Manual ban check function that can be called anytime
  const checkBanStatus = async () => {
    if (!user?.id) return;

    try {

      const { data: banInfo, error } = await supabase.rpc('get_ban_info', {
        check_user_id: user.id
      });

      if (!error && banInfo?.banned) {

        // Clear everything immediately
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('pendingUserData');
        sessionStorage.clear();

        // Store ban info for the banned page
        localStorage.setItem('banInfo', JSON.stringify(banInfo));

        // Sign out from Supabase
        await supabase.auth.signOut();

        // Force redirect to banned page
        window.location.href = '/banned';
        return true; // User was banned
      }

      return false; // User not banned
    } catch (error) {

      return false;
    }
  };

  // Check for existing user on mount and listen to auth changes
  useEffect(() => {
    // Get initial session (OPTIMIZED)
    const getInitialSession = async () => {
      try {

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.first_name || session.user.user_metadata?.lab_name || 'User',
            type: session.user.user_metadata?.user_type || 'client',
            isAuthenticated: true,
            supabaseUser: session.user
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {

        }
      } catch (error) {

      }
    };

    getInitialSession();

    // Listen for auth changes (OPTIMIZED FOR SPEED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === 'SIGNED_IN' && session?.user) {
          // Skip user existence check for faster login
          // Only check if there's pending user data for profile creation
          const pendingData = localStorage.getItem('pendingUserData');
          if (pendingData) {
            try {
              const { userData, userType, userId } = JSON.parse(pendingData);

              await createUserProfile(userId, userData, userType);
              localStorage.removeItem('pendingUserData');
            } catch (error) {

              localStorage.removeItem('pendingUserData');
            }
          }

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.first_name || session.user.user_metadata?.lab_name || 'User',
            type: session.user.user_metadata?.user_type || 'client',
            isAuthenticated: true,
            supabaseUser: session.user
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Handle both logout and user deletion
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('pendingUserData');
          sessionStorage.clear();

          // If user was deleted, redirect to a special page
          if (event === 'USER_DELETED') {

            window.location.href = '/account-removed';
          }
        } else if (event === 'TOKEN_REFRESHED' && !session) {
          // Handle case where token refresh fails (user might be deleted)

          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('pendingUserData');
          sessionStorage.clear();
          window.location.href = '/account-removed';
        }
        // Removed TOKEN_REFRESHED check for better performance
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Monitor user deletion in real-time
  useEffect(() => {
    if (!user?.id) return;

    const handleUserDeleted = () => {

      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('pendingUserData');
      sessionStorage.clear();
      window.location.href = '/account-removed';
    };

    // Subscribe to user changes
    const userSubscription = subscribeToUserChanges(user.id, handleUserDeleted);

    // Periodic check (every 5 seconds) to ensure user still exists and is not banned
    const checkInterval = setInterval(async () => {

      const userExists = await checkUserExists(user.id);
      if (!userExists) {

        handleUserDeleted();
        return;
      }

      // Check if user is banned
      try {

        const { data: banInfo, error } = await supabase.rpc('get_ban_info', {
          check_user_id: user.id
        });

        if (!error && banInfo?.banned) {

          // Clear everything
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('pendingUserData');
          sessionStorage.clear();

          // Store ban info for the banned page
          localStorage.setItem('banInfo', JSON.stringify(banInfo));

          // Sign out from Supabase
          await supabase.auth.signOut();

          // Force redirect to banned page
          window.location.href = '/banned';
          return; // Stop execution
        } else {

        }
      } catch (banError) {

      }
    }, 5000); // Check every 5 seconds instead of 30

    return () => {
      userSubscription.unsubscribe();
      clearInterval(checkInterval);
    };
  }, [user?.id]);

  const isAuthenticated = user?.isAuthenticated || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        requireAuth,
        checkBanStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
