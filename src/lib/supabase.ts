import { createClient } from '@supabase/supabase-js';

// Supabase project credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Configure Supabase client with optimizations for high-load scenarios
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
    // Persist session across browser restarts
    persistSession: true,
    // Don't detect session from URL (security)
    detectSessionInUrl: false,
  },
  db: {
    // Use a more efficient schema cache
    schema: 'public',
  },
  // Enable real-time but with connection limits
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  user_type: 'client' | 'vet';
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  emergency_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface VetProfile {
  id: string;
  user_id: string;
  clinic_name: string;
  license_number: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: string;
  opening_days?: string[];
  services_offered?: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestRequest {
  id: string;
  client_id: string;
  vet_id?: string;
  test_types: string[];
  status: 'pending' | 'assigned' | 'collected' | 'processing' | 'completed' | 'cancelled';
  collection_type: 'home' | 'lab';
  collection_address?: string;
  collection_date?: string;
  collection_time?: string;
  special_instructions?: string;
  priority: 'normal' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  test_request_id: string;
  vet_id: string;
  client_id: string;
  test_name: string;
  result_value?: string;
  result_unit?: string;
  reference_range?: string;
  status: 'normal' | 'abnormal' | 'critical';
  notes?: string;
  result_file_url?: string;
  validated_by: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_entity_type?: 'test_request' | 'test_result';
  related_entity_id?: string;
  created_at: string;
}

// Authentication functions
export const signUp = async (email: string, password: string, userType: 'client' | 'vet', additionalData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: userType,
        first_name: additionalData.firstName,
        last_name: additionalData.lastName,
        clinic_name: additionalData.labName,
        ...additionalData
      }
    }
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile functions
export const createClientProfile = async (profileData: Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('client_profiles')
    .insert([profileData])
    .select()
    .single();
  
  return { data, error };
};

export const createVetProfile = async (profileData: Omit<VetProfile, 'id' | 'created_at' | 'updated_at' | 'is_verified'>) => {
  const { data, error } = await supabase
    .from('vet_profiles')
    .insert([{ ...profileData, is_verified: false }])
    .select()
    .single();
  
  return { data, error };
};

export const getClientProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const getVetProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('vet_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

// Test request functions
export const createTestRequest = async (requestData: Omit<TestRequest, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('test_requests')
    .insert([requestData])
    .select()
    .single();
  
  return { data, error };
};

export const getTestRequests = async (userId: string, userType: 'client' | 'vet') => {
  let query = supabase.from('test_requests').select(`
    *,
    client_profiles!inner(first_name, last_name, phone),
    vet_profiles(clinic_name, phone)
  `);
  
  if (userType === 'client') {
    query = query.eq('client_id', userId);
  } else {
    query = query.eq('vet_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

export const updateTestRequestStatus = async (requestId: string, status: TestRequest['status']) => {
  const { data, error } = await supabase
    .from('test_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();
  
  return { data, error };
};

// Test result functions
export const createTestResult = async (resultData: Omit<TestResult, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('test_results')
    .insert([resultData])
    .select()
    .single();
  
  return { data, error };
};

export const getTestResults = async (userId: string, userType: 'client' | 'vet') => {
  let query = supabase.from('test_results').select(`
    *,
    test_requests!inner(
      client_id,
      test_types,
      collection_date
    ),
    vet_profiles!inner(clinic_name)
  `);
  
  if (userType === 'client') {
    query = query.eq('client_id', userId);
  } else {
    query = query.eq('vet_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

// Notification functions
export const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();
  
  return { data, error };
};

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();

  return { data, error };
};

export const deleteNotification = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .select()
    .single();

  return { data, error };
};

// Real-time user monitoring
export const subscribeToUserChanges = (userId: string, onUserDeleted: () => void) => {
  // Monitor auth.users table for user deletion
  const subscription = supabase
    .channel('user-changes')
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'auth',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => {

        onUserDeleted();
      }
    )
    .subscribe();

  return subscription;
};

// Check if user still exists
export const checkUserExists = async (userId: string) => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user || data.user.id !== userId) {
    return false;
  }

  return true;
};

// Password reset functions
export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  
  return { error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  return { data, error };
};

// vet and vet search functions
export const searchLaboratories = async (city?: string, services?: string[]) => {
  // Search both laboratories and vets using the combined view
  let query = supabase
    .from('all_service_providers')
    .select('*');
  
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  
  if (services && services.length > 0) {
    query = query.overlaps('services_offered', services);
  }
  
  const { data, error } = await query;
  return { data, error };
};

// Function to get only laboratories
export const searchOnlyLaboratories = async (city?: string, services?: string[]) => {
  let query = supabase
    .from('vet_profiles')
    .select('*');
  
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  
  if (services && services.length > 0) {
    query = query.overlaps('services_offered', services);
  }
  
  const { data, error } = await query;
  return { data, error };
};

// Function to get only vets
export const searchOnlyvets = async (city?: string, services?: string[]) => {
  let query = supabase
    .from('vet_profiles')
    .select('*');
  
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  
  if (services && services.length > 0) {
    query = query.overlaps('services_offered', services);
  }
  
  const { data, error } = await query;
  return { data, error };
};
