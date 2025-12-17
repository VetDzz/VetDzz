import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Trash2, 
  Ban, 
  Shield, 
  AlertTriangle, 
  Eye,
  UserX,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  UserCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata: {
    type?: string;
    full_name?: string;
  };
  banned_until?: string;
  is_banned?: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  birth_date: string;
  user_id: string;
}

interface LabProfile {
  id: string;
  clinic_name: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  is_verified: boolean;
  user_id: string;
}

interface VetProfile {
  id: string;
  clinic_name: string; // Same field names as vet for compatibility
  vet_name: string;
  email: string;
  phone: string;
  address: string;
  is_verified: boolean;
  user_id: string;
}

const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const { checkBanStatus } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clientProfiles, setClientProfiles] = useState<UserProfile[]>([]);
  const [labProfiles, setLabProfiles] = useState<LabProfile[]>([]);
  const [VetProfiles, setVetProfiles] = useState<VetProfile[]>([]);
  const [padRequests, setPadRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [detailSearchTerm, setDetailSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchProfiles();
    fetchBannedUsers();
    fetchPadRequests();
  }, []);

  const fetchBannedUsers = async () => {
    try {
      const { data } = await supabase
        .from('banned_users')
        .select('user_id, banned_until, reason')
        .gt('banned_until', new Date().toISOString());

      setBannedUsers(data?.map(ban => ban.user_id) || []);
    } catch (error) {

      setBannedUsers([]);
    }
  };

  const fetchUsers = async () => {
    try {
      // Use profiles method directly (more reliable)
      await fetchUsersFromProfiles();
    } catch (error) {

      setUsers([]);
    }
  };

  const fetchUsersFromProfiles = async () => {
    try {

      // Fetch users from profiles since we can't access auth.users directly
      const [clientsResult, labsResult, vetsResult] = await Promise.all([
        supabase.from('client_profiles').select('*'),
        supabase.from('vet_profiles').select('*'),
        supabase.from('vet_profiles').select('*')
      ]);

      // Combine and format user data
      const allUsers: User[] = [];

      if (clientsResult.data) {
        clientsResult.data.forEach(profile => {
          allUsers.push({
            id: profile.user_id,
            email: profile.email || 'Email non disponible',
            created_at: profile.created_at,
            last_sign_in_at: profile.created_at,
            user_metadata: {
              type: 'client',
              full_name: profile.full_name
            }
          });
        });
      }

      if (labsResult.data) {
        labsResult.data.forEach(profile => {
          allUsers.push({
            id: profile.user_id,
            email: profile.email,
            created_at: profile.created_at,
            last_sign_in_at: profile.created_at,
            user_metadata: {
              type: 'vet',
              full_name: profile.clinic_name
            }
          });
        });
      }

      if (vetsResult.data) {
        vetsResult.data.forEach(profile => {
          allUsers.push({
            id: profile.user_id,
            email: profile.email,
            created_at: profile.created_at,
            last_sign_in_at: profile.created_at,
            user_metadata: {
              type: 'vet',
              full_name: profile.clinic_name || profile.vet_name
            }
          });
        });
      }

      setUsers(allUsers);

    } catch (error) {

      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des utilisateurs",
        variant: "destructive"
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const [clientsResult, labsResult, vetsResult] = await Promise.all([
        supabase.from('client_profiles').select('*'),
        supabase.from('vet_profiles').select('*'),
        supabase.from('vet_profiles').select('*')
      ]);

      if (clientsResult.data) setClientProfiles(clientsResult.data);
      if (labsResult.data) setLabProfiles(labsResult.data);
      if (vetsResult.data) setVetProfiles(vetsResult.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des profils",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPadRequests = async () => {
    try {

      // Try simple query first without foreign key relationships
      const { data, error } = await supabase
        .from('pad_requests')
        .select('*');
      
      if (error) {

        setPadRequests([]);
        return;
      }

      // If we got data, enrich it with profile information manually
      if (data && data.length > 0) {
        const enrichedRequests = [];
        
        for (const request of data) {
          const enrichedRequest = { ...request };
          
          // Get client profile if client_id exists
          if (request.client_id) {
            try {
              const { data: clientProfile } = await supabase
                .from('client_profiles')
                .select('full_name, email, phone')
                .eq('user_id', request.client_id)
                .single();
              
              if (clientProfile) {
                enrichedRequest.client_profiles = clientProfile;
              }
            } catch (clientError) {

            }
          }
          
          // Get vet profile if vet_id exists
          if (request.vet_id) {
            try {
              const { data: labProfile } = await supabase
                .from('vet_profiles')
                .select('clinic_name, vet_name, email, phone')
                .eq('user_id', request.vet_id)
                .single();
              
              if (labProfile) {
                enrichedRequest.vet_profiles = labProfile;
              }
            } catch (labError) {

            }
          }
          
          enrichedRequests.push(enrichedRequest);
        }
        
        setPadRequests(enrichedRequests);

      } else {
        setPadRequests([]);

      }
    } catch (error) {

      setPadRequests([]);
    }
  };

  const banUser = async (userId: string, duration: number = 30) => {
    try {

      // Try the database function first
      const { data, error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_duration_days: duration,
        ban_reason: `Banni pour ${duration} jours par admin`,
        admin_email: 'glowyboy01@gmail.com'
      });

      if (error || !data?.success) {

        // Fall back to manual banning
        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + duration);

        const { data: insertData, error: manualError } = await supabase
          .from('banned_users')
          .upsert([
            {
              user_id: userId,
              banned_until: banUntil.toISOString(),
              banned_by: 'glowyboy01@gmail.com',
              reason: `Banni pour ${duration} jours par admin`
            }
          ])
          .select();

        if (manualError) {

          throw manualError;
        }

      } else {

      }

      toast({
        title: "🚫 Utilisateur banni avec succès",
        description: `L'utilisateur a été banni pour ${duration} jours`,
      });

      // Refresh the user list and banned users
      await fetchUsers();
      await fetchProfiles();
      await fetchBannedUsers();
    } catch (error: any) {

      toast({
        title: "❌ Erreur de bannissement",
        description: error.message || "Impossible de bannir l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const manualUserDeletion = async (userId: string) => {

    // First, let's check what data exists for this user

    const checks = [
      { name: 'client_profiles', query: supabase.from('client_profiles').select('*').eq('user_id', userId) },
      { name: 'vet_profiles', query: supabase.from('vet_profiles').select('*').eq('user_id', userId) },
      { name: 'pad_requests (client)', query: supabase.from('pad_requests').select('*').eq('client_id', userId) },
      { name: 'pad_requests (lab)', query: supabase.from('pad_requests').select('*').eq('vet_id', userId) },
      { name: 'notifications', query: supabase.from('notifications').select('*').eq('user_id', userId) },
      { name: 'medical_results (client)', query: supabase.from('medical_results').select('*').eq('client_id', userId) },
      { name: 'medical_results (lab)', query: supabase.from('medical_results').select('*').eq('vet_id', userId) },
      { name: 'file_uploads', query: supabase.from('file_uploads').select('*').eq('user_id', userId) },
      { name: 'banned_users', query: supabase.from('banned_users').select('*').eq('user_id', userId) }
    ];

    for (const check of checks) {
      try {
        const { data, error } = await check.query;
        if (error) {

        } else {

          if (data && data.length > 0) {

          }
        }
      } catch (err) {

      }
    }

    // Now perform deletions
    const deletions = [
      { name: 'client_profiles', promise: supabase.from('client_profiles').delete().eq('user_id', userId) },
      { name: 'vet_profiles', promise: supabase.from('vet_profiles').delete().eq('user_id', userId) },
      { name: 'pad_requests (client)', promise: supabase.from('pad_requests').delete().eq('client_id', userId) },
      { name: 'pad_requests (lab)', promise: supabase.from('pad_requests').delete().eq('vet_id', userId) },
      { name: 'notifications', promise: supabase.from('notifications').delete().eq('user_id', userId) },
      { name: 'medical_results (client)', promise: supabase.from('medical_results').delete().eq('client_id', userId) },
      { name: 'medical_results (lab)', promise: supabase.from('medical_results').delete().eq('vet_id', userId) },
      { name: 'file_uploads', promise: supabase.from('file_uploads').delete().eq('user_id', userId) },
      { name: 'banned_users', promise: supabase.from('banned_users').delete().eq('user_id', userId) }
    ];

    let totalDeleted = 0;
    for (const deletion of deletions) {
      try {
        const { error, count } = await deletion.promise;
        if (error) {

        } else {
          const deletedCount = count || 0;
          totalDeleted += deletedCount;

        }
      } catch (err) {

      }
    }

    toast({
      title: "🗑️ Utilisateur supprimé (manuel)",
      description: `${totalDeleted} enregistrements supprimés de la base de données`,
    });
  };

  const deleteUser = async (userId: string) => {
    try {

      // Step 1: Delete all files from storage buckets first

      const buckets = ['avatars', 'medical-results', 'lab-certificates', 'documents'];

      for (const bucket of buckets) {
        try {
          const { data: files } = await supabase.storage
            .from(bucket)
            .list(userId);

          if (files && files.length > 0) {
            const filePaths = files.map(file => `${userId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
              .from(bucket)
              .remove(filePaths);

            if (deleteError) {

            } else {

            }
          }
        } catch (bucketError) {

        }
      }

      // Step 2: DELETE FROM ALL TABLES USING ADMIN FUNCTION

      const { data, error: deleteError } = await supabase.rpc('admin_delete_user_complete', {
        target_user_id: userId
      });

      if (deleteError) {

        toast({
          title: "❌ Erreur de suppression",
          description: `Impossible de supprimer l'utilisateur: ${deleteError.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "🗑️ Utilisateur supprimé complètement",
        description: `${data.records_deleted} enregistrements supprimés de toutes les tables`,
      });

      // Refresh all lists
      await fetchUsers();
      await fetchProfiles();
      await fetchBannedUsers();

    } catch (error: any) {

      toast({
        title: "❌ Erreur de suppression",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const unbanUser = async (userId: string) => {
    try {

      // Try the database function first
      const { data, error } = await supabase.rpc('admin_unban_user', {
        target_user_id: userId,
        admin_email: 'glowyboy01@gmail.com'
      });

      if (error || !data?.success) {

        // Fall back to manual unbanning
        const { error: manualError } = await supabase
          .from('banned_users')
          .delete()
          .eq('user_id', userId);

        if (manualError) {
          throw manualError;
        }

      } else {

      }

      toast({
        title: "✅ Utilisateur débanni avec succès",
        description: "L'utilisateur peut maintenant se connecter",
      });

      // Refresh the banned users list
      await fetchBannedUsers();
      await fetchUsers();
    } catch (error: any) {

      toast({
        title: "❌ Erreur de débannissement",
        description: error.message || "Impossible de débannir l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const getUserProfile = (userId: string) => {
    const clientProfile = clientProfiles.find(p => p.user_id === userId);
    const labProfile = labProfiles.find(p => p.user_id === userId);
    return clientProfile || labProfile;
  };

  const getFilteredUsers = (filter: string) => {
    let filtered = users.filter(user => {
      const profile = getUserProfile(user.id);
      const VetProfile = VetProfiles.find(p => p.user_id === user.id);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = (
        user.email?.toLowerCase().includes(searchLower) ||
        profile?.full_name?.toLowerCase().includes(searchLower) ||
        profile?.phone?.includes(searchTerm) ||
        (profile as LabProfile)?.clinic_name?.toLowerCase().includes(searchLower) ||
        (VetProfile as VetProfile)?.clinic_name?.toLowerCase().includes(searchLower) ||
        (VetProfile as VetProfile)?.vet_name?.toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
      
      switch (filter) {
        case 'clients':
          return clientProfiles.some(cp => cp.user_id === user.id);
        case 'veterinarians':
          return labProfiles.some(lp => lp.user_id === user.id);
        case 'vets':
          return VetProfiles.some(cp => cp.user_id === user.id);
        case 'banned':
          return isUserBanned(user);
        default:
          return true;
      }
    });
    
    return filtered;
  };
  
  const filteredUsers = getFilteredUsers(activeTab);
  
  const getUserPadRequests = (userId: string, asClient: boolean = true) => {
    return padRequests.filter(request => 
      asClient ? request.client_id === userId : request.vet_id === userId
    );
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isUserBanned = (user: User) => {
    return bannedUsers.includes(user.id);
  };

  const fetchUserDetails = async (userId: string) => {
    try {

      // Helper function to safely fetch data and handle RLS errors
      const safeFetch = async (tableName: string, query: any, description: string) => {
        try {
          const result = await query;
          if (result.error) {

            if (result.error.code === 'PGRST116' || result.error.message?.includes('JWT')) {

            }
            return { data: null, error: result.error };
          }

          return result;
        } catch (err) {

          return { data: null, error: err };
        }
      };

      // Fetch ALL possible data for this user with error handling
      const [
        clientProfile,
        labProfile,
        padRequestsAsClient,
        padRequestsAsLab,
        notifications,
        medicalResultsAsClient,
        medicalResultsAsLab,
        banInfo
      ] = await Promise.all([
        safeFetch('client_profiles', supabase.from('client_profiles').select('*').eq('user_id', userId).single(), 'Client profile fetch'),
        safeFetch('vet_profiles', supabase.from('vet_profiles').select('*').eq('user_id', userId).single(), 'Lab profile fetch'),
        safeFetch('pad_requests (client)', supabase.from('pad_requests').select('*').eq('client_id', userId), 'PAD requests as client fetch'),
        safeFetch('pad_requests (lab)', supabase.from('pad_requests').select('*').eq('vet_id', userId), 'PAD requests as lab fetch'),
        safeFetch('notifications', supabase.from('notifications').select('*').eq('user_id', userId), 'Notifications fetch'),
        safeFetch('medical_results (client)', supabase.from('medical_results').select('*').eq('client_id', userId), 'Medical results as client fetch'),
        safeFetch('medical_results (lab)', supabase.from('medical_results').select('*').eq('vet_id', userId), 'Medical results as lab fetch'),
        safeFetch('banned_users', supabase.from('banned_users').select('*').eq('user_id', userId), 'Banned users fetch')
      ]);

      // Try to get basic profile info from our already loaded data as fallback
      let fallbackClientProfile = clientProfiles.find(p => p.user_id === userId);
      let fallbackLabProfile = labProfiles.find(p => p.user_id === userId);

      const details = {
        userId,
        clientProfile: clientProfile.data || fallbackClientProfile || null,
        labProfile: labProfile.data || fallbackLabProfile || null,
        padRequestsAsClient: padRequestsAsClient.data || [],
        padRequestsAsLab: padRequestsAsLab.data || [],
        notifications: notifications.data || [],
        medicalResultsAsClient: medicalResultsAsClient.data || [],
        medicalResultsAsLab: medicalResultsAsLab.data || [],
        banInfo: banInfo.data || [],
        totalPadRequests: (padRequestsAsClient.data?.length || 0) + (padRequestsAsLab.data?.length || 0),
        totalNotifications: notifications.data?.length || 0,
        totalMedicalResults: (medicalResultsAsClient.data?.length || 0) + (medicalResultsAsLab.data?.length || 0),
        isBanned: (banInfo.data && banInfo.data.length > 0) || bannedUsers.includes(userId),
        userType: (clientProfile.data || fallbackClientProfile) ? 'Client' : 
                 (labProfile.data || fallbackLabProfile) ? 'Vétérinaire' : 'Inconnu',
        errors: {
          clientProfileError: clientProfile.error,
          labProfileError: labProfile.error,
          padRequestsAsClientError: padRequestsAsClient.error,
          padRequestsAsLabError: padRequestsAsLab.error,
          notificationsError: notifications.error,
          medicalResultsAsClientError: medicalResultsAsClient.error,
          medicalResultsAsLabError: medicalResultsAsLab.error,
          banInfoError: banInfo.error
        }
      };

      setUserDetails(details);
      setShowUserDetails(true);
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'utilisateur",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panneau d'Administration</h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">Gestion des utilisateurs et modération</p>
                </div>
              </div>
            <Button
              onClick={async () => {

                // Clear admin login logs
                try {
                  await supabase.auth.signOut();
                } catch (error) {

                }

                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to auth
                window.location.href = '/auth';
              }}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              <span>Déconnexion</span>
            </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-blue-700">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Clients</p>
                    <p className="text-2xl font-bold text-green-700">{clientProfiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Vétérinaires</p>
                    <p className="text-2xl font-bold text-purple-700">{labProfiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">vets</p>
                    <p className="text-2xl font-bold text-indigo-700">{VetProfiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Rechercher des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Rechercher par email, nom, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Users List with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Gestion des Utilisateurs
              </CardTitle>
              <CardDescription>
                Filtrez et gérez les utilisateurs par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Tous ({users.length})
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Clients ({clientProfiles.length})
                  </TabsTrigger>
                  <TabsTrigger value="veterinarians" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Vétérinaires ({labProfiles.length})
                  </TabsTrigger>
                  <TabsTrigger value="vets" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    vets ({VetProfiles.length})
                  </TabsTrigger>
                  <TabsTrigger value="banned" className="flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Bannis ({users.filter(isUserBanned).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Affichage de {filteredUsers.length} utilisateur(s)
                      </p>
                    </div>
                    
                    {filteredUsers.map((user) => {
                      const profile = getUserProfile(user.id);
                      const isLab = labProfiles.some(lab => lab.user_id === user.id);
                      const isBanned = isUserBanned(user);
                      const clientRequests = getUserPadRequests(user.id, true);
                      const labRequests = getUserPadRequests(user.id, false);
                      const totalRequests = clientRequests.length + labRequests.length;

                      return (
                        <div key={user.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300">
                          {/* User Info Section */}
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <div className="flex items-center gap-2">
                                {isLab ? <Building2 className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-green-600" />}
                                <span className="font-semibold text-base sm:text-lg text-gray-800">
                                  {profile?.full_name || (profile as LabProfile)?.clinic_name || 'Nom non disponible'}
                                </span>
                              </div>
                              <Badge variant={isLab ? "secondary" : "default"} className="text-xs font-medium">
                                {isLab ? 'Vétérinaire' : 'Client'}
                              </Badge>
                              {isBanned && (
                                <Badge variant="destructive" className="text-xs font-medium animate-pulse">
                                  <Ban className="w-3 h-3 mr-1" />
                                  Banni
                                </Badge>
                              )}
                              {totalRequests > 0 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {totalRequests} PAD
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0 text-blue-500" />
                                <span className="truncate font-medium">{user.email}</span>
                              </div>
                              {profile?.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 flex-shrink-0 text-green-500" />
                                  <span className="font-medium">{profile.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 flex-shrink-0 text-purple-500" />
                                <span>Inscrit: {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                              {profile?.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 flex-shrink-0 text-red-500" />
                                  <span className="truncate">{profile.address}</span>
                                </div>
                              )}
                            </div>

                            {/* Quick PAD Stats */}
                            {totalRequests > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {isLab && labRequests.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
                                    <Building2 className="w-3 h-3 text-blue-600" />
                                    <span>Reçues: {labRequests.length}</span>
                                    <span className="text-green-600">({labRequests.filter(r => r.status === 'accepted').length} acceptées)</span>
                                  </div>
                                )}
                                {!isLab && clientRequests.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded">
                                    <Users className="w-3 h-3 text-green-600" />
                                    <span>Envoyées: {clientRequests.length}</span>
                                    <span className="text-green-600">({clientRequests.filter(r => r.status === 'accepted').length} acceptées)</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Section */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchUserDetails(user.id)}
                                className="flex items-center gap-2 px-4 py-2 h-9 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Voir Détails</span>
                              </Button>

                              {isBanned ? (
                                <Button
                                  size="sm"
                                  onClick={() => unbanUser(user.id)}
                                  className="flex items-center gap-2 px-4 py-2 h-9 bg-green-400 hover:bg-green-500 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <span>✅</span>
                                  <span>Débannir</span>
                                </Button>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2 px-4 py-2 h-9 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 transition-all duration-200"
                                    >
                                      <Ban className="w-4 h-4" />
                                      <span>Bannir</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Bannir l'utilisateur</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir bannir cet utilisateur pour 30 jours ?
                                        Il ne pourra plus se connecter pendant cette période.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => banUser(user.id)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Bannir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 px-4 py-2 h-9 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Supprimer</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <AlertTriangle className="w-5 h-5 text-red-600" />
                                      SUPPRESSION COMPLÈTE DE L'UTILISATEUR
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                      <div className="font-bold text-red-600">⚠️ ATTENTION: SUPPRESSION TOTALE ET IRRÉVERSIBLE</div>
                                      <div>Cette action supprimera TOUT ce qui concerne cet utilisateur :</div>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li><strong>Profils</strong> - Client/Vétérinaire</li>
                                        <li><strong>Demandes PAD</strong> - Envoyées et reçues</li>
                                        <li><strong>Notifications</strong> - Toutes les notifications</li>
                                        <li><strong>Résultats médicaux</strong> - Tous les résultats</li>
                                        <li><strong>Fichiers</strong> - Photos, PDFs, documents</li>
                                        <li><strong>Historique</strong> - Logs et sessions</li>
                                        <li><strong>Références</strong> - Toutes les connexions</li>
                                      </ul>
                                      <div className="font-bold text-red-600">L'utilisateur sera complètement effacé du système.</div>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer définitivement
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun utilisateur trouvé pour ce filtre</p>
                        <p className="text-xs mt-2">Essayez un autre onglet ou modifiez votre recherche</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Comprehensive User Details Dialog */}
          <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Détails Complets de l'Utilisateur
                </DialogTitle>
                <DialogDescription>
                  Toutes les informations disponibles sur cet utilisateur
                </DialogDescription>
              </DialogHeader>

              {userDetails && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations de Base</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>ID Utilisateur:</strong> {userDetails.userId}</div>
                        <div><strong>Type:</strong> {userDetails.userType}</div>
                        <div><strong>Statut:</strong> {userDetails.isBanned ? '🚫 BANNI' : '✅ Actif'}</div>
                        <div><strong>Total PAD:</strong> {userDetails.totalPadRequests}</div>
                        <div><strong>Total Notifications:</strong> {userDetails.totalNotifications}</div>
                        <div><strong>Total Résultats:</strong> {userDetails.totalMedicalResults}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Client Profile */}
                  {userDetails.clientProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profil Client</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Nom complet:</strong> {userDetails.clientProfile.full_name}</div>
                          <div><strong>Email:</strong> {userDetails.clientProfile.email}</div>
                          <div><strong>Téléphone:</strong> {userDetails.clientProfile.phone}</div>
                          <div><strong>Date de naissance:</strong> {userDetails.clientProfile.birth_date}</div>
                          <div className="col-span-2"><strong>Adresse:</strong> {userDetails.clientProfile.address}</div>
                          <div><strong>Créé le:</strong> {new Date(userDetails.clientProfile.created_at).toLocaleString('fr-FR')}</div>
                          <div><strong>Mis à jour:</strong> {new Date(userDetails.clientProfile.updated_at).toLocaleString('fr-FR')}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* vet Profile */}
                  {userDetails.labProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profil Vétérinaire</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Nom de la clinique:</strong> {userDetails.labProfile.clinic_name}</div>
                          <div><strong>Email:</strong> {userDetails.labProfile.email}</div>
                          <div><strong>Téléphone:</strong> {userDetails.labProfile.phone}</div>
                          <div><strong>SIRET:</strong> {userDetails.labProfile.siret}</div>
                          <div className="col-span-2"><strong>Adresse:</strong> {userDetails.labProfile.address}</div>
                          <div><strong>Vérifié:</strong> {userDetails.labProfile.is_verified ? '✅ Oui' : '❌ Non'}</div>
                          <div><strong>Créé le:</strong> {new Date(userDetails.labProfile.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Ban Information */}
                  {userDetails.banInfo.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-red-600">Informations de Bannissement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userDetails.banInfo.map((ban: any, index: number) => (
                          <div key={index} className="space-y-2 text-sm">
                            <div><strong>Banni jusqu'au:</strong> {new Date(ban.banned_until).toLocaleString('fr-FR')}</div>
                            <div><strong>Banni par:</strong> {ban.banned_by}</div>
                            <div><strong>Raison:</strong> {ban.reason}</div>
                            <div><strong>Date du ban:</strong> {new Date(ban.created_at).toLocaleString('fr-FR')}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* PAD Requests for Clients */}
                  {userDetails.clientProfile && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Demandes PAD Client ({userDetails.padRequestsAsClient.length})</CardTitle>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Rechercher vétérinaires..."
                              value={detailSearchTerm}
                              onChange={(e) => setDetailSearchTerm(e.target.value)}
                              className="max-w-xs text-sm"
                            />
                          </div>
                        </div>
                        <CardDescription>
                          Vétérinaires contactés par ce client
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {userDetails.padRequestsAsClient.length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {userDetails.padRequestsAsClient
                              .filter((request: any) => {
                                const searchLower = detailSearchTerm.toLowerCase();
                                const labProfile = labProfiles.find(lab => lab.user_id === request.vet_id);
                                return !searchLower || 
                                  labProfile?.clinic_name?.toLowerCase().includes(searchLower) ||
                                  labProfile?.email?.toLowerCase().includes(searchLower) ||
                                  request.status?.toLowerCase().includes(searchLower);
                              })
                              .map((request: any, index: number) => {
                                const labProfile = labProfiles.find(lab => lab.user_id === request.vet_id);
                                return (
                                  <div key={index} className={`border rounded-lg p-3 ${getStatusBadgeColor(request.status)} bg-opacity-10`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-sm">
                                          {labProfile?.clinic_name || 'Vétérinaire inconnu'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(request.status)}
                                        <Badge className={`text-xs ${getStatusBadgeColor(request.status)}`}>
                                          {request.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                      <div><strong>Email:</strong> {labProfile?.email || 'N/A'}</div>
                                      <div><strong>Téléphone:</strong> {labProfile?.phone || 'N/A'}</div>
                                      <div><strong>Date demande:</strong> {new Date(request.created_at).toLocaleDateString('fr-FR')}</div>
                                      <div><strong>SIRET:</strong> {labProfile?.siret || 'N/A'}</div>
                                    </div>
                                    {request.message && (
                                      <div className="mt-2 text-xs">
                                        <strong>Message:</strong> {request.message}
                                      </div>
                                    )}
                                    {labProfile?.address && (
                                      <div className="mt-2 text-xs">
                                        <strong>Adresse:</strong> {labProfile.address}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            }
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune demande PAD envoyée</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* PAD Requests for Veterinarians */}
                  {userDetails.labProfile && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Demandes PAD Vétérinaire ({userDetails.padRequestsAsLab.length})</CardTitle>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Rechercher clients..."
                              value={detailSearchTerm}
                              onChange={(e) => setDetailSearchTerm(e.target.value)}
                              className="max-w-xs text-sm"
                            />
                          </div>
                        </div>
                        <CardDescription>
                          Clients qui ont contacté ce vétérinaire
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {userDetails.padRequestsAsLab.length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {userDetails.padRequestsAsLab
                              .filter((request: any) => {
                                const searchLower = detailSearchTerm.toLowerCase();
                                const clientProfile = clientProfiles.find(client => client.user_id === request.client_id);
                                return !searchLower || 
                                  clientProfile?.full_name?.toLowerCase().includes(searchLower) ||
                                  clientProfile?.email?.toLowerCase().includes(searchLower) ||
                                  clientProfile?.phone?.includes(searchTerm) ||
                                  request.status?.toLowerCase().includes(searchLower);
                              })
                              .map((request: any, index: number) => {
                                const clientProfile = clientProfiles.find(client => client.user_id === request.client_id);
                                return (
                                  <div key={index} className={`border rounded-lg p-3 ${getStatusBadgeColor(request.status)} bg-opacity-10`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-sm">
                                          {clientProfile?.full_name || request.client_name || 'Client inconnu'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(request.status)}
                                        <Badge className={`text-xs ${getStatusBadgeColor(request.status)}`}>
                                          {request.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                      <div><strong>Email:</strong> {clientProfile?.email || 'N/A'}</div>
                                      <div><strong>Téléphone:</strong> {clientProfile?.phone || request.client_phone || 'N/A'}</div>
                                      <div><strong>Date demande:</strong> {new Date(request.created_at).toLocaleDateString('fr-FR')}</div>
                                      <div><strong>Date naissance:</strong> {clientProfile?.birth_date ? new Date(clientProfile.birth_date).toLocaleDateString('fr-FR') : 'N/A'}</div>
                                    </div>
                                    {request.message && (
                                      <div className="mt-2 text-xs">
                                        <strong>Message:</strong> {request.message}
                                      </div>
                                    )}
                                    {request.client_location_lat && (
                                      <div className="mt-2 text-xs">
                                        <strong>Position client:</strong> {request.client_location_lat}, {request.client_location_lng}
                                      </div>
                                    )}
                                    {(clientProfile?.address || request.client_address) && (
                                      <div className="mt-2 text-xs">
                                        <strong>Adresse:</strong> {clientProfile?.address || request.client_address}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            }
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune demande PAD reçue</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Notifications */}
                  {userDetails.notifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notifications ({userDetails.notifications.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {userDetails.notifications.map((notif: any, index: number) => (
                            <div key={index} className="border-l-4 border-yellow-400 pl-3 text-sm">
                              <div><strong>Titre:</strong> {notif.title}</div>
                              <div><strong>Message:</strong> {notif.message}</div>
                              <div><strong>Lu:</strong> {notif.read ? '✅ Oui' : '❌ Non'}</div>
                              <div><strong>Date:</strong> {new Date(notif.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Medical Results */}
                  {(userDetails.medicalResultsAsClient.length > 0 || userDetails.medicalResultsAsLab.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Résultats Médicaux ({userDetails.totalMedicalResults})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {userDetails.medicalResultsAsClient.map((result: any, index: number) => (
                            <div key={`client-${index}`} className="border-l-4 border-purple-400 pl-3 text-sm">
                              <div><strong>Type:</strong> Résultat reçu (Client)</div>
                              <div><strong>Titre:</strong> {result.title}</div>
                              <div><strong>Description:</strong> {result.description}</div>
                              <div><strong>Date:</strong> {new Date(result.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                          {userDetails.medicalResultsAsLab.map((result: any, index: number) => (
                            <div key={`lab-${index}`} className="border-l-4 border-indigo-400 pl-3 text-sm">
                              <div><strong>Type:</strong> Résultat envoyé (Vétérinaire)</div>
                              <div><strong>Titre:</strong> {result.title}</div>
                              <div><strong>Description:</strong> {result.description}</div>
                              <div><strong>Date:</strong> {new Date(result.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Raw Data (for debugging) */}
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Données Brutes (Debug)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                        {JSON.stringify(userDetails, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
