import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser, createClientProfile, createVetProfile, createNotification, subscribeToUserChanges, checkUserExists } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/utils/urlConfig';

export type UserType = 'client' | 'vet';

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

// Helper function to get user type from database with timeout
const getUserTypeFromDatabase = async (userId: string): Promise<UserType> => {
  console.log('[getUserTypeFromDatabase] Checking user type for:', userId);
  
  try {
    // Create a promise that rejects after 3 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 3000);
    });
    
    // Race between the query and timeout
    const result = await Promise.race([
      (async () => {
        console.log('[getUserTypeFromDatabase] Querying vet_profiles...');
        // Check if user has a vet profile (use maybeSingle to avoid errors)
        const { data: vetProfile, error: vetError } = await supabase
          .from('vet_profiles')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        console.log('[getUserTypeFromDatabase] Vet profile result:', vetProfile, 'Error:', vetError);
        
        if (vetProfile && !vetError) {
          console.log('[getUserTypeFromDatabase] User is VET');
          return 'vet';
        }
        
        console.log('[getUserTypeFromDatabase] Querying client_profiles...');
        // Check if user has a client profile (use maybeSingle to avoid errors)
        const { data: clientProfile, error: clientError } = await supabase
          .from('client_profiles')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        console.log('[getUserTypeFromDatabase] Client profile result:', clientProfile, 'Error:', clientError);
        
        if (clientProfile && !clientError) {
          console.log('[getUserTypeFromDatabase] User is CLIENT');
          return 'client';
        }
        
        console.log('[getUserTypeFromDatabase] No profile found, defaulting to client');
        return 'client';
      })(),
      timeoutPromise
    ]);
    
    return result;
  } catch (error) {
    console.error('[getUserTypeFromDatabase] Error or timeout:', error);
    // If timeout or error, default to client
    return 'client';
  }
};

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
      } else if (userType === 'vet') {

        // Build payload only with defined fields to avoid overwriting existing data with null/empty
        const labPayload: any = { user_id: userId, is_verified: true };
        if (userData.labName) { labPayload.vet_name = userData.labName; labPayload.clinic_name = userData.labName; }
        if (userData.email) labPayload.email = userData.email;
        if (userData.phone) labPayload.phone = userData.phone;
        if (userData.address) labPayload.address = userData.address;

        if (typeof userData.latitude === 'number') labPayload.latitude = userData.latitude;
        if (typeof userData.longitude === 'number') labPayload.longitude = userData.longitude;
        if (userData.openingHours) labPayload.opening_hours = userData.openingHours;
        if (Array.isArray(userData.openingDays)) labPayload.opening_days = userData.openingDays;
        if (typeof userData.description === 'string') labPayload.description = userData.description;

        // Insert or update vet profile (handle duplicates) without null clobbering
        const { data: profileData, error: profileError } = await supabase
          .from('vet_profiles')
          .upsert([labPayload], {
            onConflict: 'user_id'
          })
          .select();

        if (profileError) {

          alert(`❌ vet profile creation failed: ${profileError.message}`);
        } else {

          // No success alert for vet
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

        // Check if this is an admin (check specific email only)
        let isAdmin = false;
        if (data.user.email === 'glowyboy01@gmail.com') {
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

        // Check database to determine actual user type
        const actualUserType = await getUserTypeFromDatabase(data.user.id);
        
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.first_name || data.user.user_metadata?.clinic_name || 'User',
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

          // Check database to determine actual user type
          const userType = await getUserTypeFromDatabase(session.user.id);

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.first_name || session.user.user_metadata?.clinic_name || 'User',
            type: userType,
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

          // Check database to determine actual user type
          const userType = await getUserTypeFromDatabase(session.user.id);

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.first_name || session.user.user_metadata?.clinic_name || 'User',
            type: userType,
            isAuthenticated: true,
            supabaseUser: session.user
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

        } else if (event === 'SIGNED_OUT') {
          // Handle logout
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('pendingUserData');
          sessionStorage.clear();
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

    // REAL-TIME MONITORING - Zero polling, instant notifications!
    console.log('🔔 Setting up real-time ban monitoring for user:', user.id);

    // Note: We don't subscribe to auth.users because:
    // 1. The auth schema doesn't support Realtime subscriptions
    // 2. User deletion is already handled by onAuthStateChange listener above
    
    // First, check if user is already banned (on mount)
    const checkExistingBan = async () => {
      try {
        const { data: banInfo, error } = await supabase.rpc('get_ban_info', {
          check_user_id: user.id
        });

        if (!error && banInfo?.banned) {
          console.log('🚫 User is already banned, redirecting...');
          
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
        }
      } catch (error) {
        console.error('Error checking existing ban:', error);
      }
    };

    checkExistingBan();
    
    // Then, subscribe to real-time changes for NEW bans
    const banSubscription = supabase
      .channel(`ban-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'banned_users',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🚫 User banned in real-time!', payload);
          
          // User was just banned - handle immediately
          const banInfo = payload.new;
          
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
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'banned_users',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🚫 Ban status updated in real-time!', payload);
          
          // Check if still banned
          const banInfo = payload.new;
          if (banInfo.banned_until && new Date(banInfo.banned_until) > new Date()) {
            // Still banned
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('pendingUserData');
            sessionStorage.clear();
            localStorage.setItem('banInfo', JSON.stringify(banInfo));
            await supabase.auth.signOut();
            window.location.href = '/banned';
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time ban monitoring active for user:', user.id);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error - check if Realtime is enabled in Supabase');
        }
      });

    return () => {
      console.log('🔌 Disconnecting real-time ban monitoring');
      banSubscription.unsubscribe();
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
